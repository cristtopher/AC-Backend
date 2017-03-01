'use strict';

import mongoose from 'mongoose';

var PdaSchema = new mongoose.Schema({
  name:        { type: String },
  description: { type: String },
  serial:      { type: String },
  company:     { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  sector:     { type: mongoose.Schema.Types.ObjectId, ref: 'Sector' }
});

PdaSchema.index({ company: 1 });

export default mongoose.model('Pda', PdaSchema);
