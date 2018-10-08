'use strict';
var AWS = require('aws-sdk');

//##########################################################
// This abstracts the storage of the task lists. The current
// implementation keeps them in DynamoDB
//##########################################################
var storage = (function () {
    var dynamodb = new AWS.DynamoDB({apiVersion: '2012-08-10'});

    function Tasks(session, data) {
        if (data) {
            this.data = data;
        } else {
            this.data = {
                persons: [],
                tasks: {}
            };
        }
        this._session = session;
    }

    Tasks.prototype = {
        isEmptyTaskList: function () {
            var allEmpty = true;
            var taskData = this.data;
            taskData.persons.forEach(function (person) {
                if (taskData.tasks[person] !== 0) {
                    allEmpty = false;
                }
            });
            return allEmpty;
        },
        save: function (callback) {
            this._session.attributes.currentTasks = this.data;
            dynamodb.putItem({
                TableName: 'DayManagerUserData',
                Item: {
                    CustomerId: {
                        S: this._session.user.userId
                    },
                    Data: {
                        S: JSON.stringify(this.data)
                    }
                }
            }, function (err, data) {
                if (err) {
                    console.log(err, err.stack);
                }
                if (callback) {
                    callback();
                }
            });
        }
    };

    return {
        loadTasks: function (session, callback) {
            if (session.attributes.currentTasks) {
                console.log('get tasks from session=' + session.attributes.currentTasks);
                callback(new Tasks(session, session.attributes.currentTasks));
			    return;
			}
			dynamodb.getItem({
			    TableName: 'DayManagerUserData',
			    Key: {
			        CustomerId: {
			            S: session.user.userId
			        }
			    }
			}, function (err, data) {
			    var currentTasks;
			    if (err) {
			        console.log(err, err.stack);
			        currentTasks = new Tasks(session);
			        session.attributes.currentTasks = currentTasks.data;
			        callback(currentTasks);
			    } else if (data.Item === undefined) {
			        currentTasks = new Tasks(session);
			        session.attributes.currentTasks = currentTasks.data;
			        callback(currentTasks);
			    } else {
			        console.log('get tasks from dynamodb=' + data.Item.Data.S);
			        currentTasks = new Tasks(session, JSON.parse(data.Item.Data.S));
			        session.attributes.currentTasks = currentTasks.data;
			        callback(currentTasks);
			    }
			});
		},
		newTasks: function (session) {
		    return new Tasks(session);
		}
	};
})();
module.exports = storage;
