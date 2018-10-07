import * as stripAnsi from 'strip-ansi';
import * as wrapAnsi from 'wrap-ansi';
import { isBoolean, isString, isNumber, isObject, includes, isValue, last, first, isPlainObject, isUndefined } from 'chek';
import { Colurs, IColurs } from 'colurs';
import { inspect } from 'util';
import * as termSize from 'term-size';

import { TablurPadding, ITablurOptions, ITablurBorders, ITablurBorder, ITablurTokens, ITablurColumn, TablurAlign, TablurBorder, ITablurColumnGlobal } from './interfaces';


// HELPERS //

function seedArray<T>(len: number, def?: any, seed?: T[]): T[] {
  seed = seed || [];
  def = def || 0;
  if (isValue(seed) && !Array.isArray(seed))
    seed = [seed];
  let arr = new Array(len).fill(def);
  return arr.map((v, i) => {
    return seed[i] || v;
  });
}

function toPadding(padding: TablurPadding, def?: TablurPadding, seed?: number[]): [number, number, number, number] {
  def = isValue(def) ? def : [0, 0, 0, 0];
  if (isNumber(def))
    def = seedArray(4, def) as any;
  if (!isValue(padding))
    padding = def;
  if (isNumber(padding))
    padding = seedArray(4, padding) as any;
  padding = (padding as any).map((v, i) => {
    v = seed ? seed[i] : v || 0;
    if (isString(v))
      v = parseInt(v, 10);
    return v;
  });
  return <any>(padding || def);
}

function isDecimal(val: any) {
  if (isString(val))
    val = parseInt(val, 10);
  return (val % 1) !== 0;
}

function toContentWidth(width: number) {
  const termWidth = termSize().columns;
  if (width === 0)
    width = termWidth;
  if (isDecimal(width))
    width = Math.round(termWidth * width);
  return width;
}

function divide(val: number, by: number) {
  const width = Math.max(0, Math.floor(val / by));
  const remainder = Math.max(0, val % by);
  return {
    width,
    remainder
  };
}

// CONSTANTS //

const DEFAULT_OPTIONS: ITablurOptions = {
  stream: process.stdout,
  width: undefined,
  justify: true,
  gutter: 2,
  shift: false,
  padding: [0, 0, 0, 0],
  border: undefined,
  borderColor: undefined,
  stringLength: undefined
};

const BORDERS: ITablurBorders = {

  single: {
    'topLeft': '┌',
    'topRight': '┐',
    'bottomRight': '┘',
    'bottomLeft': '└',
    'vertical': '│',
    'horizontal': '─'
  },
  double: {
    'topLeft': '╔',
    'topRight': '╗',
    'bottomRight': '╝',
    'bottomLeft': '╚',
    'vertical': '║',
    'horizontal': '═'
  },
  round: {
    'topLeft': '╭',
    'topRight': '╮',
    'bottomRight': '╯',
    'bottomLeft': '╰',
    'vertical': '│',
    'horizontal': '─'
  },
  singleDouble: {
    'topLeft': '╓',
    'topRight': '╖',
    'bottomRight': '╜',
    'bottomLeft': '╙',
    'vertical': '║',
    'horizontal': '─'
  },
  doubleSingle: {
    'topLeft': '╒',
    'topRight': '╕',
    'bottomRight': '╛',
    'bottomLeft': '╘',
    'vertical': '│',
    'horizontal': '═'
  },
  classic: {
    'topLeft': '+',
    'topRight': '+',
    'bottomRight': '+',
    'bottomLeft': '+',
    'vertical': '|',
    'horizontal': '-'
  }

};

// CLASS //

export class Tablur {

  options: ITablurOptions;
  border: ITablurBorder;
  debug: boolean;
  tokens: ITablurTokens;
  rows: ITablurColumn[][] = [];
  colurs: IColurs;

  constructor(options?: ITablurOptions | boolean, debug?: boolean) {
    this.init(<ITablurOptions>options, debug);
  }

