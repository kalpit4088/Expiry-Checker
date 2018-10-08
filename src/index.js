'use strict';
var DayManager = require('./dayManager');

//##########################################################
// Entry point for the skill Lambda function
//##########################################################
exports.handler = function(event, context) {
    var dayManager = new DayManager();
    dayManager.execute(event, context);
}
