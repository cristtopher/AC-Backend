/*eslint no-invalid-this: 0*/
'use strict';

import mongoose from 'mongoose';
import moment from 'moment';

var RegisterSchema = new mongoose.Schema({
  person:           { type: mongoose.Schema.Types.ObjectId, ref: 'Person' },
  sector:           { type: mongoose.Schema.Types.ObjectId, ref: 'Sector' },
  time:             { type: Date, default: Date.now },
  type:             { type: String, enum: ['entry', 'depart'] },
  isResolved:       { type: Boolean, default: false },
  resolvedRegister: { type: mongoose.Schema.Types.ObjectId, ref: 'Register' },
  comment:          { type: String }
});

RegisterSchema.index({ person: 1 });
RegisterSchema.index({ 'person.rut': 1 });
RegisterSchema.index({ time: 1 });
RegisterSchema.index({ sector: 1 });
RegisterSchema.index({ entry: 1 });
RegisterSchema.index({ isResolved: 1 });
RegisterSchema.index({ resolvedRegister: 1 });

//-------------------------------------------------------
//                  Getters/Setters
//-------------------------------------------------------

RegisterSchema.path('time')
  .set(time => moment(time));


//-------------------------------------------------------
//                  Pre/Post Hooks
//-------------------------------------------------------

RegisterSchema.pre('save', function(next) {
  var register = this;
  console.log(`register: ${JSON.stringify(register)}`)
  if (register.type === 'entry') {
    return next();
  }
  
  if (!register.resolvedRegister) {
    return next(new Error("Depart register must have an entry register associated"));
  }
  
  return mongoose.model('Register').findOne({ _id: register.resolvedRegister })
    .where('isResolved').equals(false)
    .where('type').equals('entry')
    .exec()
    .then(function(counterRegister) {
      if (!counterRegister) {
        return next();
      }
      
      counterRegister.resolvedRegister = register._id;
      counterRegister.isResolved = true;
      
      register.isResolved = true;
      
      return counterRegister.save();
    })
    .then(next)
    .catch(next);

  
});

//-------------------------------------------------------
//                     Statics
//-------------------------------------------------------

RegisterSchema.statics = {
}

//-------------------------------------------------------
//                     Methods
//-------------------------------------------------------

RegisterSchema.methods = {
}


export default mongoose.model('Register', RegisterSchema);
