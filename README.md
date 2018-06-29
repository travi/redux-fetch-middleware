# redux-fetch-middleware

middleware to enable async data fetching as the result of a dispatched action

[![npm](https://img.shields.io/npm/v/@travi/redux-fetch-middleware.svg?maxAge=2592000)](https://www.npmjs.com/package/@travi/redux-fetch-middleware)
[![license](https://img.shields.io/github/license/travi/redux-fetch-middleware.svg)](LICENSE)
[![Build Status](https://img.shields.io/travis/travi/redux-fetch-middleware.svg?style=flat)](https://travis-ci.org/travi/redux-fetch-middleware)

[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)
[![Greenkeeper badge](https://badges.greenkeeper.io/travi/redux-fetch-middleware.svg)](https://greenkeeper.io/)

## Installation

```bash
$ npm install @travi/redux-fetch-middleware --save
```

## Usage

### Include as a middleware for redux

#### As a [single middleware](http://redux.js.org/docs/api/applyMiddleware.html)

```js
import {createStore, applyMiddleware} from 'redux';
import fetchMiddlewareFactory from '@travi/redux-fetch-middleware';
import reducer from './reducer';

export default function ({session}) {
  return createStore(reducer, applyMiddleware(fetchMiddlewareFactory(session)));
}
```

#### With [additional middlewares](http://redux.js.org/docs/api/compose.html)

```js
import {createStore, applyMiddleware, compose} from 'redux';
import fetchMiddlewareFactory from '@travi/redux-fetch-middleware';
import reducer from './reducer';
import DevTools from './DevTools'

export default function ({session}) {
  return createStore(reducer, compose(applyMiddleware(fetchMiddlewareFactory(session)), DevTools.instrument()));
}
```

### Make the session data available to your fetch methods

Be sure to export a `createFetcher` _named_ function that takes a `session` object

```js
export function createFetcher(session) {
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

### Triggering by dispatching an action

Dispatch an action that does not define `type`, but instead contains:

* `fetch`: a function that takes a reference to the client module to give
  access to the methods that do the actual data fetching
* `initial`: the action type that should be dispatched when the data fetch
  is initiated
* `success`: the action type that should be dispatched when the data has
  been successfully received. the received resource will be passed in the
  `resource` attribute of this action.
* `failure`: the action type that should be dispatched when the fetch result
  in an error. the resulting error will be passed as the `error` attribute of
  this action.
* `data`: the data that you would like access to in your dispatched methods.
  the resulting data will be passed as base level attributes to the `resource`.
* `retry` (_optional_): a predicate function that enables instructing the
  middleware to retry (or poll) the fetch under certain conditions.
  * The predicate function is expected to be implemented in error-first style,
    meaning that the error will be provided as the first argument in the failure
    scenario, and the response will be provided as the second argument in the
    success scenario
  * The predicate function should return a boolean to instruct the middleware
    whether to repeat the call again or not
  * When the function is not provided, the default will be the same as if the
    predicate returned `false`, so the fetch will not be repeated by default
  * When a retry is requested, the repeated request will be delayed by three
    seconds

#### As an action creator

```js
export function loadFoo(id) {
    return {
        fetch: (client) => client.getFoo(id),
        retry: (err, response) => {
          if (err) return true;
          return (response && 'in-progress' === response['completion-status']);
        },
        initiate: LOAD_FOO,
        success: FOO_LOADED,
        failure: FOO_LOAD_FAILED,
        data: {id, foo:'bar'}
    };
}
```

#### A corresponding reducer

```js
export default function reducer(state, action) {
    switch (action.type) {
    case LOAD_FOO:
        return state.merge({loading: true, loaded: false, foo: {}});
    case FOO_LOADED:
        return state.merge({loading: false, loaded: true, foo: action.resource});
    case FOO_LOAD_FAILED:
        return state.merge({loading: false, error: action.error});
    default:
        return state;
    }
}
```

### Register your data-fetcher factory with [`@travi/ioc`](https://github.com/travi/ioc)

This enables you to register different data-fetchers in different contexts,
server vs browser

```js
register('fetcher-factory', fetcherFactory);
```
