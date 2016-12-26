'use strict';

var proxyquire = require('proxyquire').noPreserveCache();

var registerCtrlStub = {
  index: 'registerCtrl.index',
  show: 'registerCtrl.show',
  create: 'registerCtrl.create',
  upsert: 'registerCtrl.upsert',
  patch: 'registerCtrl.patch',
  destroy: 'registerCtrl.destroy'
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
var registerIndex = proxyquire('./index.js', {
  express: {
    Router() {
      return routerStub;
    }
  },
  './register.controller': registerCtrlStub,
  '../../auth/auth.service': authServiceStub
});

describe('Register API Router:', function() {
  it('should return an express router instance', function() {
    expect(registerIndex).to.equal(routerStub);
  });

  describe('GET /api/registers', function() {
    it('should route to register.controller.index', function() {
      expect(routerStub.get
        .withArgs('/', 'authService.isAuthenticated', 'registerCtrl.index')
        ).to.have.been.calledOnce;
    });
  });

  describe('GET /api/registers/:id', function() {
    it('should route to register.controller.show', function() {
      expect(routerStub.get
        .withArgs('/:id', 'authService.isAuthenticated', 'registerCtrl.show')
        ).to.have.been.calledOnce;
    });
  });

  describe('POST /api/registers', function() {
    it('should route to register.controller.create', function() {
      expect(routerStub.post
        .withArgs('/', 'authService.isAuthenticated', 'registerCtrl.create')
        ).to.have.been.calledOnce;
    });
  });

  describe('PUT /api/registers/:id', function() {
    it('should route to register.controller.upsert', function() {
      expect(routerStub.put
        .withArgs('/:id', 'authService.isAuthenticated', 'registerCtrl.upsert')
        ).to.have.been.calledOnce;
    });
  });

  describe('PATCH /api/registers/:id', function() {
    it('should route to register.controller.patch', function() {
      expect(routerStub.patch
        .withArgs('/:id', 'authService.isAuthenticated', 'registerCtrl.patch')
        ).to.have.been.calledOnce;
    });
  });

  describe('DELETE /api/registers/:id', function() {
    it('should route to register.controller.destroy', function() {
      expect(routerStub.delete
        .withArgs('/:id', 'authService.isAuthenticated', 'registerCtrl.destroy')
        ).to.have.been.calledOnce;
    });
  });
});
