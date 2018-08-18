import * as ws from 'term-size';
import * as wrapAnsi from 'wrap-ansi';
import * as ansiWidth from 'string-width';
import * as stripAnsi from 'strip-ansi';
import { Colurs, IAnsiStyles } from 'colurs';

import { ITablurOptions, TablurScheme, ITablurColumnInternal, TablurAlign, TablurBorder, ITablurColumn, ITablurConfig, ITablurMap, TablurColor, ITablurOptionsBase } from './interfaces';

const colurs = new Colurs();

const BASE_OPTIONS_KEYS = ['width', 'scheme', 'padding', 'sizes', 'border', 'borderColor'];

export const TABLER_BORDERS = {

  'single': {
    'topLeft': '┌',
    'topRight': '┐',
    'bottomRight': '┘',
    'bottomLeft': '└',
    'vertical': '│',
    'horizontal': '─'
  },
  'double': {
    'topLeft': '╔',
    'topRight': '╗',
    'bottomRight': '╝',
    'bottomLeft': '╚',
    'vertical': '║',
    'horizontal': '═'
  },
  'round': {
    'topLeft': '╭',
    'topRight': '╮',
    'bottomRight': '╯',
    'bottomLeft': '╰',
    'vertical': '│',
    'horizontal': '─'
  },
  'single-double': {
    'topLeft': '╓',
    'topRight': '╖',
    'bottomRight': '╜',
    'bottomLeft': '╙',
    'vertical': '║',
    'horizontal': '─'
  },
  'double-single': {
    'topLeft': '╒',
    'topRight': '╕',
    'bottomRight': '╛',
    'bottomLeft': '╘',
    'vertical': '│',
    'horizontal': '═'
  },
  'classic': {
    'topLeft': '+',
    'topRight': '+',
    'bottomRight': '+',
    'bottomLeft': '+',
    'vertical': '|',
    'horizontal': '-'
  }

};

const DEFAULTS: ITablurOptions = {
  width: ws().columns,            // the width of the table.
  scheme: TablurScheme.wrap,      // the wrapping scheme.
  padding: 2,                      // the gutter/padding size between columns.
  sizes: undefined,                // a static size or array of sizes.
  borders: {},                    // the default map for borders.
  rows: []                        // rows to initialize with.
};

export class Tablur {

  private _rows: ITablurColumnInternal[][] = [];
  private _header: Tablur;
  private _footer: Tablur;
  private _indexed: ITablurMap<number> = {};

  options: ITablurOptions;

  constructor(options?: ITablurOptions) {

    this.options = Object.assign({}, DEFAULTS, options);
    this.init();

  }

  private init() {

    // Merge in default borders.
    this.options.borders = Object.assign({}, TABLER_BORDERS, this.options.borders);

    // Must have even number for borders.
    if (this.options.border && this.options.padding % 2)
      this.options.padding += 1;

    // Set colorization.
    colurs.setOption('enabled', this.options.colorize);

    // Add rows that were passed in init.
    this.rows(this.options.rows);

  }

  // HELPERS //

  /**
   * Gets the size of the terminal columns and rows.
   */
  get size(): { columns: number, rows: number } {
    return ws();
  }

  protected sum(nums: number[]) {
    return nums.reduce((a, c) => a += c);
  }

  protected isBaseOptions(obj: any) {
    if (typeof obj !== 'object')
      return false;
    const baseKey = Object.keys(obj)[0];
    return ~BASE_OPTIONS_KEYS.indexOf(baseKey);
  }

  protected findIndices(str: string, char: string) {
    const arr = [];
    const row = stripAnsi(str);
    for (let i = 0; i < row.length; i++)
      if (row[i] === char) arr.push(i);
    return arr;
  }

