'use strict';

import Promise from 'bluebird';
import jwt from 'jsonwebtoken';
import jsonpatch from 'fast-json-patch';

import User from './user.model';

import config from '../../config/environment';

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

function respondWithResult(res, statusCode) {
  statusCode = statusCode || 200;
  return function(entity) {
    if(entity) {
      return res.status(statusCode).json(entity);
    }

    return null;
  };
}

function patchUpdates(patches) {
  return function(entity) {
    try {
      jsonpatch.apply(entity, patches, /*validate*/ true);
    } catch(err) {
      return Promise.reject(err);
    }

    return entity.save();
  };
}

function handleEntityNotFound(res) {
  return function(entity) {
    if(!entity) {
      res.status(404).end();
      return null;
    }
    return entity;
  };
}

/**
 * Get list of users
 * restriction: 'admin'
 */
export function index(req, res) {
  let baseQueryFactory = function() {
    let baseQuery = User.find({}, '-salt -password');

    if(req.query.populate) {
      baseQuery.populate('companies');
    }

    return baseQuery;
  };

  (function() {
    if(!req.query.paging) {
      return baseQueryFactory().exec();
    }

    // page-based JSON result
    var USERS_PER_PAGE = 10;
    var pageIndex = !req.query.page || req.query.page < 1 ? 1 : req.query.page;

    return Promise.all([
      baseQueryFactory()
        .sort({ _id: 1 })
        .skip((pageIndex - 1) * USERS_PER_PAGE)
        .limit(USERS_PER_PAGE)
        .exec(),
      baseQueryFactory()
        .count()
        .exec()
    ])
    .spread((docs, count) => {
      res.setHeader('X-Pagination-Count', count);
      res.setHeader('X-Pagination-Limit', USERS_PER_PAGE);
      res.setHeader('X-Pagination-Pages', Math.ceil(count / USERS_PER_PAGE) || 1);
      res.setHeader('X-Pagination-Page', pageIndex);

      return docs;
    });
  })()
  .then(users => {
    res.status(200).json(users);
    return null;
  })
  .catch(handleError(res));
}

/**
 * Creates a new user
 * restriction: 'admin'
 */
export function create(req, res) {
  var newUser = new User(req.body);
  
  newUser.password = newUser.password || `axxezo_${newUser.rut}`;
  
  newUser.save()
    .then(respondWithResult(res))
    .catch(validationError(res));
}

/**
 * Patches an existing user
 * restriction: 'admin'
 */

export function patch(req, res) {
  if(req.body._id) {
    delete req.body._id;
  }
  
  return User.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(patchUpdates(req.body))
    .then(respondWithResult(res))
    .catch(handleError(res));
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
  var user = req.user;
  
  if (user.role === 'admin') {
    let password = String(req.body.password);
    let userId   = req.params.id;
    
    return User.findById(userId).exec()
      .then(user => {
        user.password = password;
      
        return user.save();
      })
      .then(() => {
        res.status(204).end();
        return null;
      })
      .catch(validationError(res));
  }
  
  var oldPass = String(req.body.oldPassword);
  var newPass = String(req.body.newPassword);

  return User.findById(user._id).exec()
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
