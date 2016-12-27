'use strict';

var app = require('../..');
import request from 'supertest';

import User from '../user/user.model';
import Person from '../person/person.model';

var token,
    newRegister;

describe('Register API:', function() {
  
  before(function(done) {
    Promise.all([
      Person.remove().then(function() {
        var persons = [{
          "_id": "5855ce0c7f45b135cbb73acf",
          "name": "Fake Person 1",
          "company": "585597684f6ad8244e26748e",
          "card":  1  
        }, {
          "_id": "5855ce0e7f45b135cbb73ad0",
          "name": "Fake Person 2",
          "company": "585597684f6ad8244e26748e",
          "card":  2  
        }];
      
        return Person.create(persons)
      }),
      User.remove()
        .then(function() {
          var user = new User({
            name: 'Fake User',
            rut: 'test@example.com',
            password: 'password'
          });

          return user.save()
        })
    ])
    .then(() => done())
  })
  
  beforeEach(function(done) {
    request(app)
      .post('/auth/local')
      .send({
        rut: 'test@example.com',
        password: 'password'
      })
      .expect(200)
      .expect('Content-Type', /json/)
      .end((err, res) => {
        token = res.body.token;
        done();
      });
  });
  
  after(function() {
    return Promise.all([User.remove(), Person.remove()]);
  });
  
  
  
  describe('GET /api/registers', function() {
    var registers;

    beforeEach(function(done) {
      request(app)
        .get('/api/registers')
        .set('authorization', `Bearer ${token}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          console.log(`response: ${JSON.stringify(res)}`)
          
          if(err) {
            console.log(`error: ${error}`);
            return done(err);
          }
          
          registers = res.body;
          
          console.log(`registers: ${JSON.stringify(registers)}`);
          done();
        });
    });

    it('should respond with JSON array', function() {
      expect(registers).to.be.instanceOf(Array);
    });
  });

  describe('POST /api/registers', function() {
    beforeEach(function(done) {
      request(app)
        .post('/api/registers')
        .set('authorization', `Bearer ${token}`)
        .send({
          person: '5855ce0c7f45b135cbb73acf',
          card: 33
        })
        .expect(201)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          newRegister = res.body;
          done();
        });
    });

    it('should respond with the newly created register', function() {
      expect(newRegister.person).to.equal('5855ce0c7f45b135cbb73acf');
      expect(newRegister.card).to.equal(33);
    });
  });

  describe('GET /api/registers/:id', function() {
    var register;

    beforeEach(function(done) {
      request(app)
        .get(`/api/registers/${newRegister._id}`)
        .set('authorization', `Bearer ${token}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          register = res.body;
          done();
        });
    });

    afterEach(function() {
      register = {};
    });

    it('should respond with the requested register', function() {
      expect(newRegister.person).to.equal('5855ce0c7f45b135cbb73acf');
      expect(newRegister.card).to.equal(33);
    });
  });

  describe('PUT /api/registers/:id', function() {
    var updatedRegister;

    beforeEach(function(done) {
      request(app)
        .put(`/api/registers/${newRegister._id}`)
        .set('authorization', `Bearer ${token}`)
        .send({
          person: '5855ce0e7f45b135cbb73ad0',
          card: 34
        })
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if(err) {
            return done(err);
          }
          updatedRegister = res.body;
          done();
        });
    });

    afterEach(function() {
      updatedRegister = {};
    });

    it('should respond with the original register', function() {
      expect(newRegister.person).to.equal('5855ce0c7f45b135cbb73acf');
      expect(newRegister.card).to.equal(33);
    });

    it('should respond with the updated register on a subsequent GET', function(done) {
      
      
      request(app)
        .get(`/api/registers/${updatedRegister._id}`)
        .set('authorization', `Bearer ${token}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          
          let register = res.body;
          
          expect(register.person).to.equal('5855ce0e7f45b135cbb73ad0');
          expect(register.card).to.equal(34);
          
          done();
        });
    });
  });

  describe('PATCH /api/registers/:id', function() {
    var patchedRegister;

    beforeEach(function(done) {
      request(app)
        .patch(`/api/registers/${newRegister._id}`)
        .set('authorization', `Bearer ${token}`)
        .send([
          { op: 'replace', path: '/card', value: 35 }
        ])
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if(err) {
            return done(err);
          }
          patchedRegister = res.body;
          done();
        });
    });

    afterEach(function() {
      patchedRegister = {};
    });

    it('should respond with the patched register', function() {
      expect(patchedRegister.card).to.equal(35);
    });
  });

  describe('DELETE /api/registers/:id', function() {
    it('should respond with 204 on successful removal', function(done) {
      request(app)
        .delete(`/api/registers/${newRegister._id}`)
        .set('authorization', `Bearer ${token}`)
        .expect(204)
        .end(err => {
          if(err) {
            return done(err);
          }
          done();
        });
    });

    it('should respond with 404 when register does not exist', function(done) {
      request(app)
        .delete(`/api/registers/${newRegister._id}`)
        .set('authorization', `Bearer ${token}`)
        .expect(404)
        .end(err => {
          if(err) {
            return done(err);
          }
          done();
        });
    });
  });
  
  
  after(function(done){
    Person.remove()
    .then(() => done());
  })
  
});
