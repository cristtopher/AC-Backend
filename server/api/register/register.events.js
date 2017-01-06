/**
 * Register model events
 */

'use strict';

import {EventEmitter} from 'events';
import Register from './register.model';
var RegisterEvents = new EventEmitter();

// Set max event listeners (0 == unlimited)
RegisterEvents.setMaxListeners(0);

// Model events
var events = {
  save: 'save',
  remove: 'remove'
};

// Register the event emitter to the model events
for(var e in events) {
  let event = events[e];
  Register.schema.post(e, emitEvent(event));
}

function emitEvent(event) {
  return function(register) {
    register.populate('person sector resolvedRegister', function(err, populatedRegister){
      if (err) {
        console.error(err.stack);
        return;
      }
      
      RegisterEvents.emit(`${event}:${register._id}`, register);
      RegisterEvents.emit(event, register);
    });
  };
}

export default RegisterEvents;
