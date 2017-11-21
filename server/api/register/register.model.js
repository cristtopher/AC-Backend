/*eslint no-invalid-this: 0*/
/*eslint consistent-this:0 */
/*eslint newline-per-chained-call:0 */

'use strict';
import Promise from 'bluebird';

import mongoose from 'mongoose';
import moment from 'moment';
// import Vehicle from '../vehicle/vehicle.model';

import { EventEmitter } from 'events';

var RegisterEvents = new EventEmitter();

RegisterEvents.setMaxListeners(0);

// suppress warnings as mongoose-deep-populate has promises without returns.
Promise.config({
  warnings: { wForgottenReturn: false }
});

var deepPopulate = require('mongoose-deep-populate')(mongoose);

var RegisterSchema = new mongoose.Schema({
  
  personType: { type: String },
  personName: { type: String },
  personRut: { type: String },
  personCompanyInfo: { type: String },
  
  patent:           { type: String, trim: true },
  vehicle:          { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle' },
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
RegisterSchema.index({ personName: 1 });
RegisterSchema.index({ personRut: 1 });
RegisterSchema.index({ time: 1 });
RegisterSchema.index({ sector: 1 });
RegisterSchema.index({ vehicle: 1 });
RegisterSchema.index({ entry: 1 });
RegisterSchema.index({ isResolved: 1 });
RegisterSchema.index({ resolvedRegister: 1 });
RegisterSchema.index({ person: 1, sector : 1, time : 1, type : 1 }, {unique: true});

//-------------------------------------------------------
//                  Getters/Setters
//-------------------------------------------------------

RegisterSchema.path('time')
  .set(time => moment(time));


//-------------------------------------------------------
//                  Pre/Post Hooks
//-------------------------------------------------------

function emitEvent(event) {
  return function(doc) {      
    RegisterEvents.emit(`${event}:${doc._id}`, doc);
    RegisterEvents.emit(event, doc);
  };
}

/**
 * When a registration containing a patent is received, 
 * it is searched in the collection of vehicles to obtain the id 
 * and update the registration by adding the attribute vehicle,  
 * tired of not finding the patent in the collection, 
 * a vehicle is created and then updated the registration 
 * with the created.
 * @param {*} register  
 */
function findVehicle(register) {
  mongoose.model('Vehicle').findOne({ patent: register.patent }).exec()
    .then(function(vehicle) {
      // TODO: Avoid using the findOneAndUpdate(), return register.
      mongoose.model('Register')
        .findOneAndUpdate({
          _id: register._id
        }, {
          vehicle: vehicle
        })
        .exec(function(err) {
          if(err) console.error(err);
        });
    })
    .catch(function() {
      // Patent not found on vehicles, must be created
      var Vehicle = mongoose.model('Vehicle');
      var newVehicle = new Vehicle({ 
        patent: register.patent,
        sector: register.sector,
        inside: true
      });
      newVehicle.save(function(err, createdVehicle) {
        if(err) throw err;
        mongoose.model('Register')
          .findOneAndUpdate({
            _id: register._id
          }, {
            vehicle: createdVehicle
          })
          .exec(function(err) {
            if(err) console.error(err);
          });
      });
    });
}

RegisterSchema.pre('save', function(next) {
  var register = this;

  if(!register.person) { 
    return next(); 
  }

  mongoose.model('Person').findById(register.person).exec()
    .then(function(person) {
      register.personType        = person.type;
      register.personName        = person.name; 
      register.personRut         = person.rut; 
      register.personCompanyInfo = person.companyInfo;
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
          // TODO: should this condition throw an error? vehicleSchema
          if(!counterRegister) return next();
            
          register.isResolved = true;
    
          return mongoose.model('Register')
            .findOneAndUpdate({ _id: counterRegister._id }, { resolvedRegister: register._id, isResolved: true })
            .exec();
        });
    })
    .then(next)
    .catch(function(err) {
      console.error(err);
    });
});

RegisterSchema.post('save', function(register) {
  if(register.patent !== undefined) {
    findVehicle(register);
  }
  if(register.type === 'entry' && register.patent !== undefined) {
    mongoose.model('Vehicle')
      .findOneAndUpdate({ patent: register.patent }, { inside: true })
      .exec();
  } else if(register.type === 'depart' && register.patent !== undefined) {
    mongoose.model('Vehicle')
      .findOneAndUpdate({ patent: register.patent }, { inside: false })
      .exec();
  }
  emitEvent('save')(register);
});

RegisterSchema.post('remove', function(doc) {
  emitEvent('remove')(doc);
});

RegisterSchema.post('update', function(doc) {
  emitEvent('update')(doc);
});

RegisterSchema.post('findOneAndUpdate', function(doc) {
  emitEvent('update')(doc);
});


//-------------------------------------------------------
//                     Statics
//-------------------------------------------------------

RegisterSchema.statics = {
  getEventEmitter: function() {
    return RegisterEvents;
  },
  
  updatePersonTypes: function(personId, newPersonType) {
    let Register = this;
    
    return Register.update({ person: personId }, { '$set': { personType: newPersonType } }).exec();
  }
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
