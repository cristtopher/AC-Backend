/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/vehicles              ->  index
 * POST    /api/vehicles              ->  create
 * GET     /api/vehicles/:id          ->  show
 * PUT     /api/vehicles/:id          ->  upsert
 * PATCH   /api/vehicles/:id          ->  patch
 * DELETE  /api/vehicles/:id          ->  destroy
 */

'use strict';

import jsonpatch from 'fast-json-patch';
import Vehicle from './vehicle.model';

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

// Gets a list of Vehicles
export function index(req, res) {
  let baseQuery = Vehicle.find();

  if (req.query) {
    if (req.query.patent) {
      baseQuery.where('patent').equals(new RegExp(`^${req.query.patent}`, 'i'));
    }
  }

  return baseQuery.exec()
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Gets a single Vehicle from the DB
export function show(req, res) {
  return Vehicle.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Creates a new Vehicle in the DB
export function create(req, res) {
  return Vehicle.create(Object.assign(req.body, {company: req.user.company}))
    .then(respondWithResult(res, 201))
    .catch(handleError(res));
}

// Upserts the given Vehicle in the DB at the specified ID
export function upsert(req, res) {
  if(req.body._id) {
    delete req.body._id;
  }

  delete req.body.__v;
  //console.log('removing __v');

  return Vehicle.findOneAndUpdate({_id: req.params.id}, req.body, { upsert: true, setDefaultsOnInsert: true, runValidators: true, new: true }).exec()
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Updates an existing Vehicle in the DB
export function patch(req, res) {
  if(req.body._id) {
    delete req.body._id;
  }
  return Vehicle.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(patchUpdates(req.body))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Deletes a Vehicle from the DB
export function destroy(req, res) {
  return Vehicle.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(removeEntity(res))
    .catch(handleError(res));
}
