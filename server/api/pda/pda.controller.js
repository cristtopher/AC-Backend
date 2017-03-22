/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/pdas              ->  index
 * POST    /api/pdas              ->  create
 * GET     /api/pdas/:id          ->  show
 * PUT     /api/pdas/:id          ->  upsert
 * PATCH   /api/pdas/:id          ->  patch
 * DELETE  /api/pdas/:id          ->  destroy
 */

'use strict';

import Promise from 'bluebird';
import jsonpatch from 'fast-json-patch';
import moment from 'moment';

import Pda from './pda.model';
import Register from '../register/register.model';

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

function removeEntity(res) {
  return function(entity) {
    if(entity) {
      return entity.remove()
        .then(() => {
          res.status(204).end();
        });
    }
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

function handleError(res, statusCode) {
  statusCode = statusCode || 500;
  return function(err) {
    console.error(err.stack);
    res.status(statusCode).send(err);
  };
}

// Gets a list of Companies
export function index(req, res) {
  let baseQuery = Pda.find();
  
  if(req.query) {
    if(req.query.name) {
      baseQuery.where('name').equals(new RegExp(`^${req.query.name}`, 'i'));
    }
  }

  return baseQuery.exec()
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Gets a single Pda from the DB
export function show(req, res) {
  let baseQuery = Pda.find()
    .where('serial')
    .equals(req.params.id);

  return baseQuery.exec()
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Creates a new Pda in the DB
export function create(req, res) {
  return Pda.create(req.body)
    .then(respondWithResult(res, 201))
    .catch(handleError(res));
}

// Upserts the given Pda in the DB at the specified ID
export function upsert(req, res) {
  if(req.body._id) {
    delete req.body._id;
  }
  return Pda.findOneAndUpdate({_id: req.params.id}, req.body, {upsert: true, setDefaultsOnInsert: true, runValidators: true}).exec()
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Updates an existing Pda in the DB
export function patch(req, res) {
  if(req.body._id) {
    delete req.body._id;
  }
  return Pda.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(patchUpdates(req.body))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Deletes a Pda from the DB
export function destroy(req, res) {
  return Pda.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(removeEntity(res))
    .catch(handleError(res));
}

export function pdaRegisters(req, res) {
  let baseQuery = Register.find()
    .deepPopulate('person pda resolvedRegister.pda')
    .where('pda').equals(req.params.id)
    .where('isUnauthorized').equals(false)
    // FIXME: Temporary workaround to mantain sorted registers (change it after implementing paging)
    .sort({_id: -1 });

  if(req.query) {
    if(req.query.type) {
      baseQuery.where('type').equals(req.query.type);
    }
    
    if(req.query.top) { 
      baseQuery.limit(parseInt(req.query.top, 10));
    }
    
    if(req.query.from) { 
      baseQuery.where('time').gte(moment(parseInt(req.query.from, 10)));
    }

    if(req.query.to) {
      baseQuery.where('time').lte(moment(parseInt(req.query.to, 10)));
    }
    
    if(req.query.personType) {
      baseQuery.where('personType').equals(req.query.personType);
    }
    
    if(req.query.incomplete) {
      baseQuery.where('isResolved').equals(false);
    }
  }
  
  return baseQuery.exec()
    .then(respondWithResult(res))
    .catch(handleError(res));
}

export function pdaStatistics(req, res) {
  Pda.getStatistics(req.params.id)
    .then(respondWithResult(res))
    .catch(handleError(res));
}