  private init(options: ITablurOptions | boolean, debug: boolean) {

    if (isBoolean(options)) {
      debug = <boolean>options;
      options = undefined;
    }

    this.debug = debug;
    this.options = options = Object.assign({}, DEFAULT_OPTIONS, options) as ITablurOptions;
    this.border = BORDERS[options.border];

    if (this.options.borderColor)
      this.options.colorize = true;

    this.colurs = new Colurs({ enabled: this.options.colorize });

    this.tokens = {
      pad: debug ? this.colurs.blueBright('P') : ' ',
      align: debug ? this.colurs.greenBright('A') : ' ',
      indent: debug ? this.colurs.cyanBright('>') : ' ',
      shift: debug ? this.colurs.magentaBright('S') : ' '
    };

  }

  private pad(str: string, dir: TablurAlign, width: number, char: string = ' ') {

    const len = this.stringLength(str);

    if (len > width)
      return str;

    const baseOffset = Math.max(0, width - len);

    if (dir === 'left')
      return char.repeat(baseOffset) + str;

    if (dir === 'right')
      return str + char.repeat(baseOffset);

    const div = divide(baseOffset, 2);
    return char.repeat(div.width) + str + char.repeat(div.width) + char.repeat(div.remainder);

  }

  // Shift text so that right or left
  // aligned text doesn't have space
  // at the boundary position.
  private shiftLine(text: string, align: string) {

    const exp = align === 'right' ? /\s+$/ : /^\s+/;
    if (align === 'center' || !exp.test(text))
      return text;

    const matches = (text.match(exp) || []).map(v => this.tokens.shift);

    // Add one so that join works.
    if (matches.length)
      matches.push(matches[0]);

    text = text.replace(exp, '');

    if (align === 'left')
      return (text += matches.join(''));

    return matches.join('') + text;

  }

  private stringLength(str: string) {

    const fn = this.options.stringLength || function (s) {
      s = stripAnsi(s);
      s = s.replace(/\n/g, '');
      return s.length;
    };

    return fn(str);

  }

  padLeft(str: string, width: number, char: string) {
    return this.pad(str, 'left', width, char);
  }

  padCenter(str: string, width: number, char: string) {
    return this.pad(str, 'center', width, char);
  }

  padRight(str: string, width: number, char: string) {
    return this.pad(str, 'right', width, char);
  }

  getBorders(width: number, border: TablurBorder | ITablurBorder) {

    let _border = <ITablurBorder>border;

    if (isString(border))
      _border = BORDERS[<string>border];

    if (!_border) return undefined;

    const bdr = this.border;
    let top = bdr.topLeft + bdr.horizontal.repeat(width - 2) + bdr.topRight;
    let horizontal = bdr.vertical + bdr.horizontal.repeat(width - 2) + bdr.vertical;
    let bottom = bdr.bottomLeft + bdr.horizontal.repeat(width - 2) + bdr.bottomRight;

    if (this.options.borderColor) {
      top = this.colurs.applyAnsi(top, this.options.borderColor);
      horizontal = this.colurs.applyAnsi(horizontal, this.options.borderColor);
      bottom = this.colurs.applyAnsi(bottom, this.options.borderColor);
    }

    return {
      top,
      bottom,
      horizontal
    };

  }

