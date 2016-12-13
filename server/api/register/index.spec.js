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
  './register.controller': registerCtrlStub
});

describe('Register API Router:', function() {
  it('should return an express router instance', function() {
    expect(registerIndex).to.equal(routerStub);
  });

  describe('GET /api/registers', function() {
    it('should route to register.controller.index', function() {
      expect(routerStub.get
        .withArgs('/', 'registerCtrl.index')
        ).to.have.been.calledOnce;
    });
  });

  describe('GET /api/registers/:id', function() {
    it('should route to register.controller.show', function() {
      expect(routerStub.get
        .withArgs('/:id', 'registerCtrl.show')
        ).to.have.been.calledOnce;
    });
  });

  describe('POST /api/registers', function() {
    it('should route to register.controller.create', function() {
      expect(routerStub.post
        .withArgs('/', 'registerCtrl.create')
        ).to.have.been.calledOnce;
    });
  });

  describe('PUT /api/registers/:id', function() {
    it('should route to register.controller.upsert', function() {
      expect(routerStub.put
        .withArgs('/:id', 'registerCtrl.upsert')
        ).to.have.been.calledOnce;
    });
  });

  describe('PATCH /api/registers/:id', function() {
    it('should route to register.controller.patch', function() {
      expect(routerStub.patch
        .withArgs('/:id', 'registerCtrl.patch')
        ).to.have.been.calledOnce;
    });
  });

  describe('DELETE /api/registers/:id', function() {
    it('should route to register.controller.destroy', function() {
      expect(routerStub.delete
        .withArgs('/:id', 'registerCtrl.destroy')
        ).to.have.been.calledOnce;
    });
  });
});