  protected pad(str: string, width: number, align: TablurAlign = TablurAlign.left) {

    let adj = Math.max(0, width - ansiWidth(str));
    let rem = '';
    let pad = ' '.repeat(adj);

    // adjust pad if centering is required.
    if (align === TablurAlign.center) {
      rem = ' '.repeat(Math.max(0, adj % 2));
      adj = (adj / 2);
      pad = ' '.repeat(adj);
      const x = (pad + str + pad + rem).length;
      return pad + str + pad + rem;
    }

    if (align === TablurAlign.right)
      return pad + str;

    return str + pad;

  }

  protected truncate(str: string, len: number) {
    return str.slice(0, len - 3) + '...';
  }

  protected fillArray(count: number, val: any = '') {
    return Array.from(new Array(Math.ceil(count)), __ => val);
  }

  protected toPercentage(num: number, of: number = 100, places?: number): number {

    // check if is decimal using modulous.
    num = num % 1 !== 0 ? num * of : num;

    // to fixed if decimal places.
    return places >= 0 ? parseFloat((num / of).toFixed(places)) : num / of;

  }

  protected horizontalFill(width: number, char: string, endcap?: string, offset: number = 0) {
    width = endcap ? (width - 2) + offset : width + offset;
    let horiz = char.repeat(width);
    if (endcap)
      return endcap + horiz + endcap;
    return horiz;
  }

  protected toArray(val: any, def: any[] = []) {
    if (typeof val === undefined)
      return def;
    if (Array.isArray(val))
      return val;
    return [val];
  }

  // COLUMNS & LAYOUT //

  protected layoutWidth(width?: number) {
    return width || this.options.width || this.size.columns;
  }

  protected toColumn(col: string | ITablurColumnInternal) {
    if (typeof col === 'string')
      col = {
        text: col
      };
    col.text = col.text || '';
    col.size = col.size || 0;
    col.configure = col.configure === false ? false : true;
    col.length = ansiWidth(col.text);
    col.adjusted = Math.max(col.size, col.length, 0);
    return col;
  }

  private columnCounts(rows?: ITablurColumnInternal[][]) {
    return (rows || this._rows).reduce((a, r, i) => {
      let total = 0;
      r.forEach((v, n) => {
        if (!v.configure) return;
        a.columns[n] = Math.max(v.adjusted, a.columns[n] || 0, 0);
        total += a.columns[n];
      });
      a.total = Math.max(total, a.total);
      return a;
    }, { columns: [], total: 0 });
  }

  private calculateOffset(columns: number, padding: number, border: boolean) {
    return Math.max(0, !border
      ? (columns - 1) * padding
      : ((columns + 1) * padding) + (columns + 1));
  }

  private buildRow(...cols: (string | ITablurColumnInternal)[]) {

    const sizes = this.toArray(this.options.sizes);
    const aligns = this.toArray(this.options.aligns);

    return cols.map((c, i) => {
      c = this.toColumn(c);
      if (c.configure) { // ignore non configurable columns like sections & breaks.
        const size = sizes[i] || sizes[0] || 0;
        c.adjusted = Math.max(c.adjusted, size);
        const align = aligns[i] || aligns[0] || TablurAlign.left;
        c.align = c.align || align;
      }
      return c;
    });
  }

  // RENDERING & CONFIGURATION //

  private renderColumnsAdjust(pconfig: ITablurConfig, config: ITablurConfig) {

    // If the same number of columns just match column widths.
    if (pconfig.columns.length === config.columns.length) {

      let cols;

      // Get the optimal widths based on main table
      // width divided by the footer's column count.
      const colWidths = Math.floor(config.total / pconfig.columns.length);

      // Get the remainder if any.
      const colRem = config.total % pconfig.columns.length;

      cols = this.fillArray(pconfig.columns.length, colWidths);

      // Add any remainder to last column
      if (colRem)
        cols[cols.length - 1] = cols[cols.length - 1] + (colRem || 0);

      pconfig.columns = cols;

    }

    // If not same column count calculate percentages
    // to respect user defined dimensions.
    else {

      // Map current col vals to percentages of width so we
      // can maintain aspect ratio.
      pconfig.columns = pconfig.columns.map(v => Math.floor(this.toPercentage(v, pconfig.total) * config.total));

      // We need to ensure the columns are the same total length.
      const adjusted = Math.max(0, config.total - this.sum(pconfig.columns));

      // Add any adjustment so our totals match.
      pconfig.columns[pconfig.columns.length - 1] = pconfig.columns[pconfig.columns.length - 1] + adjusted;

    }

    pconfig.total = config.total;
    pconfig.adjustedLayout = config.adjustedLayout;
    pconfig.layout = config.layout;
    pconfig.adjustment = config.adjustment;
    pconfig.remainder = config.remainder;

    return pconfig;

  }

