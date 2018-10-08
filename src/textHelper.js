'use strict';
//##########################################################
// This provides a repository for large text messages that
// might be reused in multiple intents
//##########################################################
var textHelper = (function () {
    return {
        completeHelp: 'Here are some things you can say,'
        + ' add Kris.'
        + ' tell Kris to wash the dishes.'
        + ' what are the tasks for Kris.'
        + ' remove task 1 for Kris.'
        + ' clear tasks for Kris.'
        + ' clear.'
        + ' and exit.',
	    nextHelp: 'You can give a person a task, add a person, get the list of tasks, or say help. What would you like?'
	};
})();
module.exports = textHelper;
