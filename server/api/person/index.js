'use strict';

import { Router } from 'express';

import * as controller from './person.controller';
import * as auth       from '../../auth/auth.service';

var router = new Router();

//---------------------------------
//              GET
//---------------------------------

router.get('/', auth.isAuthenticated(), controller.index);
router.get('/:id', auth.isAuthenticated(), controller.show);

//---------------------------------
//              POST
//---------------------------------

router.post('/', auth.isAuthenticated(), controller.create);

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
