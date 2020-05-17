# redux-fetch-middleware

middleware to enable async data fetching as the result of a dispatched action

<!--status-badges start -->

[![Build Status](https://img.shields.io/travis/com/travi/redux-fetch-middleware.svg?style=flat)](https://travis-ci.com/travi/redux-fetch-middleware)

<!--status-badges end -->

## Usage

<!--consumer-badges start -->

[![npm](https://img.shields.io/npm/v/@travi/redux-fetch-middleware.svg?maxAge=2592000)](https://www.npmjs.com/package/@travi/redux-fetch-middleware)
[![license](https://img.shields.io/github/license/travi/redux-fetch-middleware.svg)](LICENSE)

<!--consumer-badges end -->

### Installation

```bash
$ npm install @travi/redux-fetch-middleware --save
```

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

## Contributing

<!--contribution-badges start -->

[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)
[![Renovate][renovate-badge]][renovate-link]

<!--contribution-badges end -->

### Dependencies

```sh
$ nvm install
$ npm install
```

### Verification

```sh
$ npm test
```

[renovate-link]: https://renovatebot.com

[renovate-badge]: https://img.shields.io/badge/renovate-enabled-brightgreen.svg?logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzNjkgMzY5Ij48Y2lyY2xlIGN4PSIxODkuOSIgY3k9IjE5MC4yIiByPSIxODQuNSIgZmlsbD0iI2ZmZTQyZSIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoLTUgLTYpIi8+PHBhdGggZmlsbD0iIzhiYjViNSIgZD0iTTI1MSAyNTZsLTM4LTM4YTE3IDE3IDAgMDEwLTI0bDU2LTU2YzItMiAyLTYgMC03bC0yMC0yMWE1IDUgMCAwMC03IDBsLTEzIDEyLTktOCAxMy0xM2ExNyAxNyAwIDAxMjQgMGwyMSAyMWM3IDcgNyAxNyAwIDI0bC01NiA1N2E1IDUgMCAwMDAgN2wzOCAzOHoiLz48cGF0aCBmaWxsPSIjZDk1NjEyIiBkPSJNMzAwIDI4OGwtOCA4Yy00IDQtMTEgNC0xNiAwbC00Ni00NmMtNS01LTUtMTIgMC0xNmw4LThjNC00IDExLTQgMTUgMGw0NyA0N2M0IDQgNCAxMSAwIDE1eiIvPjxwYXRoIGZpbGw9IiMyNGJmYmUiIGQ9Ik04MSAxODVsMTgtMTggMTggMTgtMTggMTh6Ii8+PHBhdGggZmlsbD0iIzI1YzRjMyIgZD0iTTIyMCAxMDBsMjMgMjNjNCA0IDQgMTEgMCAxNkwxNDIgMjQwYy00IDQtMTEgNC0xNSAwbC0yNC0yNGMtNC00LTQtMTEgMC0xNWwxMDEtMTAxYzUtNSAxMi01IDE2IDB6Ii8+PHBhdGggZmlsbD0iIzFkZGVkZCIgZD0iTTk5IDE2N2wxOC0xOCAxOCAxOC0xOCAxOHoiLz48cGF0aCBmaWxsPSIjMDBhZmIzIiBkPSJNMjMwIDExMGwxMyAxM2M0IDQgNCAxMSAwIDE2TDE0MiAyNDBjLTQgNC0xMSA0LTE1IDBsLTEzLTEzYzQgNCAxMSA0IDE1IDBsMTAxLTEwMWM1LTUgNS0xMSAwLTE2eiIvPjxwYXRoIGZpbGw9IiMyNGJmYmUiIGQ9Ik0xMTYgMTQ5bDE4LTE4IDE4IDE4LTE4IDE4eiIvPjxwYXRoIGZpbGw9IiMxZGRlZGQiIGQ9Ik0xMzQgMTMxbDE4LTE4IDE4IDE4LTE4IDE4eiIvPjxwYXRoIGZpbGw9IiMxYmNmY2UiIGQ9Ik0xNTIgMTEzbDE4LTE4IDE4IDE4LTE4IDE4eiIvPjxwYXRoIGZpbGw9IiMyNGJmYmUiIGQ9Ik0xNzAgOTVsMTgtMTggMTggMTgtMTggMTh6Ii8+PHBhdGggZmlsbD0iIzFiY2ZjZSIgZD0iTTYzIDE2N2wxOC0xOCAxOCAxOC0xOCAxOHpNOTggMTMxbDE4LTE4IDE4IDE4LTE4IDE4eiIvPjxwYXRoIGZpbGw9IiMzNGVkZWIiIGQ9Ik0xMzQgOTVsMTgtMTggMTggMTgtMTggMTh6Ii8+PHBhdGggZmlsbD0iIzFiY2ZjZSIgZD0iTTE1MyA3OGwxOC0xOCAxOCAxOC0xOCAxOHoiLz48cGF0aCBmaWxsPSIjMzRlZGViIiBkPSJNODAgMTEzbDE4LTE3IDE4IDE3LTE4IDE4ek0xMzUgNjBsMTgtMTggMTggMTgtMTggMTh6Ii8+PHBhdGggZmlsbD0iIzk4ZWRlYiIgZD0iTTI3IDEzMWwxOC0xOCAxOCAxOC0xOCAxOHoiLz48cGF0aCBmaWxsPSIjYjUzZTAyIiBkPSJNMjg1IDI1OGw3IDdjNCA0IDQgMTEgMCAxNWwtOCA4Yy00IDQtMTEgNC0xNiAwbC02LTdjNCA1IDExIDUgMTUgMGw4LTdjNC01IDQtMTIgMC0xNnoiLz48cGF0aCBmaWxsPSIjOThlZGViIiBkPSJNODEgNzhsMTgtMTggMTggMTgtMTggMTh6Ii8+PHBhdGggZmlsbD0iIzAwYTNhMiIgZD0iTTIzNSAxMTVsOCA4YzQgNCA0IDExIDAgMTZMMTQyIDI0MGMtNCA0LTExIDQtMTUgMGwtOS05YzUgNSAxMiA1IDE2IDBsMTAxLTEwMWM0LTQgNC0xMSAwLTE1eiIvPjxwYXRoIGZpbGw9IiMzOWQ5ZDgiIGQ9Ik0yMjggMTA4bC04LThjLTQtNS0xMS01LTE2IDBMMTAzIDIwMWMtNCA0LTQgMTEgMCAxNWw4IDhjLTQtNC00LTExIDAtMTVsMTAxLTEwMWM1LTQgMTItNCAxNiAweiIvPjxwYXRoIGZpbGw9IiNhMzM5MDQiIGQ9Ik0yOTEgMjY0bDggOGM0IDQgNCAxMSAwIDE2bC04IDdjLTQgNS0xMSA1LTE1IDBsLTktOGM1IDUgMTIgNSAxNiAwbDgtOGM0LTQgNC0xMSAwLTE1eiIvPjxwYXRoIGZpbGw9IiNlYjZlMmQiIGQ9Ik0yNjAgMjMzbC00LTRjLTYtNi0xNy02LTIzIDAtNyA3LTcgMTcgMCAyNGw0IDRjLTQtNS00LTExIDAtMTZsOC04YzQtNCAxMS00IDE1IDB6Ii8+PHBhdGggZmlsbD0iIzEzYWNiZCIgZD0iTTEzNCAyNDhjLTQgMC04LTItMTEtNWwtMjMtMjNhMTYgMTYgMCAwMTAtMjNMMjAxIDk2YTE2IDE2IDAgMDEyMiAwbDI0IDI0YzYgNiA2IDE2IDAgMjJMMTQ2IDI0M2MtMyAzLTcgNS0xMiA1em03OC0xNDdsLTQgMi0xMDEgMTAxYTYgNiAwIDAwMCA5bDIzIDIzYTYgNiAwIDAwOSAwbDEwMS0xMDFhNiA2IDAgMDAwLTlsLTI0LTIzLTQtMnoiLz48cGF0aCBmaWxsPSIjYmY0NDA0IiBkPSJNMjg0IDMwNGMtNCAwLTgtMS0xMS00bC00Ny00N2MtNi02LTYtMTYgMC0yMmw4LThjNi02IDE2LTYgMjIgMGw0NyA0NmM2IDcgNiAxNyAwIDIzbC04IDhjLTMgMy03IDQtMTEgNHptLTM5LTc2Yy0xIDAtMyAwLTQgMmwtOCA3Yy0yIDMtMiA3IDAgOWw0NyA0N2E2IDYgMCAwMDkgMGw3LThjMy0yIDMtNiAwLTlsLTQ2LTQ2Yy0yLTItMy0yLTUtMnoiLz48L3N2Zz4=