  private renderHeader(rows: string[], config: ITablurConfig) {

    let pconfig = this.renderColumnsAdjust(this._header.columnCounts(), config);

    const bdr = this.options.borders[this.options.border];
    let header = this._header.render(pconfig);

    const fillCount = Math.round(this._header.options.padding / 2);
    const boxFill = this.wrap(config.layout, fillCount, this.options.border);

    const isNextBreak = this._indexed[0];

    if (this._header.options.border) {
      let btmBorder = [this.horizontalFill(config.layout, bdr.horizontal, bdr.vertical)];
      if (!isNextBreak)
        header = header.slice(0, header.length - 1);
      else
        btmBorder = [];
      header = [...header, ...btmBorder];
    }
    else {
      header = [...header, ...boxFill.fill, boxFill.top];
    }

    // Add the header to the rows.
    return [...header, ...rows];

  }

  private renderFooter(rows: string[], config: ITablurConfig) {

    // Parse the footer columns.
    let pconfig = this.renderColumnsAdjust(this._footer.columnCounts(), config);

    const bdr = this.options.borders[this.options.border];

    const fillCount = Math.round(this._footer.options.padding / 2);
    const boxFill = this.wrap(config.layout, fillCount, this.options.border);

    const isPrevBreak = this._indexed[this._rows.length - 1];

    let footer = this._footer.render(pconfig);
    if (this._footer.options.border) {
      let topBorder = [this.horizontalFill(config.layout, bdr.horizontal, bdr.vertical)];
      if (!isPrevBreak)
        footer = footer.slice(1);
      else
        topBorder = [];
      footer = [...topBorder, ...footer];
    }
    else {
      footer = [boxFill.bottom, ...boxFill.fill, ...footer, ...boxFill.fill];
    }

    return [...rows, ...footer];

  }

  /**
  * Wrap creates border wrap and builds fill rows for padding.
  *
  * @example .wrap(75, 3, TablerBorder.round, [0, 12, 40]);
  *
  * @param width the width of the element to border wrap.
  * @param fill the fill count for padding.
  * @param border the border to use.
  * @param indices indices to match bordering for fill rows.
  */
  protected wrap(width: number, fill: number, border?: TablurBorder, indices?: number[]) {

    let bdr = this.options.borders[border];

    bdr = bdr || {
      topLeft: '',
      topRight: '',
      bottomLeft: '',
      bottomRight: '',
      horizontal: '',
      vertical: ''
    };

    let baseFill = this.horizontalFill(width, bdr.horizontal, null, -2);

    let horizFill: any = this.horizontalFill(width, ' ', bdr.vertical);

    if (indices && indices.length) {
      indices.forEach(v => {
        horizFill = horizFill.slice(0, v) + bdr.vertical + horizFill.slice(v + 1);
      });
    }

    horizFill = this.fillArray(fill, horizFill) as string[];

    return {
      top: bdr.topLeft + baseFill + bdr.topRight,
      bottom: bdr.bottomLeft + baseFill + bdr.bottomRight,
      fill: horizFill
    };

  }

  // API //

  /**
   *
   * @param str a string to be colorized.
   * @param styles
   */
  colorize(str: string, styles?: TablurColor | IAnsiStyles | IAnsiStyles[]) {
    styles = styles || this.options.borderColor as any;
    if (!styles)
      return str;
    if (!Array.isArray(styles))
      styles = [<any>styles];
    return colurs.applyAnsi(str, <IAnsiStyles[]>styles);
  }

