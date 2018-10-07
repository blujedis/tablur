<p align="left">
  <a href="http://github.com/blujedis/tablur"><img src="https://cdn.rawgit.com/blujedis/tablur/master/assets/logo.svg"></a>
</p>

Tablur pronounced "tay-bler" is a simple cli table util. It is similar to cliui with a few extra helpers. The main advantage to Tablur is that it's quick and it's written in Typescript. Typings for existing table utils isn't that great and in part the reason for this release.

## Install

```sh
$ npm install tablur
```

## Usage

Tablur is similar to other CLI table utilities. You can configure using strings or objects for more control. Tablur also has a handy shorthand syntax that's a little easier to look at than using multiple objects for columns.

```ts
const table = new Tablur();

table
  .section('Tablur CLI Tables', 'center')

  .break()

  .row([
    { text: 'app run --dev' },
    { text: 'Runs the app.' },
    { text: 'Alias: r', align: 'right' }])

  .row(
    [{ text: 'app create <name>' },
    { text: 'Creates an app.' },
    { text: 'Alias: c', align: 'right' }])

  .break()

  .section('Options:\n', 'left')

  .row(
    [{ text: ' <name>' },
    { text: 'App name to create.' },
    { text: '[string] [required]', align: 'right' }])

  .row(
    [{ text: ' --dev, -d' },
    { text: 'Runs in dev mode.' },
    { text: '[boolean]', align: 'right' }])

  .break()

  .section({ text: '© 2018 Tablur', align: 'center' });


// Render to string and return.
const result = table.toString();

// OR

// Output to specified writable stream.
table.render(true);
```

#### Shorthand

Tablur has handy shorthand that is a little easier to look at than a bunch of objects. Using column configuration objects still gives the best control but using shorthand works well for simpler solutions and is a bit quicker to write.

Here's the order

**text|width|align|padding**

OR

**text|align|padding**

```ts
table.row('Some Title|center');

// use : for padding order is top, right, bottom, left
table.row('Username|30|left|0:1:0:1', 'Email|50');
```

## Options

A quick note on "padding". The vertical padding is not 1 to 1. This is because it gets pretty huge when you do that. Hence verticle padding is divided by 2. This looks a little better when scaling padding. Just keep that in mind.

<table>
  <thead>
    <tr><td>Name</td><td>Description</td><td>Default</td></tr>
  </thead>
  <tbody>
      <tr><td>stream</td><td>writable output stream.</td><td>process.stdout</td></tr>
      <tr><td>width</td><td>the width of your table, use "0" for auto.</td><td>undefined</td></tr>
      <tr><td>justify</td><td>when true justify columns to widest width.</td><td>true</td></tr>
      <tr><td>gutter</td><td>the width between columns.</td><td>2</td></tr>
      <tr><td>shift</td><td>when true trailing space against boundary trimmed.</td><td>false</td></tr>
      <tr><td>padding</td><td>global column padding settings.</td><td>[0, 0, 0, 0]</td></tr>
      <tr><td>border</td><td>border to use - single, double, round, singleDouble, doubleSingle, classic.</td><td>undefined</td></tr>
      <tr><td>borderColor</td><td>red, green, blue, cyan, yellow, magenta, black, gray, redBright, greenBright, blueBright, cyanBright, yellowBright, magentaBright</td><td>undefined</td></tr>
      <tr><td>stringLength</td><td>method used to calculate string length.</td><td>2</td></tr>
  </tbody>
</table>


## API

The Tablur API is very simple. You can add columns as strings with shorthand or as objects.

### row

Adds a new row to the table.
See [Docs](https://blujedis.github.io/tablur/) for more on method arguments.

<table>
  <tr><td>Arguments</td><td>text: any | ITablurColumn | any[] | ITablurColumn[], width?: number | TablurAlign | ITablurColumnGlobal,
    align?: TablurPadding | TablurAlign, padding?: TablurPadding</td></tr>
  <tr><td>Returns</td><td>Tablur</td></tr>
</table>

### section

Creates a section header. Similar to row but with some opinions most commonly used for this purpose.
See [Docs](https://blujedis.github.io/tablur/) for more on method arguments.

<table>
  <tr><td>Arguments</td><td>text: string | ITablurColumn, align?: TablurPadding | TablurAlign, padding?: TablurPadding</td></tr>
  <tr><td>Returns</td><td>Tablur</td></tr>
</table>

### repeat

Repeats a string in a row. For example if you wanted to have a row with *************************.
See [Docs](https://blujedis.github.io/tablur/) for more on method arguments.

<table>
  <tr><td>Arguments</td><td>text: string | ITablurColumn, align?: TablurPadding | TablurAlign, padding?: TablurPadding</td></tr>
  <tr><td>Returns</td><td>Tablur</td></tr>
</table>

### break

Adds an empty break row to the table.

<table>
  <tr><td>Arguments</td><td>none</td></tr>
  <tr><td>Returns</td><td>Tablur</td></tr>
</table>

### toString

Renders the table and returns string representation.

<table>
  <tr><td>Arguments</td><td>none</td></tr>
  <tr><td>Returns</td><td>string</td></tr>
</table>

### render

Renders the table and writes to output stream. Pass true to wrap output in new lines for spacing.

<table>
  <tr><td>Arguments</td><td>(wrap?: boolean)</td></tr>
  <tr><td>Returns</td><td>Tablur</td></tr>
</table>

### clear

Clears the current rows but maintains options.

<table>
  <tr><td>Arguments</td><td>none</td></tr>
  <tr><td>Returns</td><td>Tablur</td></tr>
</table>

### reset

Clears rows and resets all options, optionally can provide new options and debug mode.

<table>
  <tr><td>Arguments</td><td>(options?: ITablerOptions, debug?: boolean)</td></tr>
  <tr><td>Returns</td><td>Tablur</td></tr>
</table>

## Docs

See [https://blujedis.github.io/tablur/](https://blujedis.github.io/tablur/)

## Change

See [CHANGE.md](CHANGE.md)

## License

See [LICENSE.md](LICENSE)