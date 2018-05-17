import {seconds} from 'milliseconds';
import * as iocContainer from '@travi/ioc';
import any from '@travi/any';
import sinon from 'sinon';
import {assert} from 'chai';
import * as delay from '../../src/delay-wrapper';
import middlewareFactory from '../../src/middleware';

suite('fetch middleware', () => {
  let sandbox, fetch, fetcherFactory;
  const data = any.simpleObject();
  const action = any.simpleObject();
  const initiate = any.string();
  const dispatchedAction = any.simpleObject();
  const fetcher = any.simpleObject();

  setup(() => {
    sandbox = sinon.createSandbox();

    sandbox.stub(iocContainer, 'use');
    sandbox.stub(delay, 'default');

    fetcherFactory = sinon.stub();
    iocContainer.use.withArgs('fetcher-factory').returns({createFetcher: fetcherFactory});
    delay.default.resolves();

    fetch = sinon.stub();
  });

  teardown(() => {
    sandbox.restore();
  });

  test('that the action is passed to the next middleware if `fetch` is not defined in the action', () => {
    const emptySession = {};
    const nextResult = any.simpleObject();
    const next = sinon.stub();
    next.withArgs(action).returns(nextResult);
    fetcherFactory.withArgs(emptySession).returns(fetcher);

    assert.equal(middlewareFactory()(emptySession)(next)(action), nextResult);
  });

  test('that dispatch is called with the `initiate` topic', () => {
    const dispatch = sinon.stub();
    const sessionData = any.simpleObject();
    const serverInstance = any.simpleObject();
    fetcherFactory.withArgs(sessionData, serverInstance).returns(fetcher);
    fetch.withArgs(fetcher).resolves();

    return middlewareFactory(sessionData, serverInstance)({dispatch})()({...action, data, fetch, initiate}).then(() => {
      assert.calledWith(dispatch, {type: initiate, ...data});
    });
  });

  test('that error is not thrown if supplemental data is not provided', () => {
    const dispatch = sinon.stub();
    fetch.rejects();
    fetcherFactory.withArgs({}).returns(fetcher);

    return middlewareFactory()({dispatch})()({...action, fetch, initiate}).catch(() => {
      assert.calledWith(dispatch, {type: initiate});
    });
  });

  suite('success', () => {
    const response = any.simpleObject();
    const success = any.string();

    setup(() => {
      fetcherFactory.withArgs({}).returns(fetcher);
      fetch.withArgs(fetcher).resolves(response);
    });

    test('that the `success` topic is dispatched upon a successful fetch', () => {
      const dispatch = sinon.stub();
      dispatch.withArgs({type: success, resource: response, ...data}).resolves(dispatchedAction);

      return assert.becomes(
        middlewareFactory()({dispatch})()({...action, fetch, initiate, success, data}),
        dispatchedAction
      );
    });

    test('that the fetch is repeated if the `retry` predicate returns `true`', () => {
      const retry = sinon.stub();
      const detailedAction = {...action, fetch, initiate, data, retry};
      const dispatch = sinon.stub();
      retry.withArgs(null, response).returns(true);
      dispatch.withArgs(detailedAction).resolves(dispatchedAction);

      return assert.becomes(
        middlewareFactory()({dispatch})()(detailedAction),
        dispatchedAction
      ).then(() => assert.calledWith(delay.default, seconds(3)));
    });

    test('that the fetch is not repeated if the `retry` predicate returns `false`', () => {
      const dispatch = sinon.stub();
      const retry = sinon.stub();
      retry.withArgs(null, response).returns(false);
      dispatch.withArgs({type: success, resource: response, ...data}).resolves(dispatchedAction);

      return assert.becomes(
        middlewareFactory()({dispatch})()({...action, fetch, initiate, success, data, retry}),
        dispatchedAction
      );
    });
  });

  suite('failure', () => {
    const errorMsg = any.word();
    const error = new Error(errorMsg);
    const failure = any.string();

    test('that the `failure` topic is dispatched upon a failed fetch', () => {
      const dispatch = sinon.stub();
      iocContainer.use.withArgs('fetcher').returns(fetcherFactory);
      fetcherFactory.withArgs({}).returns(fetcher);
      fetch.withArgs(fetcher).rejects(error);
      dispatch.withArgs({type: failure, error, ...data}).resolves(dispatchedAction);

      return assert.becomes(
        middlewareFactory()({dispatch})()({...action, fetch, initiate, failure, data}),
        dispatchedAction
      );
    });

    test('that the fetch is repeated if the `retry` predicate returns `true`', () => {
      const retry = sinon.stub();
      const detailedAction = {...action, fetch, initiate, data, retry};
      const dispatch = sinon.stub();
      fetch.rejects(error);
      retry.withArgs(error).returns(true);
      dispatch.withArgs(detailedAction).resolves(dispatchedAction);

      return assert.becomes(
        middlewareFactory()({dispatch})()(detailedAction),
        dispatchedAction
      ).then(() => assert.calledWith(delay.default, seconds(3)));
    });

    test('that the fetch is not repeated if the `retry` predicate returns `false`', () => {
      const dispatch = sinon.stub();
      const retry = sinon.stub();
      fetch.rejects(error);
      retry.withArgs(error).returns(false);
      dispatch.withArgs({type: failure, error, ...data}).resolves(dispatchedAction);

      return assert.becomes(
        middlewareFactory()({dispatch})()({...action, fetch, initiate, failure, data, retry}),
        dispatchedAction
      );
    });
  });
});
