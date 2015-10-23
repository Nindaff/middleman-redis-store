# Middleman Redis Store
  [![Travis][travis-image]][travis-url]

A Redis store implementation for middleman-proxy.

## Installation
$ npm install --save middleman-redis-store

## Usage
```js
const Middleman = require('middleman-proxy');
const RedisStore = require('middleman-redis-store');

const proxy = new Middleman({
  target: 'http://some.api.com',
  store: new RedisStore()
});
```

## Examples

### Custom redis client
```js
const client = redis.createClient() // or ioRedis.createClient();
const store = new RedisStore({
  client: client
});
```

### Expiration Policy
```js
const store = new RedisStore({
  expire: 3600000 // milliseconds
});

// Because Redis will be managing expiration, its best to set `lru: false` and NOT
// set `maxAge` in the Middleman options.
const proxy = new Middleman({
  lru: false,
  store: store
});
```

## API
#### RedisStore([options])
If no `client`, `url`, or `socket` are specified in `options`, they will be passed
directly to `redis.createClient(options).`

##### client
Type: RedisClient (node-redis, or ioRedis)
Default: `redis.createClient()`
##### prefix
Type: `string`
Default: `"middlman"`

Prefix all keys saved by the store.
##### expire
Type: `number`

Number in **milliseconds** for time-to-live on all keys saved by RedisStore. By
default no expiration policy is used.
**NOTE** If you use the redis expiration policy, you will most likely want to disable
LRU in Middleman.
##### url
Type: `string`

Redis url.
##### socket
Type: `string`

Redis socket.

##### pass
Type: `string`

Password for redis authentication.

##### db
Type: `number`

Select a redis database.

## LICENSE
MIT

[travis-image]: https://travis-ci.org/Nindaff/middleman-redis-store.svg?branch=master
[travis-url]: https://travis-ci.org/Nindaff/middleman-redis-store
