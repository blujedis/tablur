"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ws = require("term-size");
var wrapAnsi = require("wrap-ansi");
var ansiWidth = require("string-width");
var stripAnsi = require("strip-ansi");
var colurs_1 = require("colurs");
var interfaces_1 = require("./interfaces");
var colurs = new colurs_1.Colurs();
var BASE_OPTIONS_KEYS = ['width', 'scheme', 'padding', 'sizes', 'border', 'borderColor'];
exports.TABLER_BORDERS = {
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
var DEFAULTS = {
    width: ws().columns,
    scheme: interfaces_1.TablurScheme.wrap,
    padding: 2,
    sizes: undefined,
    borders: {},
    rows: [] // rows to initialize with.
};
var Tablur = /** @class */ (function () {
    function Tablur(options) {
        this._rows = [];
        this._indexed = {};
        this.options = Object.assign({}, DEFAULTS, options);
        this.init();
    }
    Tablur.prototype.init = function () {
        // Merge in default borders.
        this.options.borders = Object.assign({}, exports.TABLER_BORDERS, this.options.borders);
        // Must have even number for borders.
        if (this.options.border && this.options.padding % 2)
            this.options.padding += 1;
        // Set colorization.
        colurs.setOption('enabled', this.options.colorize);
        // Add rows that were passed in init.
        this.rows(this.options.rows);
    };
    Object.defineProperty(Tablur.prototype, "size", {
        // HELPERS //
        /**
         * Gets the size of the terminal columns and rows.
         */
        get: function () {
            return ws();
        },
        enumerable: true,
        configurable: true
    });
    Tablur.prototype.sum = function (nums) {
        return nums.reduce(function (a, c) { return a += c; });
    };
    Tablur.prototype.isBaseOptions = function (obj) {
        if (typeof obj !== 'object')
            return false;
        var baseKey = Object.keys(obj)[0];
        return ~BASE_OPTIONS_KEYS.indexOf(baseKey);
    };
    Tablur.prototype.findIndices = function (str, char) {
        var arr = [];
        var row = stripAnsi(str);
        for (var i = 0; i < row.length; i++)
            if (row[i] === char)
                arr.push(i);
        return arr;
    };
    Tablur.prototype.pad = function (str, width, align) {
        if (align === void 0) { align = interfaces_1.TablurAlign.left; }
        var adj = Math.max(0, width - ansiWidth(str));
        var rem = '';
        var pad = ' '.repeat(adj);
        // adjust pad if centering is required.
        if (align === interfaces_1.TablurAlign.center) {
            rem = ' '.repeat(Math.max(0, adj % 2));
            adj = (adj / 2);
            pad = ' '.repeat(adj);
            var x = (pad + str + pad + rem).length;
            return pad + str + pad + rem;
        }
        if (align === interfaces_1.TablurAlign.right)
            return pad + str;
        return str + pad;
    };
    Tablur.prototype.truncate = function (str, len) {
        return str.slice(0, len - 3) + '...';
    };
    Tablur.prototype.fillArray = function (count, val) {
        if (val === void 0) { val = ''; }
        return Array.from(new Array(Math.ceil(count)), function (__) { return val; });
    };
    Tablur.prototype.toPercentage = function (num, of, places) {
        if (of === void 0) { of = 100; }
        // check if is decimal using modulous.
        num = num % 1 !== 0 ? num * of : num;
        // to fixed if decimal places.
        return places >= 0 ? parseFloat((num / of).toFixed(places)) : num / of;
    };
    Tablur.prototype.horizontalFill = function (width, char, endcap, offset) {
        if (offset === void 0) { offset = 0; }
        width = endcap ? (width - 2) + offset : width + offset;
        var horiz = char.repeat(width);
        if (endcap)
            return endcap + horiz + endcap;
        return horiz;
    };
    Tablur.prototype.toArray = function (val, def) {
        if (def === void 0) { def = []; }
        if (typeof val === undefined)
            return def;
        if (Array.isArray(val))
            return val;
        return [val];
    };
    // COLUMNS & LAYOUT //
    Tablur.prototype.layoutWidth = function (width) {
        return width || this.options.width || this.size.columns;
    };
    Tablur.prototype.toColumn = function (col) {
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
    };
    Tablur.prototype.columnCounts = function (rows) {
        return (rows || this._rows).reduce(function (a, r, i) {
            var total = 0;
            r.forEach(function (v, n) {
                if (!v.configure)
                    return;
                a.columns[n] = Math.max(v.adjusted, a.columns[n] || 0, 0);
                total += a.columns[n];
            });
            a.total = Math.max(total, a.total);
            return a;
        }, { columns: [], total: 0 });
    };
    Tablur.prototype.calculateOffset = function (columns, padding, border) {
        return Math.max(0, !border
            ? (columns - 1) * padding
            : ((columns + 1) * padding) + (columns + 1));
    };
    Tablur.prototype.buildRow = function () {
        var _this = this;
        var cols = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            cols[_i] = arguments[_i];
        }
        var sizes = this.toArray(this.options.sizes);
        var aligns = this.toArray(this.options.aligns);
        return cols.map(function (c, i) {
            c = _this.toColumn(c);
            if (c.configure) { // ignore non configurable columns like sections & breaks.
                var size = sizes[i] || sizes[0] || 0;
                c.adjusted = Math.max(c.adjusted, size);
                var align = aligns[i] || aligns[0] || interfaces_1.TablurAlign.left;
                c.align = c.align || align;
            }
            return c;
        });
    };
    // RENDERING & CONFIGURATION //
    Tablur.prototype.renderColumnsAdjust = function (pconfig, config) {
        var _this = this;
        // If the same number of columns just match column widths.
        if (pconfig.columns.length === config.columns.length) {
            var cols = void 0;
            // Get the optimal widths based on main table
            // width divided by the footer's column count.
            var colWidths = Math.floor(config.total / pconfig.columns.length);
            // Get the remainder if any.
            var colRem = config.total % pconfig.columns.length;
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
            pconfig.columns = pconfig.columns.map(function (v) { return Math.floor(_this.toPercentage(v, pconfig.total) * config.total); });
            // We need to ensure the columns are the same total length.
            var adjusted = Math.max(0, config.total - this.sum(pconfig.columns));
            // Add any adjustment so our totals match.
            pconfig.columns[pconfig.columns.length - 1] = pconfig.columns[pconfig.columns.length - 1] + adjusted;
        }
        pconfig.total = config.total;
        pconfig.adjustedLayout = config.adjustedLayout;
        pconfig.layout = config.layout;
        pconfig.adjustment = config.adjustment;
        pconfig.remainder = config.remainder;
        return pconfig;
    };
    Tablur.prototype.renderHeader = function (rows, config) {
        var pconfig = this.renderColumnsAdjust(this._header.columnCounts(), config);
        var bdr = this.options.borders[this.options.border];
        var header = this._header.render(pconfig);
        var fillCount = Math.round(this._header.options.padding / 2);
        var boxFill = this.wrap(config.layout, fillCount, this.options.border);
        var isNextBreak = this._indexed[0];
        if (this._header.options.border) {
            var btmBorder = [this.horizontalFill(config.layout, bdr.horizontal, bdr.vertical)];
            if (!isNextBreak)
                header = header.slice(0, header.length - 1);
            else
                btmBorder = [];
            header = header.concat(btmBorder);
        }
        else {
            header = header.concat(boxFill.fill, [boxFill.top]);
        }
        // Add the header to the rows.
        return header.concat(rows);
    };
    Tablur.prototype.renderFooter = function (rows, config) {
        // Parse the footer columns.
        var pconfig = this.renderColumnsAdjust(this._footer.columnCounts(), config);
        var bdr = this.options.borders[this.options.border];
        var fillCount = Math.round(this._footer.options.padding / 2);
        var boxFill = this.wrap(config.layout, fillCount, this.options.border);
        var isPrevBreak = this._indexed[this._rows.length - 1];
        var footer = this._footer.render(pconfig);
        if (this._footer.options.border) {
            var topBorder = [this.horizontalFill(config.layout, bdr.horizontal, bdr.vertical)];
            if (!isPrevBreak)
                footer = footer.slice(1);
            else
                topBorder = [];
            footer = topBorder.concat(footer);
        }
        else {
            footer = [boxFill.bottom].concat(boxFill.fill, footer, boxFill.fill);
        }
        return rows.concat(footer);
    };
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
    Tablur.prototype.wrap = function (width, fill, border, indices) {
        var bdr = this.options.borders[border];
        bdr = bdr || {
            topLeft: '',
            topRight: '',
            bottomLeft: '',
            bottomRight: '',
            horizontal: '',
            vertical: ''
        };
        var baseFill = this.horizontalFill(width, bdr.horizontal, null, -2);
        var horizFill = this.horizontalFill(width, ' ', bdr.vertical);
        if (indices && indices.length) {
            indices.forEach(function (v) {
                horizFill = horizFill.slice(0, v) + bdr.vertical + horizFill.slice(v + 1);
            });
        }
        horizFill = this.fillArray(fill, horizFill);
        return {
            top: bdr.topLeft + baseFill + bdr.topRight,
            bottom: bdr.bottomLeft + baseFill + bdr.bottomRight,
            fill: horizFill
        };
    };
    // API //
    /**
     *
     * @param str a string to be colorized.
     * @param styles
     */
    Tablur.prototype.colorize = function (str, styles) {
        styles = styles || this.options.borderColor;
        if (!styles)
            return str;
        if (!Array.isArray(styles))
            styles = [styles];
        return colurs.applyAnsi(str, styles);
    };
    Tablur.prototype.header = function () {
        var _this = this;
        var cols = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            cols[_i] = arguments[_i];
        }
        var _a;
        var options = {};
        // Check if options object.
        if (this.isBaseOptions(cols[cols.length - 1])) {
            options = cols[cols.length - 1];
            cols = cols.slice(0, cols.length - 2);
        }
        var align;
        if (interfaces_1.TablurAlign[cols[1]]) {
            align = cols[1];
            cols = cols.slice(0, 1).concat(cols.slice(2));
            if (typeof cols[0] === 'string') {
                cols[0] = {
                    text: cols[0],
                    align: align
                };
            }
        }
        options = Object.assign({}, this.options, options);
        this._header = new Tablur(options);
        (_a = this._header).row.apply(_a, cols.map(function (n) { return _this.toColumn(n); }));
        return this;
    };
    Tablur.prototype.footer = function () {
        var _this = this;
        var cols = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            cols[_i] = arguments[_i];
        }
        var _a;
        var options = {};
        // Check if options object.
        if (this.isBaseOptions(cols[cols.length - 1])) {
            options = cols[cols.length - 1];
            cols = cols.slice(0, cols.length - 2);
        }
        var align;
        if (interfaces_1.TablurAlign[cols[1]]) {
            align = cols[1];
            cols = cols.slice(0, 1).concat(cols.slice(2));
            if (typeof cols[0] === 'string') {
                cols[0] = {
                    text: cols[0],
                    align: align
                };
            }
        }
        options = Object.assign({}, this.options, options);
        this._footer = new Tablur(options);
        (_a = this._footer).row.apply(_a, cols.map(function (n) { return _this.toColumn(n); }));
        return this;
    };
    /**
     * Adds a new row to the instance.
     *
     * @example .row('column 1', { text: 'column 2' });
     *
     * @param cols the columns of the row to be added.
     */
    Tablur.prototype.row = function () {
        var cols = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            cols[_i] = arguments[_i];
        }
        if (!cols.length)
            return;
        this._rows = this._rows.concat([this.buildRow.apply(this, cols)]);
        return this;
    };
    /**
     * Adds multiple rows containing table columns.
     *
     * @example .rows([ ['row1-col1], [{ text: 'row2-col1 }] ]);
     *
     * @param rows the rows of table columns to add.
     */
    Tablur.prototype.rows = function (rows) {
        var _this = this;
        rows.forEach(function (v) { return _this.row.apply(_this, v); });
        return this;
    };
    /**
     * Creates an empty break in the table.
     *
     * @example .break();
     */
    Tablur.prototype.break = function () {
        this._indexed[this._rows.length] = 1;
        this.row({ text: '', configure: false });
        return this;
    };
    Tablur.prototype.section = function (name, align) {
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
    };
    /**
     * Configures rows for output adjusting and normalizing cells.
     *
     * @example .configure({ // optional parent config });
     *
     * @param config optional parent configuration to override with.
     */
    Tablur.prototype.configure = function (config) {
        var _this = this;
        // Get layout width and get max columns and adjusted widths.
        var layoutWidth = this.layoutWidth();
        config = config || this.columnCounts(this._rows);
        config.layout = layoutWidth;
        config.lines = {};
        var colCount = config.columns.length;
        var offset = this.calculateOffset(colCount, this.options.padding, !!this.options.border);
        config.adjustedLayout = (layoutWidth - offset);
        var adjTotal = config.total, adjWidth = config.adjustedLayout, adjNeg = true;
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
        this._rows = config.rows = this._rows.map(function (row, i) {
            // Ensure same length of columns
            // unless empty or section header.
            if (row.length < colCount && row[0].configure) {
                row = row.concat(_this.fillArray(colCount - row.length, { text: '', width: 0, length: 0, adjusted: 0 }));
            }
            var remainder = Math.abs(config.remainder);
            var decrementer = Math.ceil(remainder / colCount);
            return row.reduce(function (accum, col, n) {
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
                    if (_this.options.border)
                        col.adjusted -= 2; // add a tiny bit of extra padding.
                }
                // Text too long should be wrapped to next line.
                if (_this.options.scheme === interfaces_1.TablurScheme.wrap && col.length > col.adjusted)
                    col.text = wrapAnsi(col.text, col.adjusted, { hard: true });
                // overlengthed text should be truncated.
                else if (_this.options.scheme === interfaces_1.TablurScheme.truncate)
                    col.text = _this.truncate(col.text, col.adjusted);
                // Split text into lines.
                col.lines = col.text.split('\n');
                // Update the line count.
                config.lines[i] = Math.max(config.lines[i] || 0, col.lines.length);
                accum = accum.concat([col]);
                return accum;
            }, []);
        }, this);
        return config;
    };
    /**
     * Render the rows into array of strings.
     *
     * @example .render({ // optional parent config });
     *
     * @param pconfig the parent's parsed column metadata.
     */
    Tablur.prototype.render = function (pconfig) {
        var _this = this;
        if (!this._rows.length)
            return [];
        var config = this.configure(pconfig);
        var options = this.options;
        var padding = options.padding ? ' '.repeat(options.padding) : '';
        var joinGutter = padding;
        var border = options.borders[options.border];
        // let actualWidth;
        if (border) {
            var borderGutterRepeat = Math.max(0, options.padding / 2);
            var borderGutter = options.padding && borderGutterRepeat
                ? ' '.repeat(borderGutterRepeat)
                : '';
            joinGutter = borderGutter + border.vertical + borderGutter;
        }
        // Iterate rows building lines.
        var rows = config.rows.reduce(function (a, c, i) {
            return a.concat([c.reduce(function (res, col, n) {
                    // Ensure same line count when multiline wrap.
                    if (col.lines.length < config.lines[i] && col.configure)
                        col.lines = col.lines.concat(_this.fillArray(config.lines[i] - col.lines.length));
                    // Map wrapped multilines to correct row/col.
                    col.lines.forEach(function (l, x) {
                        res[x] = res[x] || [];
                        var val = _this.pad(l, col.adjusted, col.align);
                        var colLen = config.columns.length;
                        // Handled bordered tables.
                        if (border && col.configure && (n === 0 || n === (colLen - 1))) {
                            res[x][n] = n !== 0
                                ? val + padding + border.vertical
                                : colLen === 1
                                    ? border.vertical + padding + val + padding + border.vertical
                                    : border.vertical + padding + val;
                        }
                        else if (!col.configure) {
                            var pad = _this.options.border ? ' ' : '';
                            res[x][n] = pad + val + pad;
                        }
                        // Non bordered table.
                        else {
                            res[x][n] = val;
                        }
                    });
                    return res;
                }, []).map(function (c) { return c.join(joinGutter); }).join('\n')]);
        }, []);
        var horizBorderRow;
        var fillPad = Math.round(options.padding / 2);
        if (border) {
            horizBorderRow = this.horizontalFill(config.layout, border.horizontal, border.vertical);
            var boxWrap_1 = this.wrap(config.layout, fillPad, options.border, this.findIndices(stripAnsi(rows[0].split('\n')[0]), border.vertical));
            // Override fill if not greater than 1.
            if (!(fillPad > 1))
                boxWrap_1.fill = [];
            var rowFill_1 = boxWrap_1.fill.concat([horizBorderRow], boxWrap_1.fill);
            rows = rows.reduce(function (a, c, i, arr) {
                var curFill = rowFill_1;
                if (_this._indexed[i] > 0) {
                    if (_this._indexed[i + 1])
                        curFill = [];
                    else
                        curFill = [boxWrap_1.top].concat(boxWrap_1.fill);
                }
                else if (arr[i + 1] && _this._indexed[i + 1] > 0)
                    curFill = boxWrap_1.fill.concat([boxWrap_1.bottom]);
                if (i !== rows.length - 1)
                    a = a.concat([c], curFill);
                else
                    a = a.concat([c], boxWrap_1.fill);
                return a;
            }, boxWrap_1.fill.slice());
            if (!this._header && !this._indexed[0])
                rows = [boxWrap_1.top].concat(rows);
            if (!this._footer && !this._indexed[rows.length - 1])
                rows = rows.concat([boxWrap_1.bottom]);
        }
        else {
            var rowFill_2 = this.fillArray(fillPad, this.horizontalFill(config.layout, ' '));
            rows = rows.reduce(function (a, c, i, arr) {
                var curFill = rowFill_2;
                if (_this._indexed[i] > 0)
                    curFill = [];
                else if (arr[i + 1] && _this._indexed[i + 1] > 0)
                    curFill = rowFill_2[0] || [];
                if (i !== rows.length - 1)
                    a = a.concat([c], curFill);
                else
                    a = a.concat([c]);
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
    };
    Tablur.prototype.toString = function () {
        return this.render().join('\n');
    };
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
    Tablur.prototype.write = function (wrap, stream) {
        var _this = this;
        if (wrap === void 0) { wrap = ' '; }
        if (stream === void 0) { stream = process.stdout; }
        if (!this._rows.length)
            return;
        var rendered = this.render();
        if (typeof wrap === 'object') {
            stream = wrap;
            wrap = undefined;
        }
        wrap = '';
        if (wrap) {
            var len = stripAnsi(rendered[0]).length;
            var isNewLine = /[\n]/.test(wrap);
            // Don't repeat simple new lines.
            if (wrap === '' || /[\n]/.test(wrap)) {
                rendered = [''].concat(rendered, ['']);
            }
            // Repeat the provided string.
            else if (wrap && typeof wrap === 'string') {
                wrap = wrap.repeat(len);
                rendered = [wrap].concat(rendered, [wrap]);
            }
        }
        var result = rendered.join('\n');
        var border = this.options.borders[this.options.border];
        var borders;
        if (border && this.options.borderColor) {
            borders = Object.keys(this.options.borders[this.options.border]).map(function (k) { return exports.TABLER_BORDERS.round[k]; }).join('|');
            result = result.replace(new RegExp('(' + borders + ')', 'g'), function (s) { return _this.colorize(s, _this.options.borderColor); });
        }
        stream.write(result + '\n');
    };
    /**
     * Clears all current rows.
     */
    Tablur.prototype.clear = function () {
        this._rows = [];
        return this;
    };
    /**
     * Reset all rows and options.
     *
     * @param options pass new options.
     */
    Tablur.prototype.reset = function (options) {
        this.clear();
        this.options = Object.assign({}, DEFAULTS, options);
        this._header = undefined;
        this._footer = undefined;
        this.init();
        return this;
    };
    return Tablur;
}());
exports.Tablur = Tablur;
//# sourceMappingURL=tablur.js.map