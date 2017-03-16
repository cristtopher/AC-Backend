'use strict';
/*eslint no-invalid-this:0*/
import crypto from 'crypto';
mongoose.Promise = require('bluebird');
import mongoose, {Schema} from 'mongoose';

import _ from 'lodash';

import config from '../../config/environment';

var UserSchema = new Schema({
  name:      { type: String },
  rut:       { type: String, lowercase: true, required: true },
  companies: { type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Company' }] },
  role:      { type: String, enum: config.userRoles, default: 'user' },
  password:  { type: String, required: true },
  salt:      { type: String },
  
  //deprecated
  company:  { type: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' } },
  sectors:  { type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Sector' }] }
});

UserSchema.index({ rut: 1 }, { unique: true });
UserSchema.index({ company: 1 });
UserSchema.index({ sector: 1 });

//-------------------------------------------------------
//                  Getters/Setters
//-------------------------------------------------------


//-------------------------------------------------------
//                     Virtuals
//-------------------------------------------------------

// Public profile information
UserSchema
  .virtual('profile')
  .get(function() {
    return {
      name: this.name,
      role: this.role
    };
  });

// Non-sensitive info we'll be putting in the token
UserSchema
  .virtual('token')
  .get(function() {
    return {
      _id: this._id,
      role: this.role
    };
  });

//-------------------------------------------------------
//                      Validations
//-------------------------------------------------------
  
// Validate empty rut
UserSchema
  .path('rut')
  .validate(function(rut) {
    return rut.length;
  }, 'rut cannot be blank');

// Validate empty password
UserSchema
  .path('password')
  .validate(function(password) {
    return password.length;
  }, 'Password cannot be blank');

// Validate rut is not taken
UserSchema
  .path('rut')
  .validate(function(value, respond) {
    return this.constructor.findOne({ rut: value }).exec()
      .then(user => {
        if(user) {
          if(this.id === user.id) {
            return respond(true);
          }
          return respond(false);
        }
        return respond(true);
      })
      .catch(function(err) {
        throw err;
      });
  }, 'The specified rut address is already in use.');

var validatePresenceOf = function(value) {
  return value && value.length;
};

/**
 * Pre-save hook
 */
UserSchema
  .pre('save', function(next) {
    // Handle new/update passwords
    if(!this.isModified('password')) {
      return next();
    }

    if(!validatePresenceOf(this.password)) {
      return next(new Error('Invalid password'));
    }

    // Make salt with a callback
    this.makeSalt((saltErr, salt) => {
      if(saltErr) {
        return next(saltErr);
      }
      this.salt = salt;
      this.encryptPassword(this.password, (encryptErr, hashedPassword) => {
        if(encryptErr) {
          return next(encryptErr);
        }
        this.password = hashedPassword;
        return next();
      });
    });
  });


//-------------------------------------------------------
//                      Methods/Statics
//-------------------------------------------------------

UserSchema.methods = {
  /**
   * Authenticate - check if the passwords are the same
   *
   * @param {String} password
   * @param {Function} callback
   * @return {Boolean}
   * @api public
   */
  authenticate(password, callback) {
    if(!callback) {
      return this.password === this.encryptPassword(password);
    }

    this.encryptPassword(password, (err, pwdGen) => {
      if(err) {
        return callback(err);
      }

      if(this.password === pwdGen) {
        return callback(null, true);
      } else {
        return callback(null, false);
      }
    });
  },

  /**
   * Make salt
   *
   * @param {Number} [byteSize] - Optional salt byte size, default to 16
   * @param {Function} callback
   * @return {String}
   * @api public
   */
  makeSalt(byteSize, callback) {
    var defaultByteSize = 16;
    
    if(typeof arguments[0] === 'function') {
      callback = arguments[0];
      byteSize = defaultByteSize;
    } else if(typeof arguments[1] === 'function') {
      callback = arguments[1];
    } else {
      throw new Error('Missing Callback');
    }

    if(!byteSize) {
      byteSize = defaultByteSize;
    }

    return crypto.randomBytes(byteSize, (err, salt) => {
      if(err) {
        return callback(err);
      } else {
        return callback(null, salt.toString('base64'));
      }
    });
  },

  /**
   * Encrypt password
   *
   * @param {String} password
   * @param {Function} callback
   * @return {String}
   * @api public
   */
  encryptPassword(password, callback) {
    if(!password || !this.salt) {
      if(!callback) {
        return null;
      } else {
        return callback('Missing password or salt');
      }
    }

    var defaultIterations = 10000;
    var defaultKeyLength = 64;
    var salt = new Buffer(this.salt, 'base64');

    if(!callback) {
      return crypto.pbkdf2Sync(password, salt, defaultIterations, defaultKeyLength, 'sha1') 
        .toString('base64'); /* eslint no-sync:0 */
    }

    return crypto.pbkdf2(password, salt, defaultIterations, defaultKeyLength, 'sha1', (err, key) => {
      if(err) {
        return callback(err);
      } else {
        return callback(null, key.toString('base64'));
      }
    });
  },
  
  getCompanies() {
    return mongoose.model('Company').find()
      .where('_id').in(this.companies)
    .exec();
  },
  
  getCompanySectors(companyId) {
    if(!_.includes(this.companies.map(c => c.toString()), companyId)) {
      return Promise.resolve([]);
    }
    
    return mongoose.model('Sector').find()
      .where('company').in([companyId])
      .exec();
  }
};

export default mongoose.model('User', UserSchema);
