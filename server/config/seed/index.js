/**
 * Populate DB with sample data on server start
 * to disable, edit config/environment/index.js, and set `seedDB: false`
 */

'use strict';

import Company  from '../../api/company/company.model';
import User     from '../../api/user/user.model';
import Person   from '../../api/person/person.model';
import Register from '../../api/register/register.model';

import companies from './companies.json';
import users     from './users.json';
import persons   from './persons.json';
import registers from './registers.json';

Company.find({}).remove()
  .then(() => User.find({}).remove())
  .then(() => Person.find({}).remove())
  .then(() => Register.find({}).remove())
  // seeding...
  .then(() => Company.create(companies))
  .then(() => User.create(users))
  .then(() => Person.create(persons))
  .then(() => Register.create(registers))
  .then(() => console.log('=== DB seeding done.'));