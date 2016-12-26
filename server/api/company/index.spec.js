'use strict';

var proxyquire = require('proxyquire').noPreserveCache();

var companyCtrlStub = {
  index: 'companyCtrl.index',
  show: 'companyCtrl.show',
  create: 'companyCtrl.create',
  upsert: 'companyCtrl.upsert',
  patch: 'companyCtrl.patch',
  destroy: 'companyCtrl.destroy'
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
var companyIndex = proxyquire('./index.js', {
  express: {
    Router() {
      return routerStub;
    }
  },
  './company.controller': companyCtrlStub,
  '../../auth/auth.service': authServiceStub
});

describe('Company API Router:', function() {
  it('should return an express router instance', function() {
    expect(companyIndex).to.equal(routerStub);
  });

  describe('GET /api/companies', function() {
    it('should route to company.controller.index', function() {
      expect(routerStub.get
        .withArgs('/', 'authService.isAuthenticated', 'companyCtrl.index')
        ).to.have.been.calledOnce;
    });
  });

  describe('GET /api/companies/:id', function() {
    it('should route to company.controller.show', function() {
      expect(routerStub.get
        .withArgs('/:id', 'authService.isAuthenticated', 'companyCtrl.show')
        ).to.have.been.calledOnce;
    });
  });

  describe('POST /api/companies', function() {
    it('should route to company.controller.create', function() {
      expect(routerStub.post
        .withArgs('/', 'authService.isAuthenticated', 'companyCtrl.create')
        ).to.have.been.calledOnce;
    });
  });

  describe('PUT /api/companies/:id', function() {
    it('should route to company.controller.upsert', function() {
      expect(routerStub.put
        .withArgs('/:id', 'authService.isAuthenticated', 'companyCtrl.upsert')
        ).to.have.been.calledOnce;
    });
  });

  describe('PATCH /api/companies/:id', function() {
    it('should route to company.controller.patch', function() {
      expect(routerStub.patch
        .withArgs('/:id', 'authService.isAuthenticated', 'companyCtrl.patch')
        ).to.have.been.calledOnce;
    });
  });

  describe('DELETE /api/companies/:id', function() {
    it('should route to company.controller.destroy', function() {
      expect(routerStub.delete
        .withArgs('/:id', 'authService.isAuthenticated', 'companyCtrl.destroy')
        ).to.have.been.calledOnce;
    });
  });
});