  /**
   * Add header row with alignment.
   *
   * @example .header('My Header', TablerAlign.center);
   *
   * @param text header column text.
   * @param align column alignment.
   */
  header(
    text: string,
    align?: TablurAlign
  ): Tablur;

  /**
   * Add header row with options.
   *
   * @example .header({ text: 'copyright 2018' }, { option overrides });
   *
   * @param col header column title or configuration object.
   * @param options options used to override inherited defaults.
   */
  header(
    col: string | ITablurColumn,
    options?: ITablurOptionsBase
  ): Tablur;

  /**
   * Add header row with options.
   *
   * @example .header('Column 1', 'Column 2'..., { option overrides });
   *
   * @param col1 header column title or configuration object.
   * @param col2 header column title or configuration object.
   * @param options options used to override inherited defaults.
   */
  header(
    col1: string | ITablurColumn,
    col2: string | ITablurColumn,
    options?: ITablurOptionsBase
  ): Tablur;

  /**
   * Add header row with options.
   *
   * @example .header('Column 1', 'Column 2'..., { option overrides });
   *
   * @param col1 footer column title or configuration object.
   * @param col2 footer column title or configuration object.
   * @param col3 footer column title or configuration object.
   * @param options options used to override inherited defaults.
   */
  header(
    col1: string | ITablurColumn,
    col2: string | ITablurColumn,
    col3: string | ITablurColumn,
    options?: ITablurOptionsBase
  ): Tablur;

  /**
   * Add header row with options.
   *
   * @example .header('Column 1', 'Column 2'..., { option overrides });
   *
   * @param col1 header column title or configuration object.
   * @param col2 header column title or configuration object.
   * @param col3 header column title or configuration object.
   * @param col4 header column title or configuration object.
   * @param options options used to override inherited defaults.
   */
  header(
    col1: string | ITablurColumn,
    col2: string | ITablurColumn,
    col3: string | ITablurColumn,
    col4: string | ITablurColumn,
    options?: ITablurOptionsBase
  ): Tablur;

  /**
   * Add header row with options.
   *
   * @example .header('Column 1', 'Column 2'..., { option overrides });
   *
   * @param col1 header column title or configuration object.
   * @param col2 header column title or configuration object.
   * @param col3 header column title or configuration object.
   * @param col4 header column title or configuration object.
   * @param col5 header column title or configuration object.
   * @param options options used to override inherited defaults.
   */
  header(
    col1: string | ITablurColumn,
    col2: string | ITablurColumn,
    col3: string | ITablurColumn,
    col4: string | ITablurColumn,
    col5: string | ITablurColumn,
    options?: ITablurOptionsBase
  ): Tablur;

  /**
   * Add header row with options.
   *
   * @example .header('Column 1', 'Column 2'..., { option overrides });
   *
   * @param col1 header column title or configuration object.
   * @param col2 header column title or configuration object.
   * @param col3 header column title or configuration object.
   * @param col4 header column title or configuration object.
   * @param col5 header column title or configuration object.
   * @param col6 header column title or configuration object.
   * @param options options used to override inherited defaults.
   */
  header(
    col1: string | ITablurColumn,
    col2: string | ITablurColumn,
    col3: string | ITablurColumn,
    col4: string | ITablurColumn,
    col5: string | ITablurColumn,
    col6: string | ITablurColumn,
    options?: ITablurOptionsBase
  ): Tablur;

  /**
   * Add header using columns.
   *
   * @param cols the header's columns.
   */
  header(...cols: (string | ITablurColumn)[]): Tablur;

