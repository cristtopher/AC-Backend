/**
 * Company model events
 */

'use strict';

import {EventEmitter} from 'events';
import Company from './company.model';
var CompanyEvents = new EventEmitter();

// Set max event listeners (0 == unlimited)
CompanyEvents.setMaxListeners(0);

// Model events
var events = {
  save: 'save',
  remove: 'remove'
};

// Register the event emitter to the model events
for(var e in events) {
  let event = events[e];
  Company.schema.post(e, emitEvent(event));
}

function emitEvent(event) {
  return function(doc) {
    CompanyEvents.emit(`${event}:${doc._id}`, doc);
    CompanyEvents.emit(event, doc);
  };
}

export default CompanyEvents;
