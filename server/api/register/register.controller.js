/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/registers              ->  index
 * POST    /api/registers              ->  create
 * GET     /api/registers/:id          ->  show
 * PUT     /api/registers/:id          ->  upsert
 * PATCH   /api/registers/:id          ->  patch
 * DELETE  /api/registers/:id          ->  destroy
 */

'use strict';
import jsonpatch from 'fast-json-patch';
import Register from './register.model';


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
    console.log(`going to patch entity = ${JSON.stringify(entity)} with patches = ${JSON.stringify(patches)}`);
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

// Gets a list of Registers
export function index(req, res) {
  let user = req.user;
  
  var baseQuery = Register.find()
    .deepPopulate('person sector resolvedRegister.sector')
    .where('type').equals('entry');
                          
  if(user.role !== 'admin') {
    baseQuery.where('sector').in(user.sectors);
  }
  
  return baseQuery    
    .lean()
    .exec()
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Gets a single Register from the DB
export function show(req, res) {
  return Register.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

export function create(req, res) {
  return Register.create(req.body).exec()
    .then(respondWithResult(res))
    .catch(handleError(res));  
}

// Upserts the given Register in the DB at the specified ID
export function upsert(req, res) {
  if(req.body._id) {
    delete req.body._id;
  }
   
  return Register.findOneAndUpdate({ _id: req.params.id}, req.body, {upsert: true, setDefaultsOnInsert: true, runValidators: true }).exec()
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Updates an existing Register in the DB
export function patch(req, res) {
  if(req.body._id) {
    delete req.body._id;
  }

  return Register.findById(req.params.id)
    .deepPopulate('person sector resolvedRegister.sector')
    .exec()
    .then(handleEntityNotFound(res))
    .then(patchUpdates(req.body))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Deletes a Register from the DB
export function destroy(req, res) {
  return Register.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(removeEntity(res))
    .catch(handleError(res));
}