  header(...cols: (string | TablurAlign | ITablurColumn | ITablurOptionsBase)[]) {

    let options = {};

    // Check if options object.
    if (this.isBaseOptions(cols[cols.length - 1])) {
      options = cols[cols.length - 1];
      cols = cols.slice(0, cols.length - 2);
    }

    let align: TablurAlign;

    if (TablurAlign[<any>cols[1]]) {

      align = <any>cols[1];
      cols = [...cols.slice(0, 1), ...cols.slice(2)];

      if (typeof cols[0] === 'string') {
        cols[0] = {
          text: <any>cols[0],
          align: align
        };
      }

    }

    options = Object.assign({}, this.options, options);

    this._header = new Tablur(options);
    this._header.row(...cols.map(n => this.toColumn(<any>n)));

    return this;

  }

  /**
   * Add footer row with alignment.
   *
   * @example .footer('copyright 2018', TablerAlign.center);
   *
   * @param text footer column text.
   * @param align column alignment.
   */
  footer(
    text: string,
    align?: TablurAlign
  ): Tablur;

  /**
   * Add footer row with options.
   *
   * @example .footer({ text: 'copyright 2018' }, { option overrides });
   *
   * @param col footer column title or configuration object.
   * @param options options used to override inherited defaults.
   */
  footer(
    col: string | ITablurColumn,
    options?: ITablurOptionsBase
  ): Tablur;

  /**
   * Add footer row with options.
   *
   * @example .footer('Column 1', 'Column 2'..., { option overrides });
   *
   * @param col1 footer column title or configuration object.
   * @param col2 footer column title or configuration object.
   * @param options options used to override inherited defaults.
   */
  footer(
    col1: string | ITablurColumn,
    col2: string | ITablurColumn,
    options?: ITablurOptionsBase
  ): Tablur;

  /**
   * Add footer row with options.
   *
   * @example .footer('Column 1', 'Column 2'..., { option overrides });
   *
   * @param col1 footer column title or configuration object.
   * @param col2 footer column title or configuration object.
   * @param col3 footer column title or configuration object.
   * @param options options used to override inherited defaults.
   */
  footer(
    col1: string | ITablurColumn,
    col2: string | ITablurColumn,
    col3: string | ITablurColumn,
    options?: ITablurOptionsBase
  ): Tablur;

  /**
   * Add footer row with options.
   *
   * @example .footer('Column 1', 'Column 2'..., { option overrides });
   *
   * @param col1 footer column title or configuration object.
   * @param col2 footer column title or configuration object.
   * @param col3 footer column title or configuration object.
   * @param col4 footer column title or configuration object.
   * @param options options used to override inherited defaults.
   */
  footer(
    col1: string | ITablurColumn,
    col2: string | ITablurColumn,
    col3: string | ITablurColumn,
    col4: string | ITablurColumn,
    options?: ITablurOptionsBase
  ): Tablur;

  /**
   * Add footer row with options.
   *
   * @example .footer('Column 1', 'Column 2'..., { option overrides });
   *
   * @param col1 footer column title or configuration object.
   * @param col2 footer column title or configuration object.
   * @param col3 footer column title or configuration object.
   * @param col4 footer column title or configuration object.
   * @param col5 footer column title or configuration object.
   * @param options options used to override inherited defaults.
   */
  footer(
    col1: string | ITablurColumn,
    col2: string | ITablurColumn,
    col3: string | ITablurColumn,
    col4: string | ITablurColumn,
    col5: string | ITablurColumn,
    options?: ITablurOptionsBase
  ): Tablur;

  /**
   * Add footer row with options.
   *
   * @example .footer('Column 1', 'Column 2'..., { option overrides });
   *
   * @param col1 footer column title or configuration object.
   * @param col2 footer column title or configuration object.
   * @param col3 footer column title or configuration object.
   * @param col4 footer column title or configuration object.
   * @param col5 footer column title or configuration object.
   * @param col6 footer column title or configuration object.
   * @param options options used to override inherited defaults.
   */
  footer(
    col1: string | ITablurColumn,
    col2: string | ITablurColumn,
    col3: string | ITablurColumn,
    col4: string | ITablurColumn,
    col5: string | ITablurColumn,
    col6: string | ITablurColumn,
    options?: ITablurOptionsBase
  ): Tablur;

