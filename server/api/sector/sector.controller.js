/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/sectors              ->  index
 * POST    /api/sectors              ->  create
 * GET     /api/sectors/:id          ->  show
 * PUT     /api/sectors/:id          ->  upsert
 * PATCH   /api/sectors/:id          ->  patch
 * DELETE  /api/sectors/:id          ->  destroy
 */

'use strict';

import * as _ from 'lodash';
import * as moment from 'moment';

import jsonpatch from 'fast-json-patch';
import Sector from './sector.model';
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
    res.status(statusCode).send(err);
  };
}

// Gets a list of Companies
export function index(req, res) {
  return Sector.find().exec()
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Gets a single Sector from the DB
export function show(req, res) {
  return Sector.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Creates a new Sector in the DB
export function create(req, res) {
  return Sector.create(req.body)
    .then(respondWithResult(res, 201))
    .catch(handleError(res));
}

// Upserts the given Sector in the DB at the specified ID
export function upsert(req, res) {
  if(req.body._id) {
    delete req.body._id;
  }
  return Sector.findOneAndUpdate({_id: req.params.id}, req.body, {upsert: true, setDefaultsOnInsert: true, runValidators: true}).exec()
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Updates an existing Sector in the DB
export function patch(req, res) {
  if(req.body._id) {
    delete req.body._id;
  }
  return Sector.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(patchUpdates(req.body))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Deletes a Sector from the DB
export function destroy(req, res) {
  return Sector.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(removeEntity(res))
    .catch(handleError(res));
}


export function sectorRegisters(req, res) {
  let baseQuery = Register.find()
    .populate('person')
    .populate('entrySector')
    .populate('departSector')
    .or({ entrySector: req.params.id }, { departSector: req.params.id });
  
  if(req.query) {
    // top queryString (number)
    let topQuery = parseInt(req.query.top, 10);
    if(topQuery) { 
      baseQuery.sort({ entryTime: -1, departTime: -1 }).limit(topQuery);
    }
    
    // TODO: from/to queryString (unixTime)
    let fromQuery = moment(req.query.from);
    let toQuery = moment(req.query.to);
    
    if (fromQuery) { 
      /* eslint keyword-spacing:0 */
      // where entryTime > fromQuery 
    }

    if (toQuery) {
      /* eslint keyword-spacing:0 */
      // where entryTime > fromQuery
    }
    
    // TODO: personType queryString (ObjectId)
    if (req.query.personType) {
      /* eslint keyword-spacing:0 */
      // where person._id == req.query.personType
    }
  }
  
  return baseQuery.exec()
    .then(respondWithResult(res))
    .catch(handleError(res));
}

export function sectorStatistics(req, res) {
  let baseQuery = Register.find()
    .populate('person')
    .populate('entrySector')
    .populate('departSector')
    .or({ entrySector: req.params.id }, { departSector: req.params.id });
    
  return baseQuery.exec()
    .then(function(registers) {
      // TODO: fill object with statistics to be used in dashboard
      return {
        staffNumber: _.size(_.every(registers, { 'person.type': 'staff' })),
        contractorNumber: _.size(_.every(registers, { 'person.type': 'contractor' })),
        visitNumber: _.size(_.every(registers, { 'person.type': 'visit' })),
        weeklyHistory: []
      };
    })
    .then(respondWithResult(res))
    .catch(handleError(res));
}
