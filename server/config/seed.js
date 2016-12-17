/**
 * Populate DB with sample data on server start
 * to disable, edit config/environment/index.js, and set `seedDB: false`
 */

'use strict';

import User from '../api/user/user.model';

User.find({}).remove()
  .then(() => {
    User.create({
      provider: 'local',
      name: 'Normal User',
      email: 'user@example.com',
      password: 'user'
    }, {
      provider: 'local',
      role: 'supervisor',
      name: 'Supervisor User',
      email: 'supervisor@example.com',
      password: 'supervisor'
    }, {
      provider: 'local',
      role: 'admin',
      name: 'Admin',
      email: 'admin@example.com',
      password: 'admin'
    })
    .then(() => {
      console.log('finished populating users');
    });
  });
