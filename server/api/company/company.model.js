'use strict';

import mongoose from 'mongoose';

var CompanySchema = new mongoose.Schema({
  name: { type: String },
  rut:  { type: String },
  logo: { type: String },
  info: { type: String },
});

export default mongoose.model('Company', CompanySchema);
