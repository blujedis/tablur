/**
 * Need to write more tests this will have to
 * do for the time being until more time.
 */

import * as chai from 'chai';
import * as mocha from 'mocha';
import * as fs from 'fs';

import { Tablur, TablurBorder } from '../';
import * as table from './example.spec';

const expect = chai.expect;
const should = chai.should;
const assert = chai.assert;

const example = fs.readFileSync('./src/test/full.txt', 'utf8').replace(/\n$/, '');

describe('Tablur', () => {

  before((done) => {
    done();
  });

  it('should read and example configuration and match.', () => {
    const str = table.toString();
    assert.equal(str, example);
  });


});