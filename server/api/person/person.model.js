'use strict';

import mongoose from 'mongoose';
import { EventEmitter } from 'events';

var PersonEvents = new EventEmitter();

PersonEvents.setMaxListeners(0);

var PersonSchema = new mongoose.Schema({
  rut:     { type: String },
  name:    { type: String },
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  type:    { type: String, enum: ['staff', 'contractor', 'visitor'], default: 'staff' },
  card:    { type: Number },
  active:  { type: Boolean, default: true }
});

PersonSchema.index({ rut: 1 }, { unique: true });
PersonSchema.index({ card: 1 }, { unique: true });
PersonSchema.index({ company: 1 });

//-------------------------------------------------------
//                    Pre/Post Hooks
//-------------------------------------------------------

function emitEvent(event) {  
  return function(doc) {
    PersonEvents.emit(`${event}:${doc._id}`, doc);
    PersonEvents.emit(event, doc);
  };
}

PersonSchema.post('save', function(doc) {
  emitEvent('save')(doc);
});

PersonSchema.post('remove', function(doc) {
  emitEvent('remove')(doc);
});

PersonSchema.post('update', function(doc) {
  emitEvent('update')(doc);
});

PersonSchema.post('findOneAndUpdate', function(doc) {
  emitEvent('update')(doc);
});

//-------------------------------------------------------
//                     Statics
//-------------------------------------------------------

PersonSchema.statics = {
  getEventEmitter: function() { 
    return PersonEvents; 
  }
};

export default mongoose.model('Person', PersonSchema);
