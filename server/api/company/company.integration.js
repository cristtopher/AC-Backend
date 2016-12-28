'use strict';

var app = require('../..');
import request from 'supertest';
import User from '../user/user.model';

var token, 
    newCompany;

describe('Company API:', function() {
  
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
  
  describe('GET /api/companies', function() {
    var companies;

    beforeEach(function(done) {
      request(app)
        .get('/api/companies')
        .set('authorization', `Bearer ${token}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          companies = res.body;
          done();
        });
    });

    it('should respond with JSON array', function() {
      expect(companies).to.be.instanceOf(Array);
    });
  });

  describe('POST /api/companies', function() {
    beforeEach(function(done) {
      request(app)
        .post('/api/companies')
        .set('authorization', `Bearer ${token}`)
        .send({
          name: 'New Company',
          description: 'This is the brand new company!!!'
        })
        .expect(201)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          newCompany = res.body;
          done();
        });
    });

    it('should respond with the newly created company', function() {
      expect(newCompany.name).to.equal('New Company');
      expect(newCompany.description).to.equal('This is the brand new company!!!');
    });
  });

  describe('GET /api/companies/:id', function() {
    var company;

    beforeEach(function(done) {
      request(app)
        .get(`/api/companies/${newCompany._id}`)
        .set('authorization', `Bearer ${token}`)
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
      expect(company.name).to.equal('New Company');
      expect(company.description).to.equal('This is the brand new company!!!');
    });
  });

  describe('PUT /api/companies/:id', function() {
    var updatedCompany;

    beforeEach(function(done) {
      request(app)
        .put(`/api/companies/${newCompany._id}`)
        .set('authorization', `Bearer ${token}`)
        .send({
          name: 'Updated Company',
          description: 'This is the updated company!!!'
        })
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if(err) {
            return done(err);
          }
          updatedCompany = res.body;
          done();
        });
    });

    afterEach(function() {
      updatedCompany = {};
    });

    it('should respond with the original company', function() {
      expect(updatedCompany.name).to.equal('New Company');
      expect(updatedCompany.description).to.equal('This is the brand new company!!!');
    });

    it('should respond with the updated company on a subsequent GET', function(done) {
      request(app)
        .get(`/api/companies/${newCompany._id}`)
        .set('authorization', `Bearer ${token}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          let company = res.body;

          expect(company.name).to.equal('Updated Company');
          expect(company.description).to.equal('This is the updated company!!!');

          done();
        });
    });
  });

  describe('PATCH /api/companies/:id', function() {
    var patchedCompany;

    beforeEach(function(done) {
      request(app)
        .patch(`/api/companies/${newCompany._id}`)
        .set('authorization', `Bearer ${token}`)
        .send([
          { op: 'replace', path: '/name', value: 'Patched Company' },
          { op: 'replace', path: '/description', value: 'This is the patched company!!!' }
        ])
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if(err) {
            return done(err);
          }
          patchedCompany = res.body;
          done();
        });
    });

    afterEach(function() {
      patchedCompany = {};
    });

    it('should respond with the patched company', function() {
      expect(patchedCompany.name).to.equal('Patched Company');
      expect(patchedCompany.description).to.equal('This is the patched company!!!');
    });
  });

  describe('DELETE /api/companies/:id', function() {
    it('should respond with 204 on successful removal', function(done) {
      request(app)
        .delete(`/api/companies/${newCompany._id}`)
        .set('authorization', `Bearer ${token}`)
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
        .delete(`/api/companies/${newCompany._id}`)
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
