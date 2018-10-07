"use strict";
var __1 = require("../");
var table = new __1.Tablur({
    width: 80
});
table
    .section('Tablur CLI Tables', 'center')
    .break();
table.row([
    { text: 'app run --dev' },
    { text: 'Runs the app.' },
    { text: 'Alias: r', align: 'right' }
]);
table.row([{ text: 'app create <name>' },
    { text: 'Creates an app.' },
    { text: 'Alias: c', align: 'right' }]);
table.break();
table.section('Options:\n', 'left');
table.row([{ text: ' <name>' },
    { text: 'App name to create.' },
    { text: '[string] [required]', align: 'right' }]);
table.row([{ text: ' --dev, -d' },
    { text: 'Runs in dev mode.' },
    { text: '[boolean]', align: 'right' }]);
table
    .break()
    .section({ text: '© 2018 Tablur', align: 'center' });
module.exports = table;
//# sourceMappingURL=example.spec.js.map