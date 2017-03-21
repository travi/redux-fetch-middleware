import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import sinon from 'sinon';

sinon.assert.expose(chai.assert, {prefix: ''});
chai.use(chaiAsPromised);
