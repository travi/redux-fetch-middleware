import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import sinon from 'sinon';
import 'sinon-as-promised';

sinon.assert.expose(chai.assert, { prefix: '' });
chai.use(chaiAsPromised);
