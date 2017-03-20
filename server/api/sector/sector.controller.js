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

import Promise from 'bluebird';
import jsonpatch from 'fast-json-patch';
import moment from 'moment';

import Sector from './sector.model';
import Register from '../register/register.model';

import * as _ from 'lodash';

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
  let baseQuery = Sector.find();

  if(req.query) {
    if(req.query.name) {
      baseQuery.where('name').equals(new RegExp(`^${req.query.name}`, 'i'));
    }
  }

  return baseQuery.exec()
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
  var baseQueryFactory = function() {
    let baseQuery = Register.find()
                            .where('sector').equals(req.params.id);
  
  
    if(req.query.unauthorized) {
      baseQuery.where('isUnauthorized').equals(true);
    } else {
      baseQuery.where('isUnauthorized').equals(false);
    }
    
  
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
    
    return baseQuery;
  };
  
  // Non page-based JSON result
  if(!req.query.paging) {
    return baseQueryFactory()
        .deepPopulate('person sector resolvedRegister.sector')
        .sort({_id: -1 })
        .exec()
        .then(respondWithResult(res))
        .catch(handleError(res));    
  }
  
  // page-based JSON result
  const REGISTERS_PER_PAGE = 10;
  
  let pageIndex = !req.query.page || req.query.page < 1 ? 1 : req.query.page;
  
  let queriesPromises = [
    baseQueryFactory()
      .deepPopulate('person sector resolvedRegister.sector')
      .skip((pageIndex - 1) * REGISTERS_PER_PAGE)
      .limit(REGISTERS_PER_PAGE)
      .sort({_id: -1 })
      .exec(),
    baseQueryFactory()
      .count()
      .exec()
  ];
  
  return Promise.all(queriesPromises)
    .spread((docs, count) => {
      res.setHeader('X-Pagination-Count', count);
      res.setHeader('X-Pagination-Limit', REGISTERS_PER_PAGE);
      res.setHeader('X-Pagination-Pages', Math.ceil(count / REGISTERS_PER_PAGE) || 1);
      res.setHeader('X-Pagination-Page', pageIndex);

      return docs;
    })
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// export person list as a excel file
export function exportRegistersExcel(req, res) {
  let user = req.user;
  let sectorId = req.params.id;
  
  //TODO (security constraint): validate that sector belongs to a company (if not throw 401)

  (function() {
    if(user.role === 'admin') { 
      return Promise.resolve(); 
    }
  
    return Sector.findById(sectorId).exec().then(function(sector) {
      if(!_.includes(user.companies.map(c => c.toString()), sector.company.toString())) {
        return res.status(401).json({ message: `not enough permission to export registers of sector: ${req.params.id}` });
      }
    });
  })()
  .then(function() {
    return Sector.exportRegistersExcel(sectorId);    
  })
  .then(excel => {
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=registers-export.xlsx');
    
    return res.end(excel);
  })
  .catch(handleError(res));
}

export function sectorStatistics(req, res) {
  Sector.getStatistics(req.params.id)
    .then(respondWithResult(res))
    .catch(handleError(res));
}

export function createRegister(req, res) {
  console.log(`going to create register using the following: ${JSON.stringify(req.body)}`);
  let sectorId = req.params.id;
  
  let mandatoryParams = [
    'type',
    'time'
  ];

  if(!req.body.person) {
    mandatoryParams.push('rut');
  }

  let missingMandatoryParam = null;
  mandatoryParams.forEach(function(param) {
    if(!_.has(req.body, param)) {
      console.log(`could not create register due missing property: ${param} in body.`);
      missingMandatoryParam = param;
      return false;
    } 
  });

  if(missingMandatoryParam) {
    return res.status(400).json({ message: `missing parameter: ${missingMandatoryParam}` });
  }

  return Sector.findById(sectorId).exec()
    .then(function(sector) {
      return sector.createRegister(req.body);
    })
    .then(respondWithResult(res, 201))
    .catch(handleError(res));
}
