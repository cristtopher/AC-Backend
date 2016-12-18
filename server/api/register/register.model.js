'use strict';

import mongoose from 'mongoose';

var RegisterSchema = new mongoose.Schema({
  person: { type: mongoose.Schema.Types.ObjectId, ref: 'Person' },
  time:   { type: Date, default: Date.now },
  card:   { type: Number }
});

RegisterSchema.index({ time: 1 });
RegisterSchema.index({ person: 1 });

export default mongoose.model('Register', RegisterSchema);
