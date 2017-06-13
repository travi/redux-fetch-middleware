import {use} from '@travi/ioc';

export default (session = {}) => ({dispatch}) => next => action => {
  const fetcher = use('fetcher-factory').createFetcher(session);
  const {fetch, initiate, success, failure, data} = action;

  if (!fetch) {
    return next(action);
  }

  dispatch({type: initiate, ...data});

  return fetch(fetcher)
    .then(response => dispatch({type: success, resource: response, ...data}))
    .catch(err => {
      dispatch({type: failure, error: err, ...data});
      return Promise.reject(err);
    });
};
