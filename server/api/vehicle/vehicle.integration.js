'use strict';

var app = require('../..');
import request from 'supertest';
import User from '../user/user.model';

var token,
    newVehicle;

describe('Vehicle API:', function() {
  
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
  
  describe('GET /api/vehicles', function() {
    var vehicles;

    beforeEach(function(done) {
      request(app)
        .get('/api/vehicles')
        .set('authorization', `Bearer ${token}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          vehicles = res.body;
          done();
        });
    });

    it('should respond with JSON array', function() {
      expect(vehicles).to.be.instanceOf(Array);
    });
  });

  describe('POST /api/vehicles', function() {
    beforeEach(function(done) {
      request(app)
        .post('/api/vehicles')
        .set('authorization', `Bearer ${token}`)
        .send({
          name: 'New Vehicle',
          card: 33
        })
        .expect(201)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          newVehicle = res.body;
          done();
        });
    });

    it('should respond with the newly created vehicle', function() {
      expect(newVehicle.name).to.equal('New Vehicle');
      expect(newVehicle.card).to.equal(33);
    });
  });

  describe('GET /api/vehicles/:id', function() {
    var vehicle;

    beforeEach(function(done) {
      request(app)
        .get(`/api/vehicles/${newVehicle._id}`)
        .set('authorization', `Bearer ${token}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          vehicle = res.body;
          done();
        });
    });

    afterEach(function() {
      vehicle = {};
    });

    it('should respond with the requested vehicle', function() {
      expect(vehicle.name).to.equal('New Vehicle');
      expect(vehicle.card).to.equal(33);
    });
  });

  describe('PUT /api/vehicles/:id', function() {
    var updatedVehicle;

    beforeEach(function(done) {
      request(app)
        .put(`/api/vehicles/${newVehicle._id}`)
        .set('authorization', `Bearer ${token}`)
        .send({
          name: 'Updated Vehicle',
          card: 34
        })
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if(err) {
            return done(err);
          }
          updatedVehicle = res.body;
          done();
        });
    });

    afterEach(function() {
      updatedVehicle = {};
    });

    it('should respond with the original vehicle', function() {
      expect(updatedVehicle.name).to.equal('New Vehicle');
      expect(updatedVehicle.card).to.equal(33);
    });

    it('should respond with the updated vehicle on a subsequent GET', function(done) {
      console.log('newVehicle:' + JSON.stringify(newVehicle))
      
      request(app)
        .get(`/api/vehicles/${newVehicle._id}`)
        .set('authorization', `Bearer ${token}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          let vehicle = res.body;

          expect(vehicle.name).to.equal('Updated Vehicle');
          expect(vehicle.card).to.equal(34);

          done();
        });
    });
  });

  describe('PATCH /api/vehicles/:id', function() {
    var patchedVehicle;
    
    beforeEach(function(done) {
      request(app)
        .patch(`/api/vehicles/${newVehicle._id}`)
        .set('authorization', `Bearer ${token}`)
        .send([
          { op: 'replace', path: '/name', value: 'Patched Vehicle' },
          { op: 'replace', path: '/card', value: 35 }
        ])
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if(err) {
            return done(err);
          }
          patchedVehicle = res.body;
          done();
        });
    });

    afterEach(function() {
      patchedVehicle = {};
    });

    it('should respond with the patched vehicle', function() {
      expect(patchedVehicle.name).to.equal('Patched Vehicle');
      expect(patchedVehicle.card).to.equal(35);
    });
  });

  describe('DELETE /api/vehicles/:id', function() {
    it('should respond with 204 on successful removal', function(done) {
      request(app)
        .delete(`/api/vehicles/${newVehicle._id}`)
        .set('authorization', `Bearer ${token}`)
        .expect(204)
        .end(err => {
          if(err) {
            return done(err);
          }
          done();
        });
    });

    it('should respond with 404 when vehicle does not exist', function(done) {
      request(app)
        .delete(`/api/vehicles/${newVehicle._id}`)
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
