'use strict';

import mongoose from 'mongoose';

var CompanySchema = new mongoose.Schema({
  name: String,
  info: String,
  active: Boolean
});

export default mongoose.model('Company', CompanySchema);
