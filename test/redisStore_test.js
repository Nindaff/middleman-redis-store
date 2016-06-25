var RedisStore = require('../')
var redis = require('redis')
var ioredis = require('ioredis')
var should = require('should')

function RedisServer () {
}

function testLifeCycle (store, done) {
  done = done || false
  var test = store.get('not_set')
    .then(function (val) {
      should(val).equal(null)
      return store.set('foo', 'bar')
    })
    .then(function (val) {
      val.should.equal('bar')
      return store.get('foo')
    })
    .then(function (val) {
      val.should.equal('bar')
      return store.set('foo', 'baz')
    })
    .then(function (val) {
      val.should.equal('baz')
      return store.get('foo')
    })
    .then(function (val) {
      val.should.equal('baz')
      return store.del('foo')
    })
    .then(function (val) {
      val.should.equal(true)
    })
  if (!done) {
    return test
  }
  test
    .then(function () {
      done()
    })
    .catch(done)
}

describe('RedisStore', function () {
  it('constructor should not require `new` keyword', function () {
    RedisStore().should.be.instanceof(RedisStore)
  })

  it('defaults', function (done) {
    var store = new RedisStore()
    store.prefix.should.equal('middleman:')
    store.client.should.be.instanceof(redis.RedisClient)
    should(store.expire).equal(null)
    store._expirationPolicy.should.equal(false)
    testLifeCycle(store, done)
  })

  it('should use existing client (node-redis)', function (done) {
    var client = redis.createClient()
    var store = new RedisStore({client: client})
    testLifeCycle(store, done)
  })

  it('should use existing client (ioredis)', function (done) {
    var client = ioredis.createClient()
    var store = new RedisStore({client: client})
    testLifeCycle(store, done)
  })

  it('options', function (done) {
    var store = new RedisStore({
      port: 6379,
      host: 'localhost',
      prefix: 'foo',
      maxAge: 1000
    })

    store.prefix.should.equal('foo')
    store._expirationPolicy.should.equal(true)
    store.expire.should.equal(1000)
    testLifeCycle(store, done)
  })
})