  getMaxRow(rows: ITablurColumn[] | ITablurColumn[][], widthOnly?: boolean) {

    let _rows = <ITablurColumn[][]>rows;
    if (!Array.isArray(rows[0]))
      _rows = [<any>_rows] as ITablurColumn[][];

    // Ensure gutter divisible by 2.
    const gutter = Math.max(0, Math.floor(this.options.gutter / 2)) * 2;

    const totals = _rows.reduce((result, columns, n) => {

      let curCount = columns.length;

      columns.forEach((col, i) => {

        let len = (col.width || this.stringLength(col.text));

        if (!widthOnly) {
          len += col.indent;
          len += (col.padding[1] + col.padding[3]);
        }

        result.columns[i] = result.columns[i] || 0;
        result.columns[i] = len > result.columns[i] ? len : result.columns[i];

      });

      let adj = 0;

      if (!widthOnly) {

        // Add gutter.
        if (columns.length > 1)
          adj += (gutter * (columns.length - 1));

        // Add border.
        if (this.options.border)
          adj += ((columns.length - 1) + 2);

      }

      result.adjustment = adj > result.adjustment ? adj : result.adjustment;
      result.count = curCount > result.count ? curCount : result.count;

      return result;

    }, { width: 0, adjustment: 0, count: 0, columns: [] });

    totals.width = totals.columns.reduce((a, c) => a + c, 0) + totals.adjustment;

    return totals;

  }

  normalize(column: ITablurColumn): ITablurColumn[];
  normalize(columns: string[] | ITablurColumn[], globals?: ITablurColumnGlobal): ITablurColumn[];
  normalize(text: string): ITablurColumn[];
  normalize(text: string, align: TablurAlign, padding?: TablurPadding): ITablurColumn[];
  normalize(text: string, width: number, align?: TablurAlign, padding?: TablurPadding): ITablurColumn[];
  normalize(text: any | ITablurColumn | any[] | ITablurColumn[], width?: number | TablurAlign | ITablurColumnGlobal,
    align?: TablurPadding | TablurAlign, padding?: TablurPadding): ITablurColumn[] {

    if (isString(width)) {
      padding = <number>align;
      align = <TablurAlign>width;
      width = undefined;
    }

    if (isNumber(align)) {
      padding = <number>align;
      align = undefined;
    }

    const colDefaults = {
      align: 'left',
      shift: this.options.shift,
      padding: this.options.padding,
      indent: 0
    };

    let globalOpts = isObject(width) ? Object.assign({}, colDefaults, <ITablurColumnGlobal>width) : undefined;

    width = isNumber(width) ? width : undefined;
    align = align || 'left';

    if (!Array.isArray(text)) {

      // Convert to column object.
      if (!isObject(text)) {
        text = {
          text,
          align,
          width,
          padding: padding
        } as ITablurColumn;
      }

      // Single column config passed.
      text = [text] as ITablurColumn[];

    }

    const cols = (text as ITablurColumn[]);

    return cols.map((c, i) => {

      if (isString(c)) {

        const str = <any>c;
        let parts = str.split('|').map(v => {
          if (v === 'null' || v === 'undefined')
            return undefined;
          return v;
        });

        // allow shorthand config:
        // text|width|align|padding OR text|align|padding
        // for padding split with : for top, right, bottom, left.
        if (parts[1] && includes(['left', 'right', 'center', 'none'], parts[1]))
          parts = [parts[0], undefined, ...parts.slice(1)];
        if (parts[3]) {
          if (~parts[3].indexOf(':'))
            parts[3] = parts[3].split(':').map(v => parseInt(v, 10));
          else
            parts[3] = parseInt(parts[3], 10);
          parts[3] = seedArray(4, 0, parts[3]);
        }

        parts[1] = isString(parts[1]) ? parseInt(parts[1], 10) : parts[1];

        if (parts.length > 1) {
          c = {
            text: parts[0],
            width: parts[1],
            align: parts[2],
            padding: parts[3]
          };
        }

        else {
          c = {
            text: <any>c
          };
        }

      }

      else if (!isPlainObject(c)) {
        c = {
          text: <any>c
        };
      }

      // Ensure text is string.
      // Don't colorize user should do
      // so if that is desired.
      if (!isString(c.text))
        c.text = inspect(c.text, undefined, undefined, false);

      c = Object.assign({}, colDefaults, c, globalOpts);

      c.align = c.align || 'left';
      c.padding = toPadding(c.padding, padding);
      c.isRow = true;

      return c;

    });

  }

