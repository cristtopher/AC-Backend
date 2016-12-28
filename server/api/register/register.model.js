'use strict';

import mongoose from 'mongoose';

var RegisterSchema = new mongoose.Schema({
  person:       { type: mongoose.Schema.Types.ObjectId, ref: 'Person' },
  entrySector:  { type: mongoose.Schema.Types.ObjectId, ref: 'Sector' },
  departSector: { type: mongoose.Schema.Types.ObjectId, ref: 'Sector' },
  entryTime:    { type: Date, default: Date.now },
  departTime:   { type: Date },
  comment:      { type: String }
});

RegisterSchema.index({ person: 1 });
RegisterSchema.index({ 'person.rut': 1 });
RegisterSchema.index({ entryTime: 1 });
RegisterSchema.index({ departTime: 1 });
RegisterSchema.index({ entrySector: 1 });
RegisterSchema.index({ departSector: 1 });

export default mongoose.model('Register', RegisterSchema);
