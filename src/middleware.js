import {seconds} from 'milliseconds';
import {use} from '@travi/ioc';
import delay from './delay-wrapper';

function repeatFetch(dispatch, action) {
  return delay(seconds(3)).then(() => dispatch(action));
}

export default (session = {}, server) => ({dispatch}) => next => action => {
  const fetcher = use('fetcher-factory').createFetcher(session, server);
  const {fetch, initiate, success, progress, failure, data, retry} = action;

  if (!fetch) {
    return next(action);
  }

  dispatch({type: initiate, ...data});

  return fetch(fetcher)
    .then(
      response => {
        if (retry && retry(null, response)) {
          dispatch({type: progress, resource: response, ...data});
          return repeatFetch(dispatch, action);
        }

        return dispatch({type: success, resource: response, ...data});
      },
      err => {
        if (retry && retry(err)) return repeatFetch(dispatch, action);

        return dispatch({type: failure, error: err, ...data});
      }
    );
};