  columnize(cols: ITablurColumn[], maxWidth: number, maxColumns: number[]) {

    let result = [];
    let resultPad = [];

    const alignMap: any = {
      left: this.padRight.bind(this),
      right: this.padLeft.bind(this),
      center: this.padCenter.bind(this),
      none: (v, w) => v
    };

    const colLen = cols.length - 1;

    // Get the widest content width.
    let contentWidth = this.getMaxRow(cols, true).width;

    // Gutter must be divisible by two
    // in order to work with borders.
    let gutter = Math.max(0, Math.floor(this.options.gutter / 2));
    let gutterLen = (gutter * 2) * colLen;

    // Acount for inner borders wrapped in spaces
    let borderLen = this.border ? colLen + 2 : 0;

    // Check for border and colorize.
    let vertBdr = this.options.border ? this.border.vertical : '';
    vertBdr = this.options.borderColor ? this.colurs.applyAnsi(vertBdr, this.options.borderColor) : vertBdr;

    // Define the gutter string for joining columns.
    let gutterStr = !gutter ? '' : ' '.repeat(gutter * 2);
    gutterStr = borderLen ? ' '.repeat(gutter) + vertBdr + ' '.repeat(gutter) : gutterStr;

    // If static row ignore gutter and border.
    if (cols.length === 1 && cols[0].borders === false) {
      gutterLen = 0;
      borderLen = 0;
    }

    // The max width available less the gutter and border lengths.
    let adjWidth = maxWidth - gutterLen - borderLen;

    // The column adjustment if content is less than total width.
    let colAdjust = Math.max(0, adjWidth - contentWidth);

    // The width to be added to each column.
    let colDiv = divide(colAdjust, cols.length);
    let colRemainDiv = divide(colDiv.remainder, cols.length);

    let remainingWidth = adjWidth;
    let remainingCols = cols.length;
    let maxLines = [];

    const normalized: any = {};
    const lastCol = cols.length - 1;

    cols.forEach((c, i) => {

      let str;
      let colWidth;
      const char = c.isRepeat ? c.text : null;
      const padding = c.padding[1] + c.padding[3];
      const indent = c.indent || 0;

      str = char ? '' : c.text || '';

      // Rows are inner row items that are
      // NOT a break, section or repeat.
      if (c.isRow) {

        if (!isValue(c.width)) {

          if (this.options.width === 0)
            c.width = 0;

          else if (this.options.justify)
            c.width = maxColumns[i];
        }

      }

      // Auto size column.
      if (c.width === 0) {

        const div = divide(remainingWidth, remainingCols);
        const remainder = divide(div.remainder, remainingCols);

        colWidth = div.width;
        colWidth = (colWidth + remainder.width) + (i === 0 ? remainder.remainder : 0);

      }

      // Define with by static value or with of content.
      else {

        const colContentWidth = this.stringLength(c.text) // + (colDiv.width + colRemainDiv.width);

        colWidth = c.width || colContentWidth;

        colWidth = i === lastCol ? colWidth + colRemainDiv.remainder : colWidth;

        if (colWidth < remainingWidth && i === lastCol)
          colWidth = remainingWidth;

        if (colWidth > remainingWidth)
          colWidth = remainingWidth;

      }

      remainingWidth -= colWidth;
      remainingCols -= 1;

      let innerWidth = colWidth - padding - indent;

      const config: any = Object.assign({}, c);
      config.width = colWidth;
      config.innerWidth = innerWidth;

      if (c.isRepeat) {
        const rptDiv = divide(innerWidth, c.text.length);
        str = c.text.repeat(rptDiv.width);
        if (rptDiv.remainder)
          str = (c.text.charAt(0).repeat(rptDiv.remainder));
      }
      else {
        if (this.stringLength(str) > innerWidth)
          str = wrapAnsi(str, innerWidth, { hard: true, trim: false });
      }

      config.textArray = str.split('\n');
      config.lines = str.match(/\n/g) || [];
      config.borders = c.borders;

      normalized[i] = config;
      if (config.lines.length > maxLines.length)
        maxLines = config.lines;

    });

    const map = {};

    const normalizedKeys = Object.keys(normalized);
    const firstKey = first(normalizedKeys);
    const lastKey = last(normalizedKeys);

    normalizedKeys.forEach((k, n) => {

      const config = normalized[k];

      // If not enough lines extend to match
      // the total required lines.
      if (config.lines.length < maxLines.length) {
        const adj = maxLines.slice(0, maxLines.length - config.lines.length).map(v => '');
        config.textArray = [...config.textArray, ...adj];
      }

      // Build up row used for padding.
      let buildPadRow = this.tokens.pad.repeat(config.width);

      // Inspect if pad row requires borders.
      if (this.border && config.borders !== false) {

        if (k === firstKey)
          buildPadRow = vertBdr + buildPadRow;

        if (k === lastKey)
          buildPadRow += vertBdr;

        resultPad.push(buildPadRow);

      }

      // Iterate each line building borders and padding.
      config.textArray.forEach((line, index) => {

        if (config.shift)
          line = this.shiftLine(line, config.align);

        if (config.padding)
          line = this.tokens.pad.repeat(config.padding[1]) + line + this.tokens.pad.repeat(config.padding[3]);

        if (config.indent)
          line = this.tokens.indent.repeat(config.indent) + line;

        line = config.align ? alignMap[config.align](line, config.width, this.tokens.align) : line;

        if (this.border && config.borders !== false) {

          let vertical = this.border.vertical;

          if (this.options.borderColor)
            vertical = this.colurs.applyAnsi(vertical, this.options.borderColor);

          if (k === firstKey)
            line = vertical + line;

          if (k === lastKey)
            line += vertical;

        }

        map[index] = map[index] || [];
        map[index] = [...map[index], line];

      });


    });

    for (const i in map) {
      const row = map[i];
      result.push(row.join(gutterStr));
    }

    const padRow = resultPad.length ? resultPad.join(gutterStr) : '';

    return {
      row: result.join('\n'),
      padRow: padRow
    };

  }

