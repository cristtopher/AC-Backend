'use strict';

import { Router } from 'express';
import multer from 'multer';

import * as controller from './user.controller';
import * as auth from '../../auth/auth.service';

var router = new Router();
var upload = multer({ dest: '/tmp/' });

router.get('/', auth.hasRole('admin'), controller.index);
router.delete('/:id', auth.hasRole('admin'), controller.destroy);
router.get('/me', auth.isAuthenticated(), controller.me);
router.put('/:id/password', auth.isAuthenticated(), controller.changePassword);
router.get('/:id', auth.isAuthenticated(), controller.show);
router.post('/', controller.create);
router.post('/upload', upload.single('usersUpload'), controller.importUsers);

module.exports = router;
