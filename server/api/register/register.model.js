/*eslint no-invalid-this: 0*/
/*eslint consistent-this:0 */
/*eslint newline-per-chained-call:0 */

'use strict';
import Promise from 'bluebird';

import mongoose from 'mongoose';
import moment from 'moment';

var eventEmitter = require('./register.events').default;

// suppress warnings as mongoose-deep-populate has promises without returns.
Promise.config({
  warnings: { wForgottenReturn: false }
});

var deepPopulate = require('mongoose-deep-populate')(mongoose);

var RegisterSchema = new mongoose.Schema({
  personType:       { type: String }, 
  person:           { type: mongoose.Schema.Types.ObjectId, ref: 'Person' },
  sector:           { type: mongoose.Schema.Types.ObjectId, ref: 'Sector' },
  time:             { type: Date, default: Date.now },
  type:             { type: String, enum: ['entry', 'depart'] },
  isUnauthorized:   { type: Boolean, default: false },
  unauthorizedRut:  { type: String }, 
  isResolved:       { type: Boolean, default: false },
  resolvedRegister: { type: mongoose.Schema.Types.ObjectId, ref: 'Register' },
  comments:         { type: String, default: '' }
});

RegisterSchema.index({ person: 1 });
RegisterSchema.index({ personType: 1 });
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

  if(!register.person) { 
    return next(); 
  }

  mongoose.model('Person').findById(register.person).exec()
    .then(function(person) {
      register.personType = person.type; 
    })
    .then(function() {
      if(register.type === 'entry' || register.isResolved) return;
      
      // try to auto-match a depart with the last unresolved entry
      return mongoose.model('Register').findOne()
        .sort({ time: -1 })
        .where('person').equals(register.person)
        .where('isResolved').equals(false)
        .where('type').equals('entry')
        .where('time').lte(register.time)
        .then(function(counterRegister) {
          // TODO: should this condition throw an error? 
          if(!counterRegister) return next();
            
          register.isResolved = true;
    
          return mongoose.model('Register')
            .findOneAndUpdate({ _id: counterRegister._id }, { resolvedRegister: register._id, isResolved: true })
            .exec();
        });
    })
    .then(next)
    .catch(next);
});


RegisterSchema.post('save', function(doc) {
  eventEmitter.emit('save', doc);
});
//-------------------------------------------------------
//                     Statics
//-------------------------------------------------------

RegisterSchema.statics = {
};

//-------------------------------------------------------
//                     Methods
//-------------------------------------------------------

RegisterSchema.methods = {
};


//-------------------------------------------------------
//                     Plugins
//-------------------------------------------------------


RegisterSchema.plugin(deepPopulate, {});

export default mongoose.model('Register', RegisterSchema);
