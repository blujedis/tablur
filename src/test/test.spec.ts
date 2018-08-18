/**
 * Need to write more tests this will have to
 * do for the time being until more time.
 */

import * as chai from 'chai';
import * as mocha from 'mocha';
import * as fs from 'fs';

import { TABLER_BORDERS, Tablur, TablurScheme, TablurBorder } from '../';
import * as table from './example.spec';

const expect = chai.expect;
const should = chai.should;
const assert = chai.assert;

const full_test = fs.readFileSync('./src/test/full.txt', 'utf8');

describe('Tablur', () => {

  before((done) => {
    done();
  });

  it('should read and example configuration and match values.', () => {
    const str = table.toString();
    assert.equal(str, full_test);
  });

  it('should clear existing rows.', () => {
    table.clear();
    assert.equal(0, table['_rows'].length);
  });

  it('should reset all options.', () => {
    table.options.border = TablurBorder.round;
    table.reset();
    assert.notEqual(table.options.width, 80);
    assert.notEqual(table.options.border, TablurBorder.round);
  });

  it('should create table and truncate text.', () => {
    table.options.scheme = TablurScheme.truncate;
    table.options.width = 25;
    table.row('just some long string that we need to have truncated.');
    const str = table.toString();
    assert.equal(25, str.length);
  });

});