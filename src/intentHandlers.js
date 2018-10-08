'use strict';
var textHelper = require('./textHelper'),
    storage = require('./storage');

var registerIntentHandlers = function (intentHandlers, skillContext) {
    //##########################################################
    // Add Person is used to explicitly create a task list for
    // a person.
    // Slots:
    //   * Person
    //##########################################################
    intentHandlers.AddObjectIntent = function (intent, session, response) {
        if (intent.slots.Object.value) {
        var newObjectName = intent.slots.Object.value;
        if (!newObjectName) {
            response.ask('OK. Which object do you want to add?', 'Which object do you want to add?');
            return;
        }
        storage.loadTasks(session, function (currentTasks) {
            var speechOutput,
                reprompt;
            if (currentTasks.data.tasks[newObjectName] !== undefined) {
                speechOutput = newObjectName + ' has already been added.';

                if (skillContext.needMoreHelp) {
                    response.ask(speechOutput + ' What else?', 'What else?');
                } else {
                    response.tell(speechOutput);
                }
                return;
            }
            speechOutput = newObjectName + ' has been added. ';
            currentTasks.data.persons.push(newObjectName);
            currentTasks.data.tasks[newObjectName] = [];
            if (skillContext.needMoreHelp) {
                if (currentTasks.data.persons.length == 1) {
                    speechOutput += 'You can say, I am Done Adding Object. Now what else do you want to add?';
                    reprompt = textHelper.nextHelp;
                } else {
                    speechOutput += 'What is your next object?';
                    reprompt = textHelper.nextHelp;
                }
            }
            currentTasks.save(function () {
                if (reprompt) {
                    response.ask(speechOutput, reprompt);
                } else {
                    response.tell(speechOutput);
                }
            });
        });
    }
    else
    {
        var speechOutput,reprompt;
        speechOutput = 'Please tell me the name of the object.';
        reprompt = 'Please tell me the naame of the object to me.';
         if (reprompt) {
                    response.ask(speechOutput, reprompt);
                } else {
                    response.tell(speechOutput);
                }
    }
    };

    //##########################################################
    // Add Task is used to append a task to a specific person's
    // task list
    // Slots:
    //   * Person
    //   * Task
    //##########################################################
    intentHandlers.AddDateIntent = function (intent, session, response) {
        if (intent.slots.Object.value) {
        var personName = intent.slots.Object.value,
            date = intent.slots.Dates.value;
        if (!personName) {
            response.ask('sorry, I did not hear the object\'s name, please say that again', 'Please say the name again');
            return;
        }
        storage.loadTasks(session, function (currentTasks) {
            var targetPerson,
                speechOutput = '';
            for (var i = 0; i < currentTasks.data.persons.length; i++) {
                if (currentTasks.data.persons[i] === personName) {
                    targetPerson = currentTasks.data.persons[i];
                    break;
                }
            }
            if (!targetPerson) {
                // If we dont' already know this person, go ahead
                // and implicitly create a new list for them. We don't
                // want to force them to use an extra step to add them.
                //
                // Tradeoff: Alexa may mis-hear a name, resulting in an extra
                // list
                speechOutput = personName + ' has been added. ';
                currentTasks.data.persons.push(personName);
                targetPerson = personName;
                currentTasks.data.tasks[targetPerson] = [];
            }
            currentTasks.data.tasks[targetPerson].push(date);

            speechOutput += ' added date ' + date + ' for ' + targetPerson + '. ';
            currentTasks.save(function () {
                response.ask(speechOutput);
            });
        });
    }
    else
    {
        var speechOutput = 'Please tell me the expiry date.';
            response.tell(speechOutput);
    }
    };

    //##########################################################
    // List Tasks is used to get the list of tasks for a particular
    // person
    // Slots:
    //   * Person
    //##########################################################
    intentHandlers.ListExpiryIntent = function (intent, session, response) {
        if (intent.slots.Object.value) {
        var personName = intent.slots.Object.value;
        if (!personName) {
            response.ask('sorry, I did not hear the object\'s name, please say that again', 'Please say the name again');
            return;
        }
        storage.loadTasks(session, function (currentTasks) {
            var targetPerson,
                speechOutput = '',
                taskCount = 0,
                cardContent = '';
            if (currentTasks.data.persons.length < 1) {
                response.ask('sorry, no object has been added yet, what can I do for you?', 'what can I do for you?');
                return;
            }
            for (var i = 0; i < currentTasks.data.persons.length; i++) {
                if (currentTasks.data.persons[i] === personName) {
                    targetPerson = currentTasks.data.persons[i];
                    break;
                }
            }
            if (!targetPerson) {
                response.ask('Sorry, I can\'t find object ' + personName + '. What else?', 'I can\'t find ' + personName + '. What else?');
                return;
            }
            // We will output the task list both by voice, and as a card in the
            // Alexa app.
            currentTasks.data.tasks[targetPerson].forEach(function (date) {
                taskCount += 1;
                speechOutput += 'Date ' + taskCount + ' is ' + date + '. ';
                cardContent += 'Number ' + taskCount + ' - ' + date + '\n';
            });
            speechOutput += 'What else?';
            response.ask(speechOutput, "Dates for " + targetPerson, cardContent);
        });
    }
    else
    {
        var speechOutput = 'Please tell me the name of the object.';
            response.tell(speechOutput);
    }
    };

    // //##########################################################
    // // Remove Task is used to remove a single task from a person's
    // // list, by task number
    // // Slots:
    // //   * Person
    // //   * Number
    // //##########################################################
    // intentHandlers.RemoveTaskIntent = function (intent, session, response) {
    //     var personName = intent.slots.Person.value,
    //         taskNumber = intent.slots.Number,
    //         taskIndex = parseInt(taskNumber.value);
    //     if (!personName) {
    //         response.ask('sorry, I did not hear the person\'s name, please say that again', 'Please say the name again');
    //         return;
    //     }
    //     storage.loadTasks(session, function (currentTasks) {
    //         var targetPerson,
    //             taskNumber,
    //             speechOutput = '';
    //         if (currentTasks.data.persons.length < 1) {
    //             response.ask('sorry, no one has been added yet, what can I do for you?', 'what can I do for you?');
    //             return;
    //         }
    //         for (var i = 0; i < currentTasks.data.persons.length; i++) {
    //             if (currentTasks.data.persons[i] === personName) {
    //                 targetPerson = currentTasks.data.persons[i];
    //                 break;
    //             }
    //         }
    //         if (!targetPerson) {
    //             response.ask('Sorry, I don\'t know person ' + personName + '. What else?', 'I don\'t know ' + personName + '. What else?');
    //             return;
    //         }
    //         if (taskIndex < 1 || currentTasks.data.tasks[targetPerson].length < taskIndex) {
    //             response.ask('sorry, I didn\'t find task ' + taskIndex +' for ' + targetPerson + '. What else?');
    //             return;
    //         }
    //         currentTasks.data.tasks[targetPerson].splice(taskIndex - 1, 1);
    //         speechOutput += 'Removed item ' + taskIndex + ' for ' + targetPerson + '. ';
    //         currentTasks.save(function () {
    //             response.ask(speechOutput+' What else ?');
    //         });
    //     });
    // };

    //##########################################################
    // Clear Tasks clears out the entire task list of a particular
    // person
    // Slots:
    //   * Person
    //##########################################################
    intentHandlers.ClearExpiryIntent = function (intent, session, response) {
        if (intent.slots.Object.value) {
        var personName = intent.slots.Object.value;
        if (!personName) {
            response.ask('sorry, I did not hear the object\'s name, please say that again', 'Please say the name again');
            return;
        }
        storage.loadTasks(session, function (currentTasks) {
            var targetPerson,
                speechOutput = '',
                taskCount = 0,
                cardContent = '';
            if (currentTasks.data.persons.length < 1) {
                response.ask('sorry, no object has been added yet, what can I do for you?', 'what can I do for you?');
                return;
            }
            for (var i = 0; i < currentTasks.data.persons.length; i++) {
                if (currentTasks.data.persons[i] === personName) {
                    targetPerson = currentTasks.data.persons[i];
                    break;
                }
            }
            if (!targetPerson) {
                response.ask('Sorry, I can\'t find the object ' + personName + '. What else?', 'I can\'t find ' + personName + '. What else?');
                return;
            }
            currentTasks.data.tasks[targetPerson] = []
            speechOutput += 'Dates cleared for ' + targetPerson;
            currentTasks.save(function () {
               response.ask(speechOutput+' What else ?');
            });
        });
    }
    else
    {
        var speechOutput = 'Please tell me the name of the object.';
            response.tell(speechOutput);    
    }
    };

    //##########################################################
    // Reset puts us back in a clean, freshly initialized state with
    // no task lists
    //##########################################################
    intentHandlers.ResetIntent = function (intent, session, response) {
        storage.loadTasks(session, function (currentTasks) {
            if (currentTasks.data.persons.length === 0) {
                response.ask('Expiry date list reset. What would you like to add?',
                    'Please tell me what you would like to add?');
                return;
            }
            currentTasks.data.persons = []
            currentTasks.data.tasks = {}
            currentTasks.save(function () {
                var speechOutput = 'All expiry date lists reset. ';
                if (skillContext.needMoreHelp) {
                    speechOutput += 'You can add expiry date for an object, add another object, or exit. What would you like?';
                    var repromptText = 'You can add expiry date for an object, add another object, or exit. What would you like?';
                    response.ask(speechOutput, repromptText);
                } else {
                    response.tell(speechOutput);
                }
            });
        });
    };

    //##########################################################
    // Standard help message
    //##########################################################
    intentHandlers['AMAZON.HelpIntent'] = function (intent, session, response) {
        var speechOutput = textHelper.completeHelp;
        if (skillContext.needMoreHelp) {
            response.ask(textHelper.completeHelp + ' So, how can I help?', 'How can I help?');
        } else {
            response.tell(textHelper.completeHelp);
        }
    };

    //##########################################################
    // Standard cancel message
    //##########################################################
    intentHandlers['AMAZON.CancelIntent'] = function (intent, session, response) {
        if (skillContext.needMoreHelp) {
            response.tell('Okay. Whenever you\'re ready, you can start assigning tasks to the people in your family.');
        } else {
            response.tell('');
        }
    };

    //##########################################################
    // Standard stop message
    //##########################################################
    intentHandlers['AMAZON.StopIntent'] = function (intent, session, response) {
        if (skillContext.needMoreHelp) {
            response.tell('Okay. Whenever you\'re ready, you can start assigning tasks to the people in your family.')
        } else {
            response.tell('');
        }
    };
};

exports.register = registerIntentHandlers;
