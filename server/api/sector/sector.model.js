'use strict';

import mongoose from 'mongoose';

var SectorSchema = new mongoose.Schema({
  name: { type: String },
  info: { type: String },
});

export default mongoose.model('Sector', SectorSchema);
