'use strict';

var app = require('../..');
import request from 'supertest';
import User from '../user/user.model';


var user;
var token;
var newPda;

describe('Pda API:', function() {
  
  before(function() {
    return User.remove().then(function() {
      user = new User({
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
  
  describe('GET /api/pdas', function() {
    var pdas;
    
    beforeEach(function(done) {
      request(app)
        .get('/api/pdas')
        .set('authorization', `Bearer ${token}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          pdas = res.body;
          done();
        });
    });

    it('should respond with JSON array', function() {
      expect(pdas).to.be.instanceOf(Array);
    });
  });

  describe('POST /api/pdas', function() {
    beforeEach(function(done) {
      request(app)
        .post('/api/pdas')
        .set('authorization', `Bearer ${token}`)
        .send({
          name: 'New Pda',
          description: 'This is the brand new pda!!!'
        })
        .expect(201)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          newPda = res.body;
          done();
        });
    });

    it('should respond with the newly created pda', function() {
      expect(newPda.name).to.equal('New Pda');
      expect(newPda.description).to.equal('This is the brand new pda!!!');
    });
  });

  describe('GET /api/pdas/:id', function() {
    var pda;

    beforeEach(function(done) {
      request(app)
        .get(`/api/pdas/${newPda._id}`)
        .set('authorization', `Bearer ${token}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          pda = res.body;
          done();
        });
    });

    afterEach(function() {
      pda = {};
    });

    it('should respond with the requested pda', function() {
      expect(pda.name).to.equal('New Pda');
      expect(pda.description).to.equal('This is the brand new pda!!!');
    });
  });

  describe('PUT /api/pdas/:id', function() {
    var updatedPda;

    beforeEach(function(done) {
      request(app)
        .put(`/api/pdas/${newPda._id}`)
        .set('authorization', `Bearer ${token}`)
        .send({
          name: 'Updated Pda',
          description: 'This is the updated pda!!!'
        })
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if(err) {
            return done(err);
          }
          updatedPda = res.body;
          done();
        });
    });

    afterEach(function() {
      updatedPda = {};
    });

    it('should respond with the original pda', function() {
      expect(updatedPda.name).to.equal('New Pda');
      expect(updatedPda.description).to.equal('This is the brand new pda!!!');
    });

    it('should respond with the updated pda on a subsequent GET', function(done) {
      request(app)
        .get(`/api/pdas/${newPda._id}`)
        .set('authorization', `Bearer ${token}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          let pda = res.body;

          expect(pda.name).to.equal('Updated Pda');
          expect(pda.description).to.equal('This is the updated pda!!!');

          done();
        });
    });
  });

  describe('PATCH /api/pdas/:id', function() {
    var patchedPda;

    beforeEach(function(done) {
      request(app)
        .patch(`/api/pdas/${newPda._id}`)
        .set('authorization', `Bearer ${token}`)
        .send([
          { op: 'replace', path: '/name', value: 'Patched Pda' },
          { op: 'replace', path: '/description', value: 'This is the patched pda!!!' }
        ])
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if(err) {
            return done(err);
          }
          patchedPda = res.body;
          done();
        });
    });

    afterEach(function() {
      patchedPda = {};
    });

    it('should respond with the patched pda', function() {
      expect(patchedPda.name).to.equal('Patched Pda');
      expect(patchedPda.description).to.equal('This is the patched pda!!!');
    });
  });

  describe('DELETE /api/pdas/:id', function() {
    it('should respond with 204 on successful removal', function(done) {
      request(app)
        .delete(`/api/pdas/${newPda._id}`)
        .set('authorization', `Bearer ${token}`)
        .expect(204)
        .end(err => {
          if(err) {
            return done(err);
          }
          done();
        });
    });

    it('should respond with 404 when pda does not exist', function(done) {
      request(app)
        .delete(`/api/pdas/${newPda._id}`)
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
