'use strict';

import mongoose from 'mongoose';

var CompanySchema = new mongoose.Schema({
  name:        { type: String },
  logo:        { type: String },
  description: { type: String }
});

CompanySchema.index({ name: 1 });

export default mongoose.model('Company', CompanySchema);
