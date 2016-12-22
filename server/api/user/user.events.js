/**
 * User model events
 */

'use strict';

import {EventEmitter} from 'events';
import User from './user.model';
var UserEvents = new EventEmitter();

// Set max event listeners (0 == unlimited)
UserEvents.setMaxListeners(0);

// Model events
var events = {
  save: 'save',
  remove: 'findByIdAndRemove'
};

// Register the event emitter to the model events
for(var e in events) {
  let event = events[e];
  console.log(`Done user:${event} that will be emitted via socket.io...`);
  User.schema.post(e, emitEvent(event));
}

function emitEvent(event) {
  return function(doc) {
    console.log(`Emitting: ${event}:${doc._id}`);
    UserEvents.emit(`${event}:${doc._id}`, doc);
    UserEvents.emit(event, doc);
  };
}

export default UserEvents;