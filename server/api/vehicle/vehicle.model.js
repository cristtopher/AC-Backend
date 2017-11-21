'use strict';

import mongoose from 'mongoose';
import { EventEmitter } from 'events';

var VehicleEvents = new EventEmitter();

VehicleEvents.setMaxListeners(0);

var VehicleSchema = new mongoose.Schema({
  patent:  { type: String, required: true },
  sector:  { type: mongoose.Schema.Types.ObjectId, ref: 'Sector' },
  type:    { type: String, enum: ['car', 'truck', 'pickup', 'van', 'bus', 'motorcicle'] },
  inside:  { type: Boolean }
});

VehicleSchema.index({ patent: 1, sector: 1 }, {unique: true});

//-------------------------------------------------------
//                    Pre/Post Hooks
//-------------------------------------------------------

//-------------------------------------------------------
//                     Statics
//-------------------------------------------------------

export default mongoose.model('Vehicle', VehicleSchema);
