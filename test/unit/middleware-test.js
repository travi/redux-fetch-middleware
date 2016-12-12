import middlewareFactory from '../../src/middleware';
import * as iocContainer from '@travi/ioc';
import any from '@travi/any';
import sinon from 'sinon';
import {assert} from 'chai';
import {isEmpty, isObject} from 'lodash';

suite('fetch middleware', () => {
    let sandbox, fetch;
    const
        action = any.simpleObject(),
        initiate = any.string(),
        sessionData = any.simpleObject(),
        fetcher = any.simpleObject(),
        error = any.word();

    function fetcherFactory(session) {
        if (sessionData === session || isObject(session) && isEmpty(session)) {
            return fetcher;
        }

        return undefined;
    }

    setup(() => {
        sandbox = sinon.sandbox.create();
        sandbox.stub(iocContainer, 'use').withArgs('fetcher-factory').returns(fetcherFactory);

        fetch = sinon.stub();
    });

    teardown(() => {
        sandbox.restore();
    });

    test('that the action is passed to the next middleware if `fetch` is not defined in the action', () => {
        const
            nextResult = any.simpleObject(),
            next = sinon.stub();
        next.withArgs(action).returns(nextResult);

        assert.equal(middlewareFactory()({})(next)(action), nextResult);
    });

    test('that dispatch is called with the `initiate` topic', () => {
        const
            data = any.simpleObject(),
            dispatch = sinon.stub();
        fetch.resolves();

        return middlewareFactory(sessionData)({dispatch})()({...action, data, fetch, initiate}).then(() => {
            assert.calledWith(dispatch, {type: initiate, ...data});
        });
    });

    test('that error is not thrown if supplemental data is not provided', () => {
        const dispatch = sinon.stub();
        fetch.rejects();

        return middlewareFactory()({dispatch})()({...action, fetch, initiate}).catch(() => {
            assert.calledWith(dispatch, {type: initiate});
        });
    });

    test('that the `success` topic is dispatched upon a successful fetch', () => {
        const
            dispatch = sinon.stub(),
            success = any.string(),
            response = any.simpleObject();
        fetch.withArgs(fetcher).resolves(response);

        return middlewareFactory()({dispatch})()({...action, fetch, initiate, success}).then(() => {
            assert.calledWith(dispatch, {type: success, resource: response});
        });
    });

    test('that the `failure` topic is dispatched upon a failed fetch', () => {
        iocContainer.use.withArgs('fetcher').returns(fetcherFactory);
        fetch.withArgs(fetcher).rejects(error);
        const
            dispatch = sinon.stub(),
            failure = any.string(),

            promise = middlewareFactory()({dispatch})()({...action, fetch, initiate, failure});

        return Promise.all([
            assert.isRejected(promise, new RegExp(error)),
            promise.catch(() => {
                assert.calledWith(dispatch, {type: failure, error: new Error(error)});
            })
        ]);
    });
});
