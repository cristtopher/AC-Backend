'use strict';

import { Router } from 'express';

import multer from 'multer';

import * as controller from './person.controller';
import * as auth       from '../../auth/auth.service';

var router = new Router();

var upload = multer({ dest: '/tmp/' });

//---------------------------------
//              GET
//---------------------------------

router.get('/', auth.isAuthenticated(), controller.index);
router.get('/export', auth.hasRole('supervisor'), controller.exportExcel);
router.get('/:id', auth.isAuthenticated(), controller.show);

//---------------------------------
//              POST
//---------------------------------

router.post('/', auth.isAuthenticated(), controller.create);
router.post('/import', upload.single('peopleImport'), controller.importExcel);

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
