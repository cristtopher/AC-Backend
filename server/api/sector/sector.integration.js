'use strict';

var app = require('../..');
import request from 'supertest';
import User from '../user/user.model';


var user;
var token;
var newSector;

describe('Sector API:', function() {
  
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
  
  describe('GET /api/sectors', function() {
    var sectors;
    
    beforeEach(function(done) {
      request(app)
        .get('/api/sectors')
        .set('authorization', `Bearer ${token}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          sectors = res.body;
          done();
        });
    });

    it('should respond with JSON array', function() {
      expect(sectors).to.be.instanceOf(Array);
    });
  });

  describe('POST /api/sectors', function() {
    beforeEach(function(done) {
      request(app)
        .post('/api/sectors')
        .set('authorization', `Bearer ${token}`)
        .send({
          name: 'New Sector',
          description: 'This is the brand new sector!!!'
        })
        .expect(201)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          newSector = res.body;
          done();
        });
    });

    it('should respond with the newly created sector', function() {
      expect(newSector.name).to.equal('New Sector');
      expect(newSector.description).to.equal('This is the brand new sector!!!');
    });
  });

  describe('GET /api/sectors/:id', function() {
    var sector;

    beforeEach(function(done) {
      request(app)
        .get(`/api/sectors/${newSector._id}`)
        .set('authorization', `Bearer ${token}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          sector = res.body;
          done();
        });
    });

    afterEach(function() {
      sector = {};
    });

    it('should respond with the requested sector', function() {
      expect(sector.name).to.equal('New Sector');
      expect(sector.description).to.equal('This is the brand new sector!!!');
    });
  });

  describe('PUT /api/sectors/:id', function() {
    var updatedSector;

    beforeEach(function(done) {
      request(app)
        .put(`/api/sectors/${newSector._id}`)
        .set('authorization', `Bearer ${token}`)
        .send({
          name: 'Updated Sector',
          description: 'This is the updated sector!!!'
        })
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if(err) {
            return done(err);
          }
          updatedSector = res.body;
          done();
        });
    });

    afterEach(function() {
      updatedSector = {};
    });

    it('should respond with the original sector', function() {
      expect(updatedSector.name).to.equal('New Sector');
      expect(updatedSector.description).to.equal('This is the brand new sector!!!');
    });

    it('should respond with the updated sector on a subsequent GET', function(done) {
      request(app)
        .get(`/api/sectors/${newSector._id}`)
        .set('authorization', `Bearer ${token}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          let sector = res.body;

          expect(sector.name).to.equal('Updated Sector');
          expect(sector.description).to.equal('This is the updated sector!!!');

          done();
        });
    });
  });

  describe('PATCH /api/sectors/:id', function() {
    var patchedSector;

    beforeEach(function(done) {
      request(app)
        .patch(`/api/sectors/${newSector._id}`)
        .set('authorization', `Bearer ${token}`)
        .send([
          { op: 'replace', path: '/name', value: 'Patched Sector' },
          { op: 'replace', path: '/description', value: 'This is the patched sector!!!' }
        ])
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if(err) {
            return done(err);
          }
          patchedSector = res.body;
          done();
        });
    });

    afterEach(function() {
      patchedSector = {};
    });

    it('should respond with the patched sector', function() {
      expect(patchedSector.name).to.equal('Patched Sector');
      expect(patchedSector.description).to.equal('This is the patched sector!!!');
    });
  });

  describe('DELETE /api/sectors/:id', function() {
    it('should respond with 204 on successful removal', function(done) {
      request(app)
        .delete(`/api/sectors/${newSector._id}`)
        .set('authorization', `Bearer ${token}`)
        .expect(204)
        .end(err => {
          if(err) {
            return done(err);
          }
          done();
        });
    });

    it('should respond with 404 when sector does not exist', function(done) {
      request(app)
        .delete(`/api/sectors/${newSector._id}`)
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
