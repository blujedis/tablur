const Benchmark = require('benchmark');
const colurs = require('colurs').init();

const bench = new Benchmark.Suite;
const Tabler = require('./dist').Tabler;
const tabler = new Tabler();
const ui = require('cliui')();


const rows = [
  [{ text: 'one' }, { text: 'two' }, { text: 'three' }],
  [{ text: 'one' }, { text: 'two' }, { text: 'three' }],
  [{ text: 'one' }, { text: 'two' }, { text: 'three' }],
  [{ text: 'one' }, { text: 'two' }, { text: 'three' }],
  [{ text: 'one' }, { text: 'two' }, { text: 'three' }]
];

console.log('\n' + colurs.underline('Benchmark Starting...') + '\n');

bench.add('Tabler', function() {
    tabler.rows(rows);
    tabler.render();
  })
  .add('Yargs Cliui', function() {
    rows.forEach(r => ui.div(r));
    ui.toString();
  })
  .on('cycle', function(event) {
    const t = event.target;
    let result = String(t);
    console.log(colurs.dim(result));
  })
  .on('complete', function() {
    console.log('\n' + colurs.underline('Results:') + '\n');
    const fastest = this.filter('fastest').map('name');
    console.log(colurs.bold.greenBright(fastest[0]) + '       (fastest)\n' + colurs.dim.redBright(fastest[1]) + '  (slowest)');
    console.log();
  })
  .run({ 'async': false });