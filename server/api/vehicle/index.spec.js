'use strict';

var proxyquire = require('proxyquire').noPreserveCache();

var vehicleCtrlStub = {
  index: 'vehicleCtrl.index',
  show: 'vehicleCtrl.show',
  create: 'vehicleCtrl.create',
  upsert: 'vehicleCtrl.upsert',
  patch: 'vehicleCtrl.patch',
  destroy: 'vehicleCtrl.destroy'
};

var authServiceStub = {
  isAuthenticated() {
    return 'authService.isAuthenticated';
  },
  hasRole(role) {
    return `authService.hasRole.${role}`;
  }
};

var routerStub = {
  get: sinon.spy(),
  put: sinon.spy(),
  patch: sinon.spy(),
  post: sinon.spy(),
  delete: sinon.spy()
};

// require the index with our stubbed out modules
var vehicleIndex = proxyquire('./index.js', {
  express: {
    Router() {
      return routerStub;
    }
  },
  './vehicle.controller': vehicleCtrlStub,
  '../../auth/auth.service': authServiceStub
});

describe('Vehicle API Router:', function() {
  it('should return an express router instance', function() {
    expect(vehicleIndex).to.equal(routerStub);
  });

  describe('GET /api/vehicles', function() {
    it('should route to vehicle.controller.index', function() {
      expect(routerStub.get
        .withArgs('/', 'authService.isAuthenticated', 'vehicleCtrl.index')
        ).to.have.been.calledOnce;
    });
  });

  describe('GET /api/vehicles/:id', function() {
    it('should route to vehicle.controller.show', function() {
      expect(routerStub.get
        .withArgs('/:id', 'authService.isAuthenticated', 'vehicleCtrl.show')
        ).to.have.been.calledOnce;
    });
  });

  describe('POST /api/vehicles', function() {
    it('should route to vehicle.controller.create', function() {
      expect(routerStub.post
        .withArgs('/', 'authService.isAuthenticated', 'vehicleCtrl.create')
        ).to.have.been.calledOnce;
    });
  });

  describe('PUT /api/vehicles/:id', function() {
    it('should route to vehicle.controller.upsert', function() {
      expect(routerStub.put
        .withArgs('/:id', 'authService.isAuthenticated', 'vehicleCtrl.upsert')
        ).to.have.been.calledOnce;
    });
  });

  describe('PATCH /api/vehicles/:id', function() {
    it('should route to vehicle.controller.patch', function() {
      expect(routerStub.patch
        .withArgs('/:id', 'authService.isAuthenticated', 'vehicleCtrl.patch')
        ).to.have.been.calledOnce;
    });
  });

  describe('DELETE /api/vehicles/:id', function() {
    it('should route to vehicle.controller.destroy', function() {
      expect(routerStub.delete
        .withArgs('/:id', 'authService.isAuthenticated', 'vehicleCtrl.destroy')
        ).to.have.been.calledOnce;
    });
  });
});
