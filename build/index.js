const stiks = require('stiks');
const {
  resolve
} = require('path');
const log = stiks.log;
const pkg = stiks.pkg();
const build = pkg && pkg.build;

// Ensure build info.
if (!build)
  log.error('whoops looks like you forgot to add the "build" key in package.json.');

// Parse command line arguments.
const parsed = stiks.argv.parse();
let command = parsed.command;
const commands = parsed.commands;
const flags = parsed.flags;

// Get user input less the command.
const input = parsed.normalized.slice(1);

// Don't merge in command line args automatically
// as will blow up spawn'd process.
const noMergeCmds = ['build', 'release'];

// Merges default args with any input args.
function normalize(def) {
  if (~noMergeCmds.indexOf(command))
    return stiks.argv.splitArgs(def);
  return stiks.argv.mergeArgs(def, input);
}

// Build actions.
const actions = {

  clean: () => {
    stiks.clean(build.clean);
    return actions;
  },

  copy: () => {
    stiks.copyAll(build.copy);
    return actions;
  },

  compile: (watch) => {
    let args = './node_modules/typescript/bin/tsc -p ./src/tsconfig.json';
    args += (watch ? ' -w' : '');
    args = normalize(args);
    stiks.exec.node(args);
    return actions;
  },

  watch: () => {
    log.notify('starting watch.');
    actions.compile(true);
    return actions;
  },

  docs: () => {
    let args = './node_modules/typedoc/bin/typedoc --out ./docs ./src --options ./typedoc.json';
    args = normalize(args);
    stiks.exec.node(args);
    stiks.exec.command('touch', './docs/.nojekyll');
    return actions;
  },

  bump: (type) => {
    type = type || commands[0] || flags.bump || 'patch';
    const result = stiks.bump(type);
    log.notify(`bumped version from ${result.previous} to ${result.current}.`);
    return actions;
  },

  build: () => {
    actions.clean()
      .copy()
      .compile();
    if (flags.docs) {
      actions.docs();
      log.notify('built docs.');
    }
    log.notify('cleaned, copied and compiled.');
    return actions;
  },

  commit: () => {
    let args = `commit -am 'no comment'`;
    args = normalize(args);
    if (flags.m)
      args = stiks.argv.mergeArgs(args.slice(0), ['-m', flags.m]);
    stiks.exec.command('git', 'add .');
    stiks.exec.command('git', args);
    stiks.exec.command('git', 'push');
    return actions;
  },

  publish() {
    stiks.exec.npm('publish');
    return actions;
  },

  release: () => {
    actions.build()
      .docs()
      .bump()
      .commit()
      .publish();
    log.notify('cleaned, copied, compiled, doc\'d, bumped, committed and published.');
    return actions;
  },

  test: () => {
    let args = 'mocha --opts ./src/mocha.opts';
    args = normalize(args);
    stiks.exec.command('nyc', args);
  },

  serve: () => {
    const opts = flags || {};
    const server = stiks.serve('dev-server', opts, true);
  },

  open: (url) => {
    url = url || commands[0] || flags.url || flags.u || resolve('docs/index.html'); // docs url.
    const start = (process.platform == 'darwin' ? 'open' : process.platform == 'win32' ? 'start' : 'xdg-open');
    require('child_process').exec(start + ' ' + url);
  },

  platform: () => {
    log(stiks.colorize(stiks.platform()));
  },

  exit: (msg, code) => {
    if (msg)
      log(msg);
    process.exit(code || 0);
  }

};

if (!actions[command])
  return log.error(`fubar! command "${command}" is unknown.`);

// Start the chain.
actions[command]();