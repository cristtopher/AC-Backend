'use strict';

var proxyquire = require('proxyquire').noPreserveCache();

var personCtrlStub = {
  index: 'personCtrl.index',
  show: 'personCtrl.show',
  create: 'personCtrl.create',
  upsert: 'personCtrl.upsert',
  patch: 'personCtrl.patch',
  destroy: 'personCtrl.destroy'
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
var personIndex = proxyquire('./index.js', {
  express: {
    Router() {
      return routerStub;
    }
  },
  './person.controller': personCtrlStub,
  '../../auth/auth.service': authServiceStub
});

describe('Person API Router:', function() {
  it('should return an express router instance', function() {
    expect(personIndex).to.equal(routerStub);
  });

  describe('GET /api/persons', function() {
    it('should route to person.controller.index', function() {
      expect(routerStub.get
        .withArgs('/', 'authService.isAuthenticated', 'personCtrl.index')
        ).to.have.been.calledOnce;
    });
  });

  describe('GET /api/persons/:id', function() {
    it('should route to person.controller.show', function() {
      expect(routerStub.get
        .withArgs('/:id', 'authService.isAuthenticated', 'personCtrl.show')
        ).to.have.been.calledOnce;
    });
  });

  describe('POST /api/persons', function() {
    it('should route to person.controller.create', function() {
      expect(routerStub.post
        .withArgs('/', 'authService.isAuthenticated', 'personCtrl.create')
        ).to.have.been.calledOnce;
    });
  });

  describe('PUT /api/persons/:id', function() {
    it('should route to person.controller.upsert', function() {
      expect(routerStub.put
        .withArgs('/:id', 'authService.isAuthenticated', 'personCtrl.upsert')
        ).to.have.been.calledOnce;
    });
  });

  describe('PATCH /api/persons/:id', function() {
    it('should route to person.controller.patch', function() {
      expect(routerStub.patch
        .withArgs('/:id', 'authService.isAuthenticated', 'personCtrl.patch')
        ).to.have.been.calledOnce;
    });
  });

  describe('DELETE /api/persons/:id', function() {
    it('should route to person.controller.destroy', function() {
      expect(routerStub.delete
        .withArgs('/:id', 'authService.isAuthenticated', 'personCtrl.destroy')
        ).to.have.been.calledOnce;
    });
  });
});
