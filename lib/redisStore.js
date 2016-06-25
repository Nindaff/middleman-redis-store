var redis = require('redis')
var Promise = require('bluebird')

function RedisStore (options) {
  if (!(this instanceof RedisStore)) return new RedisStore(options)
  options = options || {}
  this.client = null
  this.prefix = options.prefix || 'middleman:'
  this.expire = null
  this._expirationPolicy = false

  if (options.url) {
    options.socket = options.url
  }
  if (options.maxAge) {
    options.ttl = options.maxAge
  }

  if (options.client) {
    this.client = options.client
  } else if (options.socket) {
    this.client = redis.createClient(options.socket, options)
  } else {
    this.client = redis.createClient(options)
  }

  if (options.pass) {
    this.client.auth(options.pass, function (err) {
      if (err) {
        throw err
      }
    })
  }

  if (typeof options.db !== 'undefined') {
    this.client.select(options.db)
    this.client.on('connect', function () {
      this.client.select(options.db)
    }.bind(this))
  }

  if (typeof options.ttl !== 'undefined') {
    this.expire = options.ttl
    this._expirationPolicy = true
  }
}

RedisStore.prototype.get = function (key) {
  key = this._resolveKey(key)
  return new Promise(function (resolve, reject) {
    this.client.get(key, function (err, data) {
      if (err) {
        return Promise.reject(err)
      }
      if (!data) {
        return resolve(null)
      }
      try {
        data = JSON.parse(data.toString())
      } catch (e) {
        return reject(e)
      }
      resolve(data)
    })
  }.bind(this))
}

RedisStore.prototype.set = function (key, val) {
  key = this._resolveKey(key)
  return new Promise(function (resolve, reject) {
    var data
    try {
      data = JSON.stringify(val)
    } catch (e) {
      return reject(e)
    }
    var args = [key, data]
    if (this._expirationPolicy) {
      args = args.concat(['PX', this.expire])
    }
    this.client.set(args, function (err) {
      if (err) {
        return reject(err)
      }
      resolve(val)
    })
  }.bind(this))
}

RedisStore.prototype.del = function (key) {
  key = this._resolveKey(key)
  return new Promise(function (resolve, reject) {
    this.client.del(key, function (err) {
      if (err) {
        return reject(err)
      }
      resolve(true)
    })
  }.bind(this))
}

RedisStore.prototype._resolveKey = function (key) {
  return this.prefix + key
}

module.exports = RedisStore