  /**
   * Add footer using columns.
   *
   * @param cols the footer's columns.
   */
  footer(...cols: (string | ITablurColumn | ITablurOptionsBase)[]): Tablur;

  footer(...cols: (string | TablurAlign | ITablurColumn | ITablurOptionsBase)[]) {

    let options = {};

    // Check if options object.
    if (this.isBaseOptions(cols[cols.length - 1])) {
      options = cols[cols.length - 1];
      cols = cols.slice(0, cols.length - 2);
    }

    let align: TablurAlign;

    if (TablurAlign[<any>cols[1]]) {

      align = <any>cols[1];
      cols = [...cols.slice(0, 1), ...cols.slice(2)];

      if (typeof cols[0] === 'string') {
        cols[0] = {
          text: <any>cols[0],
          align: align
        };
      }

    }

    options = Object.assign({}, this.options, options);

    this._footer = new Tablur(options);
    this._footer.row(...cols.map(n => this.toColumn(<any>n)));

    return this;

  }

  /**
   * Adds a new row to the instance.
   *
   * @example .row('column 1', { text: 'column 2' });
   *
   * @param cols the columns of the row to be added.
   */
  row(...cols: (string | ITablurColumn)[]) {
    if (!cols.length)
      return;
    this._rows = [...this._rows, this.buildRow(...cols)];
    return this;
  }

  /**
   * Adds multiple rows containing table columns.
   *
   * @example .rows([ ['row1-col1], [{ text: 'row2-col1 }] ]);
   *
   * @param rows the rows of table columns to add.
   */
  rows(rows: (string | ITablurColumn)[][]) {
    rows.forEach(v => this.row(...v));
    return this;
  }

  /**
   * Creates an empty break in the table.
   *
   * @example .break();
   */
  break() {
    this._indexed[this._rows.length] = 1;
    this.row(<ITablurColumn>{ text: '', configure: false });
    return this;
  }

  /**
   * Adds a row as a section header.
   *
   * @example .section({ text: 'Section:' , align: TablerAlign.center });
   *
   * @param column the column configuration.
   */
  section(column: ITablurColumn): Tablur;

  /**
   * Adds a row as a section header.
   *
   * @example .section('Section:', TablerAlign.left);
   *
   * @param name the name or title of the section.
   * @param align the alignment for the section title.
   */
  section(name: string, align?: TablurAlign): Tablur;

  section(name: string | ITablurColumn, align?: TablurAlign) {

    if (typeof name === 'string') {
      name = {
        text: name
      };
    }

    this._indexed[this._rows.length] = 2;
    name.configure = false;
    name.align = align;
    this.row(name);

    return this;

  }

