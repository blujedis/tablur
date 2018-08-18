"use strict";
var __1 = require("../");
var colurs_1 = require("colurs");
var colurs = new colurs_1.Colurs();
var table = new __1.Tablur({
    width: 80, padding: 0
});
table.header('Tablur CLI Tables', __1.TablurAlign.center);
table.footer({ text: '© 2018 Tablur', align: __1.TablurAlign.center });
table.row({ text: 'app run --dev' }, { text: 'Runs the app.' }, { text: 'Alias: r', align: __1.TablurAlign.right });
table.row({ text: 'app create <name>' }, { text: 'Creates an app.' }, { text: 'Alias: c', align: __1.TablurAlign.right });
table.break();
table.section('Options:\n', __1.TablurAlign.left);
table.row({ text: ' <name>' }, { text: 'App name to create.' }, { text: '[string] [required]', align: __1.TablurAlign.right });
table.row({ text: ' --dev, -d' }, { text: 'Runs in dev mode.' }, { text: '[boolean]', align: __1.TablurAlign.right });
module.exports = table;
//# sourceMappingURL=example.spec.js.map