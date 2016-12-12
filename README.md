# redux-fetch-middleware

middleware to enable async data fetching as the result of a dispatched action

[![npm](https://img.shields.io/npm/v/@travi/redux-fetch-middleware.svg?maxAge=2592000)](https://www.npmjs.com/package/@travi/redux-fetch-middleware)
[![license](https://img.shields.io/github/license/travi/redux-fetch-middleware.svg)](LICENSE)
[![Build Status](https://img.shields.io/travis/travi/redux-fetch-middleware.svg?style=flat)](https://travis-ci.org/travi/redux-fetch-middleware)

[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)

## Installation

```
$ npm install @travi/redux-fetch-middleware -S
```

## Usage

### Add the middleware to your redux store

```js
createStore(combineReducers(), applyMiddleware(fetchMiddlewareFactory(session)));
```

### Make the session data available to your fetch methods

```js
export default function fetcherFactory(session) {
  const authToken = session.auth.token;

  return {
    async fetchFoo() {
      return await getFoo(authToken);
    },
    async fetchBar() {
      return await getBar(authToken);
    }
  };
}
```

### Register your data-fetcher factory with [`@travi/ioc`](https://github.com/travi/ioc)

This enables you to register different data-fetchers in different contexts, server vs browser

```js
add('fetcher-factory', fetcherFactory);
```
