"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var stripAnsi = require("strip-ansi");
var wrapAnsi = require("wrap-ansi");
var chek_1 = require("chek");
var colurs_1 = require("colurs");
var util_1 = require("util");
var termSize = require("term-size");
// HELPERS //
function seedArray(len, def, seed) {
    seed = seed || [];
    def = def || 0;
    if (chek_1.isValue(seed) && !Array.isArray(seed))
        seed = [seed];
    var arr = new Array(len).fill(def);
    return arr.map(function (v, i) {
        return seed[i] || v;
    });
}
function toPadding(padding, def, seed) {
    def = chek_1.isValue(def) ? def : [0, 0, 0, 0];
    if (chek_1.isNumber(def))
        def = seedArray(4, def);
    if (!chek_1.isValue(padding))
        padding = def;
    if (chek_1.isNumber(padding))
        padding = seedArray(4, padding);
    padding = padding.map(function (v, i) {
        v = seed ? seed[i] : v || 0;
        if (chek_1.isString(v))
            v = parseInt(v, 10);
        return v;
    });
    return (padding || def);
}
function isDecimal(val) {
    if (chek_1.isString(val))
        val = parseInt(val, 10);
    return (val % 1) !== 0;
}
function toContentWidth(width) {
    var termWidth = termSize().columns;
    if (width === 0)
        width = termWidth;
    if (isDecimal(width))
        width = Math.round(termWidth * width);
    return width;
}
function divide(val, by) {
    var width = Math.max(0, Math.floor(val / by));
    var remainder = Math.max(0, val % by);
    return {
        width: width,
        remainder: remainder
    };
}
// CONSTANTS //
var DEFAULT_OPTIONS = {
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
var BORDERS = {
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
var Tablur = /** @class */ (function () {
    function Tablur(options, debug) {
        this.rows = [];
        this.init(options, debug);
    }
    Tablur.prototype.init = function (options, debug) {
        if (chek_1.isBoolean(options)) {
            debug = options;
            options = undefined;
        }
        this.debug = debug;
        this.options = options = Object.assign({}, DEFAULT_OPTIONS, options);
        this.border = BORDERS[options.border];
        if (this.options.borderColor)
            this.options.colorize = true;
        this.colurs = new colurs_1.Colurs({ enabled: this.options.colorize });
        this.tokens = {
            pad: debug ? this.colurs.blueBright('P') : ' ',
            align: debug ? this.colurs.greenBright('A') : ' ',
            indent: debug ? this.colurs.cyanBright('>') : ' ',
            shift: debug ? this.colurs.magentaBright('S') : ' '
        };
    };
    Tablur.prototype.pad = function (str, dir, width, char) {
        if (char === void 0) { char = ' '; }
        var len = this.stringLength(str);
        if (len > width)
            return str;
        var baseOffset = Math.max(0, width - len);
        if (dir === 'left')
            return char.repeat(baseOffset) + str;
        if (dir === 'right')
            return str + char.repeat(baseOffset);
        var div = divide(baseOffset, 2);
        return char.repeat(div.width) + str + char.repeat(div.width) + char.repeat(div.remainder);
    };
    // Shift text so that right or left
    // aligned text doesn't have space
    // at the boundary position.
    Tablur.prototype.shiftLine = function (text, align) {
        var _this = this;
        var exp = align === 'right' ? /\s+$/ : /^\s+/;
        if (align === 'center' || !exp.test(text))
            return text;
        var matches = (text.match(exp) || []).map(function (v) { return _this.tokens.shift; });
        // Add one so that join works.
        if (matches.length)
            matches.push(matches[0]);
        text = text.replace(exp, '');
        if (align === 'left')
            return (text += matches.join(''));
        return matches.join('') + text;
    };
    Tablur.prototype.stringLength = function (str) {
        var fn = this.options.stringLength || function (s) {
            s = stripAnsi(s);
            s = s.replace(/\n/g, '');
            return s.length;
        };
        return fn(str);
    };
    Tablur.prototype.padLeft = function (str, width, char) {
        return this.pad(str, 'left', width, char);
    };
    Tablur.prototype.padCenter = function (str, width, char) {
        return this.pad(str, 'center', width, char);
    };
    Tablur.prototype.padRight = function (str, width, char) {
        return this.pad(str, 'right', width, char);
    };
    Tablur.prototype.getBorders = function (width, border) {
        var _border = border;
        if (chek_1.isString(border))
            _border = BORDERS[border];
        if (!_border)
            return undefined;
        var bdr = this.border;
        var top = bdr.topLeft + bdr.horizontal.repeat(width - 2) + bdr.topRight;
        var horizontal = bdr.vertical + bdr.horizontal.repeat(width - 2) + bdr.vertical;
        var bottom = bdr.bottomLeft + bdr.horizontal.repeat(width - 2) + bdr.bottomRight;
        if (this.options.borderColor) {
            top = this.colurs.applyAnsi(top, this.options.borderColor);
            horizontal = this.colurs.applyAnsi(horizontal, this.options.borderColor);
            bottom = this.colurs.applyAnsi(bottom, this.options.borderColor);
        }
        return {
            top: top,
            bottom: bottom,
            horizontal: horizontal
        };
    };
    Tablur.prototype.getMaxRow = function (rows, widthOnly) {
        var _this = this;
        var _rows = rows;
        if (!Array.isArray(rows[0]))
            _rows = [_rows];
        // Ensure gutter divisible by 2.
        var gutter = Math.max(0, Math.floor(this.options.gutter / 2)) * 2;
        var totals = _rows.reduce(function (result, columns, n) {
            var curCount = columns.length;
            columns.forEach(function (col, i) {
                var len = (col.width || _this.stringLength(col.text));
                if (!widthOnly) {
                    len += col.indent;
                    len += (col.padding[1] + col.padding[3]);
                }
                result.columns[i] = result.columns[i] || 0;
                result.columns[i] = len > result.columns[i] ? len : result.columns[i];
            });
            var adj = 0;
            if (!widthOnly) {
                // Add gutter.
                if (columns.length > 1)
                    adj += (gutter * (columns.length - 1));
                // Add border.
                if (_this.options.border)
                    adj += ((columns.length - 1) + 2);
            }
            result.adjustment = adj > result.adjustment ? adj : result.adjustment;
            result.count = curCount > result.count ? curCount : result.count;
            return result;
        }, { width: 0, adjustment: 0, count: 0, columns: [] });
        totals.width = totals.columns.reduce(function (a, c) { return a + c; }, 0) + totals.adjustment;
        return totals;
    };
    Tablur.prototype.normalize = function (text, width, align, padding) {
        if (chek_1.isString(width)) {
            padding = align;
            align = width;
            width = undefined;
        }
        if (chek_1.isNumber(align)) {
            padding = align;
            align = undefined;
        }
        var colDefaults = {
            align: 'left',
            shift: this.options.shift,
            padding: this.options.padding,
            indent: 0
        };
        var globalOpts = chek_1.isObject(width) ? Object.assign({}, colDefaults, width) : undefined;
        width = chek_1.isNumber(width) ? width : undefined;
        align = align || 'left';
        if (!Array.isArray(text)) {
            // Convert to column object.
            if (!chek_1.isObject(text)) {
                text = {
                    text: text,
                    align: align,
                    width: width,
                    padding: padding
                };
            }
            // Single column config passed.
            text = [text];
        }
        var cols = text;
        return cols.map(function (c, i) {
            if (chek_1.isString(c)) {
                var str = c;
                var parts = str.split('|').map(function (v) {
                    if (v === 'null' || v === 'undefined')
                        return undefined;
                    return v;
                });
                // allow shorthand config:
                // text|width|align|padding OR text|align|padding
                // for padding split with : for top, right, bottom, left.
                if (parts[1] && chek_1.includes(['left', 'right', 'center', 'none'], parts[1]))
                    parts = [parts[0], undefined].concat(parts.slice(1));
                if (parts[3]) {
                    if (~parts[3].indexOf(':'))
                        parts[3] = parts[3].split(':').map(function (v) { return parseInt(v, 10); });
                    else
                        parts[3] = parseInt(parts[3], 10);
                    parts[3] = seedArray(4, 0, parts[3]);
                }
                parts[1] = chek_1.isString(parts[1]) ? parseInt(parts[1], 10) : parts[1];
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
                        text: c
                    };
                }
            }
            else if (!chek_1.isPlainObject(c)) {
                c = {
                    text: c
                };
            }
            // Ensure text is string.
            // Don't colorize user should do
            // so if that is desired.
            if (!chek_1.isString(c.text))
                c.text = util_1.inspect(c.text, undefined, undefined, false);
            c = Object.assign({}, colDefaults, c, globalOpts);
            c.align = c.align || 'left';
            c.padding = toPadding(c.padding, padding);
            c.isRow = true;
            return c;
        });
    };
    Tablur.prototype.columnize = function (cols, maxWidth, maxColumns) {
        var _this = this;
        var result = [];
        var resultPad = [];
        var alignMap = {
            left: this.padRight.bind(this),
            right: this.padLeft.bind(this),
            center: this.padCenter.bind(this),
            none: function (v, w) { return v; }
        };
        var colLen = cols.length - 1;
        // Get the widest content width.
        var contentWidth = this.getMaxRow(cols, true).width;
        // Gutter must be divisible by two
        // in order to work with borders.
        var gutter = Math.max(0, Math.floor(this.options.gutter / 2));
        var gutterLen = (gutter * 2) * colLen;
        // Acount for inner borders wrapped in spaces
        var borderLen = this.border ? colLen + 2 : 0;
        // Check for border and colorize.
        var vertBdr = this.options.border ? this.border.vertical : '';
        vertBdr = this.options.borderColor ? this.colurs.applyAnsi(vertBdr, this.options.borderColor) : vertBdr;
        // Define the gutter string for joining columns.
        var gutterStr = !gutter ? '' : ' '.repeat(gutter * 2);
        gutterStr = borderLen ? ' '.repeat(gutter) + vertBdr + ' '.repeat(gutter) : gutterStr;
        // If static row ignore gutter and border.
        if (cols.length === 1 && cols[0].borders === false) {
            gutterLen = 0;
            borderLen = 0;
        }
        // The max width available less the gutter and border lengths.
        var adjWidth = maxWidth - gutterLen - borderLen;
        // The column adjustment if content is less than total width.
        var colAdjust = Math.max(0, adjWidth - contentWidth);
        // The width to be added to each column.
        var colDiv = divide(colAdjust, cols.length);
        var colRemainDiv = divide(colDiv.remainder, cols.length);
        var remainingWidth = adjWidth;
        var remainingCols = cols.length;
        var maxLines = [];
        var normalized = {};
        var lastCol = cols.length - 1;
        cols.forEach(function (c, i) {
            var str;
            var colWidth;
            var char = c.isRepeat ? c.text : null;
            var padding = c.padding[1] + c.padding[3];
            var indent = c.indent || 0;
            str = char ? '' : c.text || '';
            // Rows are inner row items that are
            // NOT a break, section or repeat.
            if (c.isRow) {
                if (!chek_1.isValue(c.width)) {
                    if (_this.options.width === 0)
                        c.width = 0;
                    else if (_this.options.justify)
                        c.width = maxColumns[i];
                }
            }
            // Auto size column.
            if (c.width === 0) {
                var div = divide(remainingWidth, remainingCols);
                var remainder = divide(div.remainder, remainingCols);
                colWidth = div.width;
                colWidth = (colWidth + remainder.width) + (i === 0 ? remainder.remainder : 0);
            }
            // Define with by static value or with of content.
            else {
                var colContentWidth = _this.stringLength(c.text); // + (colDiv.width + colRemainDiv.width);
                colWidth = c.width || colContentWidth;
                colWidth = i === lastCol ? colWidth + colRemainDiv.remainder : colWidth;
                if (colWidth < remainingWidth && i === lastCol)
                    colWidth = remainingWidth;
                if (colWidth > remainingWidth)
                    colWidth = remainingWidth;
            }
            remainingWidth -= colWidth;
            remainingCols -= 1;
            var innerWidth = colWidth - padding - indent;
            var config = Object.assign({}, c);
            config.width = colWidth;
            config.innerWidth = innerWidth;
            if (c.isRepeat) {
                var rptDiv = divide(innerWidth, c.text.length);
                str = c.text.repeat(rptDiv.width);
                if (rptDiv.remainder)
                    str = (c.text.charAt(0).repeat(rptDiv.remainder));
            }
            else {
                if (_this.stringLength(str) > innerWidth)
                    str = wrapAnsi(str, innerWidth, { hard: true, trim: false });
            }
            config.textArray = str.split('\n');
            config.lines = str.match(/\n/g) || [];
            config.borders = c.borders;
            normalized[i] = config;
            if (config.lines.length > maxLines.length)
                maxLines = config.lines;
        });
        var map = {};
        var normalizedKeys = Object.keys(normalized);
        var firstKey = chek_1.first(normalizedKeys);
        var lastKey = chek_1.last(normalizedKeys);
        normalizedKeys.forEach(function (k, n) {
            var config = normalized[k];
            // If not enough lines extend to match
            // the total required lines.
            if (config.lines.length < maxLines.length) {
                var adj = maxLines.slice(0, maxLines.length - config.lines.length).map(function (v) { return ''; });
                config.textArray = config.textArray.concat(adj);
            }
            // Build up row used for padding.
            var buildPadRow = _this.tokens.pad.repeat(config.width);
            // Inspect if pad row requires borders.
            if (_this.border && config.borders !== false) {
                if (k === firstKey)
                    buildPadRow = vertBdr + buildPadRow;
                if (k === lastKey)
                    buildPadRow += vertBdr;
                resultPad.push(buildPadRow);
            }
            // Iterate each line building borders and padding.
            config.textArray.forEach(function (line, index) {
                if (config.shift)
                    line = _this.shiftLine(line, config.align);
                if (config.padding)
                    line = _this.tokens.pad.repeat(config.padding[1]) + line + _this.tokens.pad.repeat(config.padding[3]);
                if (config.indent)
                    line = _this.tokens.indent.repeat(config.indent) + line;
                line = config.align ? alignMap[config.align](line, config.width, _this.tokens.align) : line;
                if (_this.border && config.borders !== false) {
                    var vertical = _this.border.vertical;
                    if (_this.options.borderColor)
                        vertical = _this.colurs.applyAnsi(vertical, _this.options.borderColor);
                    if (k === firstKey)
                        line = vertical + line;
                    if (k === lastKey)
                        line += vertical;
                }
                map[index] = map[index] || [];
                map[index] = map[index].concat([line]);
            });
        });
        for (var i in map) {
            var row = map[i];
            result.push(row.join(gutterStr));
        }
        var padRow = resultPad.length ? resultPad.join(gutterStr) : '';
        return {
            row: result.join('\n'),
            padRow: padRow
        };
    };
    Tablur.prototype.row = function (text, width, align, padding) {
        var self = this;
        var normalized = this.normalize(text, width, align, padding);
        this.rows.push(normalized);
        return this;
    };
    Tablur.prototype.section = function (text, align, padding) {
        var obj = text;
        if (chek_1.isNumber(align) || Array.isArray(align)) {
            padding = align;
            align = undefined;
        }
        if (chek_1.isNumber(padding))
            padding = [padding, padding, padding, padding];
        align = align || 'left';
        padding = padding || seedArray(4, 0);
        if (!chek_1.isObject(text)) {
            obj = {
                text: text,
                align: align
            };
            obj.padding = padding;
        }
        obj.align = obj.align || align;
        obj.padding = toPadding(obj.padding);
        obj.isSection = true;
        obj.borders = !chek_1.isValue(obj.borders) ? false : obj.borders;
        // if (obj.borders && !obj.align)
        //   obj.align = 'left';
        this.rows.push([obj]);
        return this;
    };
    Tablur.prototype.repeat = function (text, align, padding) {
        var obj = text;
        if (chek_1.isNumber(align) || Array.isArray(align)) {
            padding = align;
            align = undefined;
        }
        if (chek_1.isNumber(padding))
            padding = [padding, padding, padding, padding];
        align = align || 'left';
        padding = padding || seedArray(4, 0);
        if (!chek_1.isObject(text)) {
            obj = {
                text: text,
                align: align
            };
            obj.padding = padding;
        }
        obj.shift = false;
        obj.padding = toPadding(obj.padding);
        obj.isRepeat = true;
        obj.borders = !chek_1.isValue(obj.borders) ? false : obj.borders;
        this.rows.push([obj]);
        return this;
    };
    Tablur.prototype.break = function () {
        this.rows.push([{
                text: '',
                indent: 0,
                borders: false,
                shift: false,
                padding: [0, 0, 0, 0]
            }]);
        return this;
    };
    Tablur.prototype.build = function (rows, width) {
        var _this = this;
        if (chek_1.isNumber(rows)) {
            width = rows;
            rows = undefined;
        }
        rows = rows || this.rows;
        var _rows = rows;
        if (!Array.isArray(rows[0]))
            _rows = [_rows];
        var max = this.getMaxRow(_rows);
        var maxWidth = width || max.width;
        var borders = this.getBorders(maxWidth, this.options.border);
        var columnized = _rows.reduce(function (a, c, i) {
            var hasBorders = borders && c[0].borders !== false;
            var padTop = c[0].padding[0];
            var padBtm = c[0].padding[2];
            var renderedCol = _this.columnize(c, maxWidth, max.columns);
            var arr = [];
            if (hasBorders && i === 0)
                arr.push(borders.top);
            if (padTop) {
                arr = arr.concat(seedArray(padTop, renderedCol.padRow));
            }
            arr.push(renderedCol.row);
            if (padBtm) {
                arr = arr.concat(seedArray(padBtm, renderedCol.padRow));
            }
            var curr = c[0];
            var prev = (_rows[i - 1] && _rows[i - 1][0]) || {};
            var next = (_rows[i + 1] && _rows[i + 1][0]) || {};
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
            return a.concat(arr);
        }, []);
        return columnized;
    };
    Tablur.prototype.toString = function () {
        var width = toContentWidth(this.options.width);
        return this.build(width).join('\n');
    };
    Tablur.prototype.render = function (wrap) {
        var str = this.toString();
        if (wrap)
            str = '\n' + str + '\n';
        this.options.stream.write(str + '\n');
        return this;
    };
    Tablur.prototype.clear = function () {
        this.rows = [];
        return this;
    };
    Tablur.prototype.reset = function (options, debug) {
        options = options || this.options;
        this
            .clear()
            .init(options, debug);
        return this;
    };
    return Tablur;
}());
exports.Tablur = Tablur;
//# sourceMappingURL=tablur.js.map