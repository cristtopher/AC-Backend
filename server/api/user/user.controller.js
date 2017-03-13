'use strict';

import User from './user.model';
import config from '../../config/environment';
import jwt from 'jsonwebtoken';

function validationError(res, statusCode) {
  statusCode = statusCode || 422;
  return function(err) {
    return res.status(statusCode).json(err);
  };
}

function handleError(res, statusCode) {
  statusCode = statusCode || 500;
  return function(err) {
    console.error(err.stack);
    return res.status(statusCode).send(err);
  };
}

/**
 * Get list of users
 * restriction: 'admin'
 */
export function index(req, res) {
  return User.find({}, '-salt -password').exec()
    .then(users => {
      res.status(200).json(users);
      return null;
    })
    .catch(handleError(res));
}

/**
 * Creates a new user
 */
export function create(req, res) {
  var newUser = new User(req.body);
  newUser.provider = 'local';
  newUser.role = 'user';
  newUser.save()
    .then(function(user) {
      var token = jwt.sign({ _id: user._id }, config.secrets.session, {});
      
      res.json({ token });
      return null;
    })
    .catch(validationError(res));
}

/**
 * Get a single user
 */
export function show(req, res, next) {
  var userId = req.params.id;

  return User.findOne({ _id: userId })
    .populate('company')
    .exec()
    .then(user => {
      if(!user) {
        res.status(404).end();
        
        return null;
      }
      res.json(user.profile);
    })
    .catch(err => next(err));
}

/**
 * Deletes a user
 * restriction: 'admin'
 */
export function destroy(req, res) {
  return User.findByIdAndRemove(req.params.id).exec()
    .then(function() {
      res.status(204).end();
      
      return null;
    })
    .catch(handleError(res));
}

/**
 * Change a users password
 */
export function changePassword(req, res) {
  var userId = req.user._id;
  var oldPass = String(req.body.oldPassword);
  var newPass = String(req.body.newPassword);

  return User.findById(userId).exec()
    .then(user => {
      if(user.authenticate(oldPass)) {
        user.password = newPass;
        return user.save()
          .then(() => {
            res.status(204).end();
            
            return null;
          })
          .catch(validationError(res));
      } else {
        res.status(403).end();
        
        return null;
      }
    });
}

/**
 * Get my info
 */
export function me(req, res, next) {
  var userId = req.user._id;

  return User.findOne({ _id: userId }, '-salt -password')
    .populate('company')
    .exec()
    .then(user => { // don't ever give out the password or salt
      if(!user) {
        return res.status(401).end();
      }
      res.json(user);
      
      return null;
    })
    .catch(err => next(err));
}


export function getSectors(req, res) {
  let user = req.user;
  
  user.populate('sectors', function(err, userWithSectors) {
    if(err) return handleError(res); 
    
    res.status(200).json(userWithSectors.sectors);
  });
}

export function getCompanies(req, res) {
  let user = req.user;
    
  user.getCompanies()
    .then(companies => res.status(200).json(companies))
    .catch(handleError(res));
}

export function getUserCompanySectors(req, res) {
  let user = req.user;
    
  user.getCompanySectors(req.params.companyId)
    .then(sectors => res.status(200).json(sectors))
    .catch(handleError(res));  
}

export function importUsers(req, res) {
  return res.status(200).end();
}

/**
 * Authentication callback
 */
export function authCallback(req, res) {
  res.redirect('/');
}
