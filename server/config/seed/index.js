/**
 * Populate DB with sample data on server start
 * to disable, edit config/environment/index.js, and set `seedDB: false`
 */

'use strict';

import Company  from '../../api/company/company.model';
import Sector   from '../../api/sector/sector.model';
import User     from '../../api/user/user.model';
import Person   from '../../api/person/person.model';
import Register from '../../api/register/register.model';
import Pda      from '../../api/pda/pda.model';

import companies from './companies.json';
import sectors   from './sectors.json';
import users     from './users.json';
import persons   from './persons.json';
import registers from './registers.json';
import pdas      from './pdas.json';

Company.find({}).remove()
  .then(() => Sector.find({}).remove())
  .then(() => User.find({}).remove())
  .then(() => Person.find({}).remove())
  .then(() => Register.find({}).remove())
  .then(() => Pda.find({}).remove())
  // seeding...
  .then(() => Company.create(companies))
  .then(() => Sector.create(sectors))
  .then(() => User.create(users))
  .then(() => Person.create(persons))
  .then(() => Register.create(registers))
  .then(() => Pda.create(pdas))
  .then(() => console.log('=== DB seeding done.')) 
  .catch(err => console.log(`[DB Seed] error: ${err.stack}`)); /* eslint eol-last: 0 */
