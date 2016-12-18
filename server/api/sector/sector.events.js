/**
 * Sector model events
 */

'use strict';

import {EventEmitter} from 'events';
import Sector from './company.model';
var SectorEvents = new EventEmitter();

// Set max event listeners (0 == unlimited)
SectorEvents.setMaxListeners(0);

// Model events
var events = {
  save: 'save',
  remove: 'remove'
};

// Register the event emitter to the model events
for(var e in events) {
  let event = events[e];
  Sector.schema.post(e, emitEvent(event));
}

function emitEvent(event) {
  return function(doc) {
    SectorEvents.emit(`${event}:${doc._id}`, doc);
    SectorEvents.emit(event, doc);
  };
}

export default SectorEvents;