  /**
   * Configures rows for output adjusting and normalizing cells.
   *
   * @example .configure({ // optional parent config });
   *
   * @param config optional parent configuration to override with.
   */
  configure(config?: ITablurConfig) {

    // Get layout width and get max columns and adjusted widths.
    const layoutWidth = this.layoutWidth();
    config = config || this.columnCounts(this._rows);
    config.layout = layoutWidth;
    config.lines = {};

    const colCount = config.columns.length;

    const offset =
      this.calculateOffset(colCount, this.options.padding, !!this.options.border);
    config.adjustedLayout = (layoutWidth - offset);

    let adjTotal = config.total,
      adjWidth = config.adjustedLayout,
      adjNeg = true;

    // Layout width is too narrow.
    if (config.adjustedLayout > config.total) {
      adjTotal = config.adjustedLayout;
      adjWidth = config.total;
      adjNeg = false;
    }

    config.adjustment = Math.max(0, Math.floor(((adjTotal - adjWidth) / colCount)));
    config.remainder = Math.max(0, (adjTotal - adjWidth) % colCount);

    if (adjNeg) {
      config.adjustment = -Math.abs(config.adjustment);
      config.remainder = -Math.abs(config.remainder);
    }

    this._rows = config.rows = this._rows.map((row, i) => {

      // Ensure same length of columns
      // unless empty or section header.
      if (row.length < colCount && row[0].configure) {
        row = [...row, ...this.fillArray(colCount - row.length, { text: '', width: 0, length: 0, adjusted: 0 })];
      }

      let remainder = Math.abs(config.remainder);
      const decrementer = Math.ceil(remainder / colCount);

      return row.reduce<ITablurColumnInternal[]>((accum, col, n) => {

        if (col.configure) {

          // update adjusted with parsed width.
          col.adjusted = config.columns[n];

          // Subtract any adjustment.
          col.adjusted += config.adjustment;

          // If any remainder lop it off the widest column.
          if (remainder) {
            col.adjusted += adjNeg ? -decrementer : decrementer;
            remainder -= decrementer;
          }

        }

        // Empty & Section columns are simply the layout width.
        else {
          col.adjusted = config.layout;
          if (this.options.border)
            col.adjusted -= 2; // add a tiny bit of extra padding.
        }

        // Text too long should be wrapped to next line.
        if (this.options.scheme === TablurScheme.wrap && col.length > col.adjusted)
          col.text = wrapAnsi(col.text, col.adjusted, { hard: true });

        // overlengthed text should be truncated.
        else if (this.options.scheme === TablurScheme.truncate)
          col.text = this.truncate(col.text, col.adjusted);

        // Split text into lines.
        col.lines = col.text.split('\n');

        // Update the line count.
        config.lines[i] = Math.max(config.lines[i] || 0, col.lines.length);

        accum = [...accum, col];

        return accum;

      }, []);

    }, this);


    return config;

  }

  /**
   * Render the rows into array of strings.
   *
   * @example .render({ // optional parent config });
   *
   * @param pconfig the parent's parsed column metadata.
   */
  render(pconfig?: ITablurConfig) {

    if (!this._rows.length)
      return [];

    const config = this.configure(pconfig);
    const options = this.options;

    let padding = options.padding ? ' '.repeat(options.padding) : '';
    let joinGutter = padding;
    const border = options.borders[options.border];

    // let actualWidth;

    if (border) {
      const borderGutterRepeat = Math.max(0, options.padding / 2);
      const borderGutter = options.padding && borderGutterRepeat
        ? ' '.repeat(borderGutterRepeat)
        : '';
      joinGutter = borderGutter + border.vertical + borderGutter;
    }

    // Iterate rows building lines.
    let rows = config.rows.reduce<string[]>((a, c, i) => {

      return [...a, c.reduce<string[][]>((res, col, n) => {

        // Ensure same line count when multiline wrap.
        if (col.lines.length < config.lines[i] && col.configure)
          col.lines = [...col.lines, ...this.fillArray(config.lines[i] - col.lines.length)];

        // Map wrapped multilines to correct row/col.
        col.lines.forEach((l, x) => {

          res[x] = res[x] || [];
          const val = this.pad(l, col.adjusted, col.align);

          const colLen = config.columns.length;

          // Handled bordered tables.
          if (border && col.configure && (n === 0 || n === (colLen - 1))) {

            res[x][n] = n !== 0
              ? val + padding + border.vertical
              : colLen === 1
                ? border.vertical + padding + val + padding + border.vertical
                : border.vertical + padding + val;

          }

          else if (!col.configure) {
            const pad = this.options.border ? ' ' : '';
            res[x][n] = pad + val + pad;
          }

          // Non bordered table.
          else {
            res[x][n] = val;
          }

        });

        return res;

      }, []).map(c => c.join(joinGutter)).join('\n')];

    }, []);

    let horizBorderRow;
    const fillPad = Math.round(options.padding / 2);

    if (border) {

      horizBorderRow = this.horizontalFill(config.layout, border.horizontal, border.vertical);

      const boxWrap =
        this.wrap(config.layout, fillPad, options.border, this.findIndices(stripAnsi(rows[0].split('\n')[0]), border.vertical));

      // Override fill if not greater than 1.
      if (!(fillPad > 1))
        boxWrap.fill = [];

      const rowFill = [...boxWrap.fill, horizBorderRow, ...boxWrap.fill];

      rows = rows.reduce((a, c, i, arr) => {

        let curFill = rowFill;

        if (this._indexed[i] > 0) {
          if (this._indexed[i + 1])
            curFill = [];
          else
            curFill = [boxWrap.top, ...boxWrap.fill];
        }

        else if (arr[i + 1] && this._indexed[i + 1] > 0)
          curFill = [...boxWrap.fill, boxWrap.bottom];

        if (i !== rows.length - 1)
          a = [...a, c, ...curFill];
        else
          a = [...a, c, ...boxWrap.fill];

        return a;

      }, [...boxWrap.fill]);


      if (!this._header && !this._indexed[0])
        rows = [boxWrap.top, ...rows];

      if (!this._footer && !this._indexed[rows.length - 1])
        rows = [...rows, boxWrap.bottom];

    }
    else {

      const rowFill = this.fillArray(fillPad, this.horizontalFill(config.layout, ' '));

      rows = rows.reduce((a, c, i, arr) => {

        let curFill = rowFill;

        if (this._indexed[i] > 0)
          curFill = [];

        else if (arr[i + 1] && this._indexed[i + 1] > 0)
          curFill = rowFill[0] || [];

        if (i !== rows.length - 1)
          a = [...a, c, ...curFill];
        else
          a = [...a, c];
        return a;

      }, []);

    }

    // Render the header if present.
    if (this._header)
      rows = this.renderHeader(rows, config);

    // Render the footer if present.
    if (this._footer)
      rows = this.renderFooter(rows, config);

    return rows;

  }

