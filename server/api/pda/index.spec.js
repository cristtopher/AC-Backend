'use strict';

var proxyquire = require('proxyquire').noPreserveCache();

var pdaCtrlStub = {
  index: 'pdaCtrl.index',
  show: 'pdaCtrl.show',
  create: 'pdaCtrl.create',
  upsert: 'pdaCtrl.upsert',
  patch: 'pdaCtrl.patch',
  destroy: 'pdaCtrl.destroy'
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
var pdaIndex = proxyquire('./index', {
  express: {
    Router() {
      return routerStub;
    }
  },
  './pda.controller': pdaCtrlStub,
  '../../auth/auth.service': authServiceStub
});

describe('Sector API Router:', function() {
  it('should return an express router instance', function() {
    expect(pdaIndex).to.equal(routerStub);
  });

  describe('GET /api/pdas', function() {
    it('should route to pda.controller.index', function() {
      expect(routerStub.get
        .withArgs('/', 'authService.isAuthenticated', 'pdaCtrl.index')
        ).to.have.been.calledOnce;
    });
  });

  describe('GET /api/pdas/:id', function() {
    it('should route to pda.controller.show', function() {
      expect(routerStub.get
        .withArgs('/:id', 'authService.isAuthenticated', 'pdaCtrl.show')
        ).to.have.been.calledOnce;
    });
  });

  describe('POST /api/pdas', function() {
    it('should route to pda.controller.create', function() {
      expect(routerStub.post
        .withArgs('/', 'authService.isAuthenticated', 'pdaCtrl.create')
        ).to.have.been.calledOnce;
    });
  });

  describe('PUT /api/pdas/:id', function() {
    it('should route to pda.controller.upsert', function() {
      expect(routerStub.put
        .withArgs('/:id', 'authService.isAuthenticated', 'pdaCtrl.upsert')
        ).to.have.been.calledOnce;
    });
  });

  describe('PATCH /api/pdas/:id', function() {
    it('should route to pda.controller.patch', function() {
      expect(routerStub.patch
        .withArgs('/:id', 'authService.isAuthenticated', 'pdaCtrl.patch')
        ).to.have.been.calledOnce;
    });
  });

  describe('DELETE /api/pdas/:id', function() {
    it('should route to pda.controller.destroy', function() {
      expect(routerStub.delete
        .withArgs('/:id', 'authService.isAuthenticated', 'pdaCtrl.destroy')
        ).to.have.been.calledOnce;
    });
  });
});
