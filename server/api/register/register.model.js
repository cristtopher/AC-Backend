/*eslint no-invalid-this: 0*/
'use strict';

import mongoose from 'mongoose';
import moment from 'moment';

var RegisterSchema = new mongoose.Schema({
  person:  { type: mongoose.Schema.Types.ObjectId, ref: 'Person' },
  sector:  { type: mongoose.Schema.Types.ObjectId, ref: 'Sector' },
  time:    { type: Date, default: Date.now },
  type:    { type: String, enum: ['entry', 'depart'] },
  comment: { type: String }
});

RegisterSchema.index({ person: 1 });
RegisterSchema.index({ 'person.rut': 1 });
RegisterSchema.index({ time: 1 });
RegisterSchema.index({ sector: 1 });
RegisterSchema.index({ entry: 1 });

//-------------------------------------------------------
//                  Getters/Setters
//-------------------------------------------------------

RegisterSchema.path('time')
  .set(time => moment(time));

export default mongoose.model('Register', RegisterSchema);
