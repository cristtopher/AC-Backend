'use strict';

import mongoose from 'mongoose';

var PersonSchema = new mongoose.Schema({
  rut:         { type: String },
  name:        { type: String },
  companyName: { type: String },
  card:        { type: Number },
  active:      { type: Boolean }
});

PersonSchema.index({ rut: 1 });

export default mongoose.model('Person', PersonSchema);
