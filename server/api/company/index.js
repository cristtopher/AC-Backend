'use strict';

import { Router } from 'express';
import multer from 'multer';

import * as controller from './company.controller';
import * as auth from '../../auth/auth.service';

var upload = multer({ dest: '/tmp/' });

var router = new Router();

//---------------------------------
//              GET
//---------------------------------

router.get('/', auth.isAuthenticated(), controller.index);
router.get('/:id', auth.isAuthenticated(), controller.show);
router.get('/:id/statistics', auth.hasRole('supervisor'), controller.companyStatistics);
router.get('/:id/registers', auth.hasRole('supervisor'), controller.companyRegisters);
router.get('/:id/persons/export', auth.hasRole('supervisor'), controller.exportExcel);
router.get('/:id/persons', auth.isAuthenticated(), controller.companyPersons);

//---------------------------------
//              POST
//---------------------------------

router.post('/', auth.isAuthenticated(), controller.create);
router.post('/:id/persons', auth.hasRole('supervisor'), controller.createPerson);
router.post('/:id/persons/import', auth.isAuthenticated(), upload.single('file'), controller.importExcel);

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
