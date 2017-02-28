/**
 * Register model events
 */

'use strict';

import {EventEmitter} from 'events';
//import Register from './register.model';
var RegisterEvents = new EventEmitter();

// Set max event listeners (0 == unlimited)
RegisterEvents.setMaxListeners(0);

// Model events
//var events = {
//  save: 'save',
//  remove: 'remove'
//};
//
//// Register the event emitter to the model events
//for(var e in events) {
//  let event = events[e];
//  console.log("register.events.js: register.schema.post()" + event);
//  Register.schema.post(e, function emitEvent(event) {
//    console.log("register.events.js: emitEvent()");
//    console.log(event); 
//    return function(register) {
//      register.populate('person sector resolvedRegister', function(err, populatedRegister) {
//        if(err) {
//          console.error(err.stack);
//          return;
//        }
//        console.log("register.events.js: RegisterEvents.emit()"); 
//        RegisterEvents.emit(`${event}:${register._id}`, populatedRegister);
//        RegisterEvents.emit(event, populatedRegister);
//      });
//    };
//  });
//}

export default RegisterEvents;