  row(column: ITablurColumn): Tablur;
  row(columns: string[] | ITablurColumn[], globals?: ITablurColumnGlobal): Tablur;
  row(text: string): Tablur;
  row(text: string, align: TablurAlign, padding?: TablurPadding): Tablur;
  row(text: string, width: number, align?: TablurAlign, padding?: TablurPadding): Tablur;
  row(text: any | ITablurColumn | any[] | ITablurColumn[], width?: number | TablurAlign | ITablurColumnGlobal,
    align?: TablurPadding | TablurAlign, padding?: TablurPadding): Tablur {
    const self = this;
    const normalized = this.normalize(text, <any>width, <any>align, padding);
    this.rows.push(normalized);
    return this;
  }

  section(column: ITablurColumn): Tablur;
  section(text: string): Tablur;
  section(text: string, padding: TablurPadding): Tablur;
  section(text: string, align: TablurAlign, padding?: TablurPadding): Tablur;
  section(text: string | ITablurColumn, align?: TablurPadding | TablurAlign, padding?: TablurPadding) {

    let obj = <ITablurColumn>text;

    if (isNumber(align) || Array.isArray(align)) {
      padding = <TablurPadding>align;
      align = undefined;
    }

    if (isNumber(padding))
      padding = <any>[padding, padding, padding, padding];

    align = align || 'left';
    padding = padding || seedArray(4, 0) as any;

    if (!isObject(text)) {
      obj = {
        text,
        align
      } as ITablurColumn;

      obj.padding = <any>padding;
    }

    obj.align = obj.align || <string>align;
    obj.padding = toPadding(obj.padding);
    obj.isSection = true;
    obj.borders = !isValue(obj.borders) ? false : obj.borders;
    // if (obj.borders && !obj.align)
    //   obj.align = 'left';
    this.rows.push([obj]);

    return this;

  }

