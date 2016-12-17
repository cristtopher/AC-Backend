'use strict';

import mongoose from 'mongoose';

var PersonSchema = new mongoose.Schema({
  name: String,
  info: String,
  active: Boolean
});

export default mongoose.model('Person', PersonSchema);
