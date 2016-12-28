'use strict';

import mongoose from 'mongoose';

var SectorSchema = new mongoose.Schema({
  name:        { type: String },
  description: { type: String },
  company:     { type: mongoose.Schema.Types.ObjectId, ref: 'Company' }
});

export default mongoose.model('Sector', SectorSchema);
