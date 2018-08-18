<p align="left">
  <a href="http://github.com/blujedis/tablur"><img src="https://cdn.rawgit.com/blujedis/tablur/master/assets/logo.svg"></a>
</p>

Tablur pronounced "tay-bler" is a simple cli table util. It is similar to cliui with a few extra helpers. The main advantage to Tablur is that it's quick and it's written in Typescript. Typings for existing table utils isn't that great and in part the reason for this release.

## Install

```sh
$ npm install tablur
```

## Usage

Tablur is similar in syntax to cliui if you've used it before. There's nothing complicated about it. The main difference is that Tablur is a little quicker than cliui and it's more versatile when it comes to adding sections.

```ts
const table = new Tablur({ width: 80 });
table.header('My App');
table.row('column 1', 'column 2', 'column3');
table.break(); // <-- adds an empty line break.
table.section('Sub Title'); // <-- adds a section header.
table.row('column 1', 'column 2'); // <-- 3rd col will be added as empty column.
table.footer('copyright 2018 my company');

// Render to string and return.
const result = table.toString();

// OR

// Output to specified writable stream.
table.write();
```

## Options

A quick note on "padding". The vertical padding is not 1 to 1. This is because it gets pretty huge when you do that. Hence verticle padding is divided by 2. This looks a little better when scaling padding. Just keep that in mind.

<table>
  <thead>
    <tr><td>Name</td><td>Description</td><td>Default</td></tr>
  </thead>
  <tbody>
      <tr><td>width</td><td>the width of your table.</td><td>auto</td></tr>
      <tr><td>scheme</td><td>the wrapping mode, wrap, truncate or none.</td><td>wrap</td></tr>
      <tr><td>padding</td><td>the value for padding/gutters.</td><td>0</td></tr>
      <tr><td>border</td><td>the border to use if any.</td><td>undefined</td></tr>
      <tr><td>borderColor</td><td>a color to style the border with.</td><td>undefined</td></tr>
      <tr><td>sizes</td><td>a number or array of numbers matching column count.</td><td>undefined</td></tr>
      <tr><td>aligns</td><td>an array of global alignment values.</td><td>undefined</td></tr>
      <tr><td>borders</td><td>a map object containing border values.</td><td>undefined</td></tr>
      <tr><td>rows</td><td>rows to initialize with just calls table.rows(rows).</td><td>[]</td></tr>
  </tbody>
</table>

## API

The Tablur API is very simple. There are really four main methods, .row(), .header(), .footer() and .write(). In fact you'll primarily use two of those in most cases.

### row

Adds a new row to the table.

<table>
  <tr><td>Arguments</td><td>(...cols: (string | ITablerColumn)[])</td></tr>
  <tr><td>Returns</td><td>Tablur</td></tr>
</table>

### rows

Adds array of rows to the table.

<table>
  <tr><td>Arguments</td><td>(...rows: (string | ITablerColumn)[][])</td></tr>
  <tr><td>Returns</td><td>Tablur</td></tr>
</table>

### header

Adds a header to the table, optionally with overridable options or alignment. Options object should always be the last argument.

<table>
  <tr><td>Arguments</td><td>(text: string, align?: TablerAlign)</td></tr>
  <tr><td>Arguments</td><td>(text: string, options?: ITablerOptionsBase)</td></tr>
  <tr><td>Arguments</td><td>(...cols: (string | TablerAlign | ITablerOptionsBase)[])</td></tr>
  <tr><td>Returns</td><td>Tablur</td></tr>
</table>

### footer

Adds a footer to the table, optionally with overridable options or alignment. Options object should always be the last argument.

<table>
  <tr><td>Arguments</td><td>(text: string, align?: TablerAlign)</td></tr>
  <tr><td>Arguments</td><td>(text: string, options?: ITablerOptionsBase)</td></tr>
  <tr><td>Arguments</td><td>(...cols: (string | TablerAlign | ITablerOptionsBase)[])</td></tr>
  <tr><td>Returns</td><td>Tablur</td></tr>
</table>

### break

Adds an empty break row to the table.

<table>
  <tr><td>Arguments</td><td>none</td></tr>
  <tr><td>Returns</td><td>Tablur</td></tr>
</table>

### section

Creates a section header.

<table>
  <tr><td>Arguments</td><td>(column: ITablerColumn)</td></tr>
  <tr><td>Arguments</td><td>(name: string, align: TablerAlign)</td></tr>
  <tr><td>Returns</td><td>Tablur</td></tr>
</table>

### toString

Renders the table and returns string representation.

<table>
  <tr><td>Arguments</td><td>none</td></tr>
  <tr><td>Returns</td><td>string</td></tr>
</table>

### write

Renders the table and writes to output stream.

<table>
  <tr><td>Arguments</td><td>(wrap: string, stream?: NodeJS.WritableStream)</td></tr>
  <tr><td>Returns</td><td>void</td></tr>
</table>

### clear

Clears the current rows but maintains options.

<table>
  <tr><td>Arguments</td><td>none</td></tr>
  <tr><td>Returns</td><td>Tablur</td></tr>
</table>

### reset

Clears rows and resets all options, optionally can provide new options.

<table>
  <tr><td>Arguments</td><td>(options?: ITablerOptions)</td></tr>
  <tr><td>Returns</td><td>Tablur</td></tr>
</table>

## Benchmark

As a bonus Tablur is pretty quick also! (yes there's a typo in the name lol).

<p align="left">
  <a href="http://github.com/blujedis/tablur"><img src="https://raw.githubusercontent.com/blujedis/tablur/master/assets/benchmark.png"></a>
</p>

## Docs

See [https://blujedis.github.io/tablur/](https://blujedis.github.io/tablur/)

## Change

See [CHANGE.md](CHANGE.md)

## License

See [LICENSE.md](LICENSE)