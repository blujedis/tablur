import { Tablur, TablurAlign, TablurScheme, TablurColor } from '../';
import { Colurs } from 'colurs';

const colurs = new Colurs();

const table = new Tablur({
  width: 80, padding: 0
});

table.header('Tablur CLI Tables', TablurAlign.center);

table.footer({ text: '© 2018 Tablur', align: TablurAlign.center });

table.row(
  { text: 'app run --dev' },
  { text: 'Runs the app.' },
  { text: 'Alias: r', align: TablurAlign.right }
);

table.row(
  { text: 'app create <name>' },
  { text: 'Creates an app.' },
  { text: 'Alias: c', align: TablurAlign.right }
);

table.break();

table.section('Options:\n', TablurAlign.left);

table.row(
  { text: ' <name>' },
  { text: 'App name to create.' },
  { text: '[string] [required]', align: TablurAlign.right }
);

table.row(
  { text: ' --dev, -d' },
  { text: 'Runs in dev mode.' },
  { text: '[boolean]', align: TablurAlign.right }
);

export = table;