'use strict';

var app = require('../..');
import request from 'supertest';

var newRegister;

describe('Register API:', function() {
  describe('GET /api/registers', function() {
    var registers;

    beforeEach(function(done) {
      request(app)
        .get('/api/registers')
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          registers = res.body;
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
        .send({
          name: 'New Register',
          info: 'This is the brand new company!!!'
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

    it('should respond with the newly created company', function() {
      expect(newRegister.name).to.equal('New Register');
      expect(newRegister.info).to.equal('This is the brand new company!!!');
    });
  });

  describe('GET /api/registers/:id', function() {
    var company;

    beforeEach(function(done) {
      request(app)
        .get(`/api/registers/${newRegister._id}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          company = res.body;
          done();
        });
    });

    afterEach(function() {
      company = {};
    });

    it('should respond with the requested company', function() {
      expect(company.name).to.equal('New Register');
      expect(company.info).to.equal('This is the brand new company!!!');
    });
  });

  describe('PUT /api/registers/:id', function() {
    var updatedRegister;

    beforeEach(function(done) {
      request(app)
        .put(`/api/registers/${newRegister._id}`)
        .send({
          name: 'Updated Register',
          info: 'This is the updated company!!!'
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

    it('should respond with the original company', function() {
      expect(updatedRegister.name).to.equal('New Register');
      expect(updatedRegister.info).to.equal('This is the brand new company!!!');
    });

    it('should respond with the updated company on a subsequent GET', function(done) {
      request(app)
        .get(`/api/registers/${newRegister._id}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          let company = res.body;

          expect(company.name).to.equal('Updated Register');
          expect(company.info).to.equal('This is the updated company!!!');

          done();
        });
    });
  });

  describe('PATCH /api/registers/:id', function() {
    var patchedRegister;

    beforeEach(function(done) {
      request(app)
        .patch(`/api/registers/${newRegister._id}`)
        .send([
          { op: 'replace', path: '/name', value: 'Patched Register' },
          { op: 'replace', path: '/info', value: 'This is the patched company!!!' }
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

    it('should respond with the patched company', function() {
      expect(patchedRegister.name).to.equal('Patched Register');
      expect(patchedRegister.info).to.equal('This is the patched company!!!');
    });
  });

  describe('DELETE /api/registers/:id', function() {
    it('should respond with 204 on successful removal', function(done) {
      request(app)
        .delete(`/api/registers/${newRegister._id}`)
        .expect(204)
        .end(err => {
          if(err) {
            return done(err);
          }
          done();
        });
    });

    it('should respond with 404 when company does not exist', function(done) {
      request(app)
        .delete(`/api/registers/${newRegister._id}`)
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