  toString() {
    return this.render().join('\n');
  }

  /**
   * Writes table to output stream with optional wrapping.
   * By default tables are wrapped with empty lines. Set to
   * null to disable.
   *
   * @example .write();
   * @example .write(process.stderr);
   * @example .write('-------------------------------');
   *
   * @param wrap when true wrap with char repeated on top and bottom.
   * @param stream optional NodeJS.Writeable stream to output to.
   */
  write(wrap: string | NodeJS.WritableStream = ' ', stream: NodeJS.WritableStream = process.stdout) {

    if (!this._rows.length)
      return;

    let rendered = this.render();

    if (typeof wrap === 'object') {
      stream = wrap as NodeJS.WritableStream;
      wrap = undefined;
    }

    wrap = '';

    if (wrap) {

      const len = stripAnsi(rendered[0]).length;
      const isNewLine = /[\n]/.test(<string>wrap);

      // Don't repeat simple new lines.
      if (wrap === '' || /[\n]/.test(<string>wrap)) {
        rendered = ['', ...rendered, ''];
      }

      // Repeat the provided string.
      else if (wrap && typeof wrap === 'string') {
        wrap = (wrap as any).repeat(len);
        rendered = [wrap, ...rendered, wrap] as string[];
      }

    }

    let result = rendered.join('\n');
    const border = this.options.borders[this.options.border];
    let borders;

    if (border && this.options.borderColor) {
      borders = Object.keys(this.options.borders[this.options.border]).map(k => TABLER_BORDERS.round[k]).join('|');
      result = result.replace(new RegExp('(' + borders + ')', 'g'), (s) => this.colorize(s, this.options.borderColor));
    }

    stream.write(result + '\n');

  }

  /**
   * Clears all current rows.
   */
  clear() {
    this._rows = [];
    return this;
  }

  /**
   * Reset all rows and options.
   *
   * @param options pass new options.
   */
  reset(options?: ITablurOptions) {
    this.clear();
    this.options = Object.assign({}, DEFAULTS, options);
    this._header = undefined;
    this._footer = undefined;
    this.init();
    return this;
  }

}

