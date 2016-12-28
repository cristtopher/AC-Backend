'use strict';

var app = require('../..');
import request from 'supertest';
import User from '../user/user.model';

var token,
    newPerson;

describe('Person API:', function() {
  
  before(function() {
    return User.remove().then(function() {
      var user = new User({
        name: 'Fake User',
        rut: '1234567-7',
        password: 'password'
      });

      return user.save()
    })
  });
  
  beforeEach(function(done) {
    request(app)
      .post('/auth/local')
      .send({
        rut: '1234567-7',
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
    return User.remove();
  });
  
  describe('GET /api/persons', function() {
    var persons;

    beforeEach(function(done) {
      request(app)
        .get('/api/persons')
        .set('authorization', `Bearer ${token}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          persons = res.body;
          done();
        });
    });

    it('should respond with JSON array', function() {
      expect(persons).to.be.instanceOf(Array);
    });
  });

  describe('POST /api/persons', function() {
    beforeEach(function(done) {
      request(app)
        .post('/api/persons')
        .set('authorization', `Bearer ${token}`)
        .send({
          name: 'New Person',
          card: 33
        })
        .expect(201)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          newPerson = res.body;
          done();
        });
    });

    it('should respond with the newly created person', function() {
      expect(newPerson.name).to.equal('New Person');
      expect(newPerson.card).to.equal(33);
    });
  });

  describe('GET /api/persons/:id', function() {
    var person;

    beforeEach(function(done) {
      request(app)
        .get(`/api/persons/${newPerson._id}`)
        .set('authorization', `Bearer ${token}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          person = res.body;
          done();
        });
    });

    afterEach(function() {
      person = {};
    });

    it('should respond with the requested person', function() {
      expect(person.name).to.equal('New Person');
      expect(person.card).to.equal(33);
    });
  });

  describe('PUT /api/persons/:id', function() {
    var updatedPerson;

    beforeEach(function(done) {
      request(app)
        .put(`/api/persons/${newPerson._id}`)
        .set('authorization', `Bearer ${token}`)
        .send({
          name: 'Updated Person',
          card: 34
        })
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if(err) {
            return done(err);
          }
          updatedPerson = res.body;
          done();
        });
    });

    afterEach(function() {
      updatedPerson = {};
    });

    it('should respond with the original person', function() {
      expect(updatedPerson.name).to.equal('New Person');
      expect(updatedPerson.card).to.equal(33);
    });

    it('should respond with the updated person on a subsequent GET', function(done) {
      console.log('newPerson:' + JSON.stringify(newPerson))
      
      request(app)
        .get(`/api/persons/${newPerson._id}`)
        .set('authorization', `Bearer ${token}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          let person = res.body;

          expect(person.name).to.equal('Updated Person');
          expect(person.card).to.equal(34);

          done();
        });
    });
  });

  describe('PATCH /api/persons/:id', function() {
    var patchedPerson;
    
    beforeEach(function(done) {
      request(app)
        .patch(`/api/persons/${newPerson._id}`)
        .set('authorization', `Bearer ${token}`)
        .send([
          { op: 'replace', path: '/name', value: 'Patched Person' },
          { op: 'replace', path: '/card', value: 35 }
        ])
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if(err) {
            return done(err);
          }
          patchedPerson = res.body;
          done();
        });
    });

    afterEach(function() {
      patchedPerson = {};
    });

    it('should respond with the patched person', function() {
      expect(patchedPerson.name).to.equal('Patched Person');
      expect(patchedPerson.card).to.equal(35);
    });
  });

  describe('DELETE /api/persons/:id', function() {
    it('should respond with 204 on successful removal', function(done) {
      request(app)
        .delete(`/api/persons/${newPerson._id}`)
        .set('authorization', `Bearer ${token}`)
        .expect(204)
        .end(err => {
          if(err) {
            return done(err);
          }
          done();
        });
    });

    it('should respond with 404 when person does not exist', function(done) {
      request(app)
        .delete(`/api/persons/${newPerson._id}`)
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
});
