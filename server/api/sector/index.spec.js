'use strict';

var proxyquire = require('proxyquire').noPreserveCache();

var sectorCtrlStub = {
  index: 'sectorCtrl.index',
  show: 'sectorCtrl.show',
  create: 'sectorCtrl.create',
  upsert: 'sectorCtrl.upsert',
  patch: 'sectorCtrl.patch',
  destroy: 'sectorCtrl.destroy'
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
var sectorIndex = proxyquire('./index', {
  express: {
    Router() {
      return routerStub;
    }
  },
  './sector.controller': sectorCtrlStub,
  '../../auth/auth.service': authServiceStub
});

describe('Sector API Router:', function() {
  it('should return an express router instance', function() {
    expect(sectorIndex).to.equal(routerStub);
  });

  describe('GET /api/sectors', function() {
    it('should route to sector.controller.index', function() {
      expect(routerStub.get
        .withArgs('/', 'authService.isAuthenticated', 'sectorCtrl.index')
        ).to.have.been.calledOnce;
    });
  });

  describe('GET /api/sectors/:id', function() {
    it('should route to sector.controller.show', function() {
      expect(routerStub.get
        .withArgs('/:id', 'authService.isAuthenticated', 'sectorCtrl.show')
        ).to.have.been.calledOnce;
    });
  });

  describe('POST /api/sectors', function() {
    it('should route to sector.controller.create', function() {
      expect(routerStub.post
        .withArgs('/', 'authService.isAuthenticated', 'sectorCtrl.create')
        ).to.have.been.calledOnce;
    });
  });

  describe('PUT /api/sectors/:id', function() {
    it('should route to sector.controller.upsert', function() {
      expect(routerStub.put
        .withArgs('/:id', 'authService.isAuthenticated', 'sectorCtrl.upsert')
        ).to.have.been.calledOnce;
    });
  });

  describe('PATCH /api/sectors/:id', function() {
    it('should route to sector.controller.patch', function() {
      expect(routerStub.patch
        .withArgs('/:id', 'authService.isAuthenticated', 'sectorCtrl.patch')
        ).to.have.been.calledOnce;
    });
  });

  describe('DELETE /api/sectors/:id', function() {
    it('should route to sector.controller.destroy', function() {
      expect(routerStub.delete
        .withArgs('/:id', 'authService.isAuthenticated', 'sectorCtrl.destroy')
        ).to.have.been.calledOnce;
    });
  });
});
