'use strict';

import { Router } from 'express';

import * as controller from './sector.controller';
import * as auth from '../../auth/auth.service';

var router = new Router();

router.get('/', auth.isAuthenticated(), controller.index);
router.get('/:id', auth.isAuthenticated(), controller.show);
router.post('/', auth.isAuthenticated(), controller.create);
router.put('/:id', auth.isAuthenticated(), controller.upsert);
router.patch('/:id', auth.isAuthenticated(), controller.patch);
router.delete('/:id', auth.isAuthenticated(), controller.destroy);

router.get('/:id/registers', auth.isAuthenticated(), controller.sectorRegisters);
router.get('/:id/statistics', auth.isAuthenticated(), controller.sectorStatistics);
router.get('/:id/export', auth.hasRole('supervisor'), controller.exportRegistersExcel);


module.exports = router;