  repeat(text: string): Tablur;
  repeat(column: ITablurColumn): Tablur;
  repeat(text: string, padding: TablurPadding): Tablur;
  repeat(text: string, align: TablurAlign, padding?: TablurPadding): Tablur;
  repeat(text: string | ITablurColumn, align?: TablurPadding | TablurAlign, padding?: TablurPadding) {

    let obj = <ITablurColumn>text;

    if (isNumber(align) || Array.isArray(align)) {
      padding = <TablurPadding>align;
      align = undefined;
    }

    if (isNumber(padding))
      padding = <any>[padding, padding, padding, padding];

    align = align || 'left';
    padding = padding || seedArray(4, 0) as any;

    if (!isObject(text)) {
      obj = {
        text,
        align
      } as ITablurColumn;

      obj.padding = <any>padding;
    }
    obj.shift = false;
    obj.padding = toPadding(obj.padding);
    obj.isRepeat = true;
    obj.borders = !isValue(obj.borders) ? false : obj.borders;
    this.rows.push([obj]);

    return this;

  }

  break() {

    this.rows.push([{
      text: '',
      indent: 0,
      borders: false,
      shift: false,
      padding: [0, 0, 0, 0]
    }]);

    return this;

  }

  build(): string[];
  build(width: number): string[];
  build(row: ITablurColumn[], width?: number): string[];
  build(rows: ITablurColumn[][], width?: number): string[];
  build(rows?: number | ITablurColumn[] | ITablurColumn[][], width?: number) {

    if (isNumber(rows)) {
      width = <number>rows;
      rows = undefined;
    }

    rows = rows || this.rows;
    let _rows = <ITablurColumn[][]>rows;

    if (!Array.isArray(rows[0]))
      _rows = [<any>_rows] as ITablurColumn[][];

    const max = this.getMaxRow(_rows);
    let maxWidth = width || max.width;
    let borders = this.getBorders(maxWidth, this.options.border);

    const columnized = _rows.reduce((a, c, i) => {

      const hasBorders = borders && c[0].borders !== false;
      const padTop = c[0].padding[0];
      const padBtm = c[0].padding[2];

      const renderedCol = this.columnize(c, maxWidth, max.columns);

      let arr = [];

      if (hasBorders && i === 0)
        arr.push(borders.top);

      if (padTop) {
        arr = [...arr, ...seedArray(padTop, renderedCol.padRow)];
      }

      arr.push(renderedCol.row);

      if (padBtm) {
        arr = [...arr, ...seedArray(padBtm, renderedCol.padRow)];
      }

      const curr = c[0];
      const prev = (_rows[i - 1] && _rows[i - 1][0]) || <any>{};
      const next = (_rows[i + 1] && _rows[i + 1][0]) || <any>{};

      if (borders && _rows.length > 1 && (i < (_rows.length - 1))) {

        if (next.borders === false && curr.borders !== false)
          arr.push(borders.bottom);

        else if (c[0].borders === false && next.borders !== false)
          arr.push(borders.top);

        else if (curr.borders !== false)
          arr.push(borders.horizontal);

      }
      else if (borders) {

        if (i === 0 && c[0].borders !== false) {
          if (_rows.length === 1)
            arr.push(borders.bottom);
        }

        else if (i === _rows.length - 1 && c[0].borders !== false) {
          arr.push(borders.bottom);
        }

      }

      return [...a, ...arr];

    }, [] as string[]);

    return columnized;

  }

  toString() {
    let width = toContentWidth(this.options.width);
    return this.build(width).join('\n');
  }

  render(wrap?: boolean) {
    let str = this.toString();
    if (wrap)
      str = '\n' + str + '\n';
    this.options.stream.write(str + '\n');
    return this;
  }

  clear() {
    this.rows = [];
    return this;
  }

  reset(options?: ITablurOptions | boolean, debug?: boolean) {
    options = options || this.options;
    this
      .clear()
      .init(options, debug);
    return this;
  }

}



