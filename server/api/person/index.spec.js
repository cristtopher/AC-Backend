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
  './person.controller': personCtrlStub
});

describe('Person API Router:', function() {
  it('should return an express router instance', function() {
    expect(personIndex).to.equal(routerStub);
  });

  describe('GET /api/persons', function() {
    it('should route to person.controller.index', function() {
      expect(routerStub.get
        .withArgs('/', 'personCtrl.index')
        ).to.have.been.calledOnce;
    });
  });

  describe('GET /api/persons/:id', function() {
    it('should route to person.controller.show', function() {
      expect(routerStub.get
        .withArgs('/:id', 'personCtrl.show')
        ).to.have.been.calledOnce;
    });
  });

  describe('POST /api/persons', function() {
    it('should route to person.controller.create', function() {
      expect(routerStub.post
        .withArgs('/', 'personCtrl.create')
        ).to.have.been.calledOnce;
    });
  });

  describe('PUT /api/persons/:id', function() {
    it('should route to person.controller.upsert', function() {
      expect(routerStub.put
        .withArgs('/:id', 'personCtrl.upsert')
        ).to.have.been.calledOnce;
    });
  });

  describe('PATCH /api/persons/:id', function() {
    it('should route to person.controller.patch', function() {
      expect(routerStub.patch
        .withArgs('/:id', 'personCtrl.patch')
        ).to.have.been.calledOnce;
    });
  });

  describe('DELETE /api/persons/:id', function() {
    it('should route to person.controller.destroy', function() {
      expect(routerStub.delete
        .withArgs('/:id', 'personCtrl.destroy')
        ).to.have.been.calledOnce;
    });
  });
});
