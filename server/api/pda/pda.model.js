'use strict';

import Promise from 'bluebird';

import mongoose from 'mongoose';
import moment from 'moment';
import * as _ from 'lodash';

import Register from '../register/register.model';

var PdaSchema = new mongoose.Schema({
  name:        { type: String },
  description: { type: String },
  serial:      { type: String },
  company:     { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  sector:     { type: mongoose.Schema.Types.ObjectId, ref: 'Sector' }
});

PdaSchema.index({ company: 1 });

export default mongoose.model('Pda', PdaSchema);
