/**
 * Pda model events
 */

'use strict';

import {EventEmitter} from 'events';
import Pda from './company.model';
var PdaEvents = new EventEmitter();

// Set max event listeners (0 == unlimited)
PdaEvents.setMaxListeners(0);

// Model events
var events = {
  save: 'save',
  remove: 'remove'
};

// Register the event emitter to the model events
for(var e in events) {
  let event = events[e];
  Pda.schema.post(e, emitEvent(event));
}

function emitEvent(event) {
  return function(doc) {
    PdaEvents.emit(`${event}:${doc._id}`, doc);
    PdaEvents.emit(event, doc);
  };
}

export default PdaEvents;
