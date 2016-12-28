'use strict';

import mongoose from 'mongoose';

var SectorSchema = new mongoose.Schema({
  name:        { type: String },
  description: { type: String },
  company:     { type: mongoose.Schema.Types.ObjectId, ref: 'Company' }
});

SectorSchema.index({ company: 1 });

export default mongoose.model('Sector', SectorSchema);
