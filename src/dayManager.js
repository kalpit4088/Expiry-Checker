'use strict';
var AlexaSkill = require('./AlexaSkill'),
    eventHandlers = require('./eventHandlers'),
    intentHandlers = require('./intentHandlers');

var APP_ID = undefined;
var skillContext = {}

var DayManager = function() {
    AlexaSkill.call(this);
    skillContext.needMoreHelp = true;
};


DayManager.prototype = Object.create(AlexaSkill.prototype);
DayManager.prototype.constructor = DayManager;

eventHandlers.register(DayManager.prototype.eventHandlers, skillContext);
intentHandlers.register(DayManager.prototype.intentHandlers, skillContext);

module.exports = DayManager;
