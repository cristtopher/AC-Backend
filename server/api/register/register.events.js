/**
 * Register model events
 */

'use strict';

import {EventEmitter} from 'events';
//import Register from './register.model';
var RegisterEvents = new EventEmitter();

// Set max event listeners (0 == unlimited)
RegisterEvents.setMaxListeners(0);

export default RegisterEvents;
