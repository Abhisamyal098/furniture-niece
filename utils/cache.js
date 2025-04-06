const NodeCache = require('node-cache');

// Create cache instance
const cache = new NodeCache({
    stdTTL: 600, // Default time to live in seconds
    checkperiod: 120 // Check for expired keys every 120 seconds
});

// Get value from cache
const get = (key) => {
    return cache.get(key);
};

// Set value in cache
const set = (key, value, ttl = 600) => {
    return cache.set(key, value, ttl);
};

// Delete value from cache
const del = (key) => {
    return cache.del(key);
};

// Clear all cache
const clear = () => {
    return cache.flushAll();
};

// Get cache stats
const stats = () => {
    return cache.getStats();
};

// Get all keys
const keys = () => {
    return cache.keys();
};

// Check if key exists
const has = (key) => {
    return cache.has(key);
};

// Get multiple values
const mget = (keys) => {
    return cache.mget(keys);
};

// Set multiple values
const mset = (keyValuePairs, ttl = 600) => {
    return cache.mset(keyValuePairs, ttl);
};

// Delete multiple values
const mdel = (keys) => {
    return cache.del(keys);
};

// Get TTL of a key
const getTTL = (key) => {
    return cache.getTtl(key);
};

// Set TTL of a key
const setTTL = (key, ttl) => {
    return cache.ttl(key, ttl);
};

// Get cache size
const size = () => {
    return cache.keys().length;
};

// Get cache memory usage
const memoryUsage = () => {
    return process.memoryUsage();
};

module.exports = {
    get,
    set,
    del,
    clear,
    stats,
    keys,
    has,
    mget,
    mset,
    mdel,
    getTTL,
    setTTL,
    size,
    memoryUsage
}; 