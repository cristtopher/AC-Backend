'use strict';

import mongoose from 'mongoose';

var PersonSchema = new mongoose.Schema({
  rut:         { type: String },
  name:        { type: String },
  company:     { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  card:        { type: Number },
  active:      { type: Boolean }
});

PersonSchema.index({ rut: 1 });

export default mongoose.model('Person', PersonSchema);
