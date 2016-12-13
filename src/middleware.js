import {use} from '@travi/ioc';

export default (session = {}) => ({dispatch}) => (next) => (action) => {
    const
        fetcher = use('fetcher-factory').createFetcher(session),
        {fetch, initiate, success, failure, data} = action;

    if (!fetch) {
        return next(action);
    }

    dispatch({type: initiate, ...data});

    return fetch(fetcher)
        .then((response) => dispatch({type: success, resource: response}))
        .catch((err) => {
            dispatch({type: failure, error: err});
            return Promise.reject(err);
        });
};
