'use strict';

import { Router } from 'express';

import * as controller from './sector.controller';
import * as auth from '../../auth/auth.service';

var router = new Router();


//---------------------------------
//              GET
//---------------------------------

router.get('/', auth.isAuthenticated(), controller.index);
router.get('/:id/registers', auth.isAuthenticated(), controller.sectorRegisters);
router.get('/:id/statistics', auth.isAuthenticated(), controller.sectorStatistics);
router.get('/:id/export', auth.isAuthenticated(), controller.exportRegistersExcel);
router.get('/:id', auth.isAuthenticated(), controller.show);


//---------------------------------
//              POST
//---------------------------------

router.post('/', auth.isAuthenticated(), controller.create);
router.post('/:id/registers', auth.isAuthenticated(), controller.createRegister);


//---------------------------------
//              PUT
//---------------------------------

router.put('/:id', auth.isAuthenticated(), controller.upsert);


//---------------------------------
//              PATCH
//---------------------------------

router.patch('/:id', auth.isAuthenticated(), controller.patch);


//---------------------------------
//              DELETE
//---------------------------------

router.delete('/:id', auth.isAuthenticated(), controller.destroy);


module.exports = router;
