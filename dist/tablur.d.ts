/// <reference types="node" />
import { IAnsiStyles } from 'colurs';
import { ITablurOptions, ITablurColumnInternal, TablurAlign, TablurBorder, ITablurColumn, ITablurConfig, TablurColor, ITablurOptionsBase } from './interfaces';
export declare const TABLER_BORDERS: {
    'single': {
        'topLeft': string;
        'topRight': string;
        'bottomRight': string;
        'bottomLeft': string;
        'vertical': string;
        'horizontal': string;
    };
    'double': {
        'topLeft': string;
        'topRight': string;
        'bottomRight': string;
        'bottomLeft': string;
        'vertical': string;
        'horizontal': string;
    };
    'round': {
        'topLeft': string;
        'topRight': string;
        'bottomRight': string;
        'bottomLeft': string;
        'vertical': string;
        'horizontal': string;
    };
    'single-double': {
        'topLeft': string;
        'topRight': string;
        'bottomRight': string;
        'bottomLeft': string;
        'vertical': string;
        'horizontal': string;
    };
    'double-single': {
        'topLeft': string;
        'topRight': string;
        'bottomRight': string;
        'bottomLeft': string;
        'vertical': string;
        'horizontal': string;
    };
    'classic': {
        'topLeft': string;
        'topRight': string;
        'bottomRight': string;
        'bottomLeft': string;
        'vertical': string;
        'horizontal': string;
    };
};
export declare class Tablur {
    private _rows;
    private _header;
    private _footer;
    private _indexed;
    options: ITablurOptions;
    constructor(options?: ITablurOptions);
    private init;
    /**
     * Gets the size of the terminal columns and rows.
     */
    readonly size: {
        columns: number;
        rows: number;
    };
    protected sum(nums: number[]): number;
    protected isBaseOptions(obj: any): number | false;
    protected findIndices(str: string, char: string): any[];
    protected pad(str: string, width: number, align?: TablurAlign): string;
    protected truncate(str: string, len: number): string;
    protected fillArray(count: number, val?: any): any[];
    protected toPercentage(num: number, of?: number, places?: number): number;
    protected horizontalFill(width: number, char: string, endcap?: string, offset?: number): string;
    protected toArray(val: any, def?: any[]): any[];
    protected layoutWidth(width?: number): number;
    protected toColumn(col: string | ITablurColumnInternal): ITablurColumnInternal;
    private columnCounts;
    private calculateOffset;
    private buildRow;
    private renderColumnsAdjust;
    private renderHeader;
    private renderFooter;
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
    protected wrap(width: number, fill: number, border?: TablurBorder, indices?: number[]): {
        top: string;
        bottom: string;
        fill: any;
    };
    /**
     *
     * @param str a string to be colorized.
     * @param styles
     */
    colorize(str: string, styles?: TablurColor | IAnsiStyles | IAnsiStyles[]): string;
    /**
     * Add header row with alignment.
     *
     * @example .header('My Header', TablerAlign.center);
     *
     * @param text header column text.
     * @param align column alignment.
     */
    header(text: string, align?: TablurAlign): Tablur;
    /**
     * Add header row with options.
     *
     * @example .header({ text: 'copyright 2018' }, { option overrides });
     *
     * @param col header column title or configuration object.
     * @param options options used to override inherited defaults.
     */
    header(col: string | ITablurColumn, options?: ITablurOptionsBase): Tablur;
    /**
     * Add header row with options.
     *
     * @example .header('Column 1', 'Column 2'..., { option overrides });
     *
     * @param col1 header column title or configuration object.
     * @param col2 header column title or configuration object.
     * @param options options used to override inherited defaults.
     */
    header(col1: string | ITablurColumn, col2: string | ITablurColumn, options?: ITablurOptionsBase): Tablur;
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
    header(col1: string | ITablurColumn, col2: string | ITablurColumn, col3: string | ITablurColumn, options?: ITablurOptionsBase): Tablur;
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
    header(col1: string | ITablurColumn, col2: string | ITablurColumn, col3: string | ITablurColumn, col4: string | ITablurColumn, options?: ITablurOptionsBase): Tablur;
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
    header(col1: string | ITablurColumn, col2: string | ITablurColumn, col3: string | ITablurColumn, col4: string | ITablurColumn, col5: string | ITablurColumn, options?: ITablurOptionsBase): Tablur;
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
    header(col1: string | ITablurColumn, col2: string | ITablurColumn, col3: string | ITablurColumn, col4: string | ITablurColumn, col5: string | ITablurColumn, col6: string | ITablurColumn, options?: ITablurOptionsBase): Tablur;
    /**
     * Add header using columns.
     *
     * @param cols the header's columns.
     */
    header(...cols: (string | ITablurColumn)[]): Tablur;
    /**
     * Add footer row with alignment.
     *
     * @example .footer('copyright 2018', TablerAlign.center);
     *
     * @param text footer column text.
     * @param align column alignment.
     */
    footer(text: string, align?: TablurAlign): Tablur;
    /**
     * Add footer row with options.
     *
     * @example .footer({ text: 'copyright 2018' }, { option overrides });
     *
     * @param col footer column title or configuration object.
     * @param options options used to override inherited defaults.
     */
    footer(col: string | ITablurColumn, options?: ITablurOptionsBase): Tablur;
    /**
     * Add footer row with options.
     *
     * @example .footer('Column 1', 'Column 2'..., { option overrides });
     *
     * @param col1 footer column title or configuration object.
     * @param col2 footer column title or configuration object.
     * @param options options used to override inherited defaults.
     */
    footer(col1: string | ITablurColumn, col2: string | ITablurColumn, options?: ITablurOptionsBase): Tablur;
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
    footer(col1: string | ITablurColumn, col2: string | ITablurColumn, col3: string | ITablurColumn, options?: ITablurOptionsBase): Tablur;
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
    footer(col1: string | ITablurColumn, col2: string | ITablurColumn, col3: string | ITablurColumn, col4: string | ITablurColumn, options?: ITablurOptionsBase): Tablur;
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
    footer(col1: string | ITablurColumn, col2: string | ITablurColumn, col3: string | ITablurColumn, col4: string | ITablurColumn, col5: string | ITablurColumn, options?: ITablurOptionsBase): Tablur;
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
    footer(col1: string | ITablurColumn, col2: string | ITablurColumn, col3: string | ITablurColumn, col4: string | ITablurColumn, col5: string | ITablurColumn, col6: string | ITablurColumn, options?: ITablurOptionsBase): Tablur;
    /**
     * Add footer using columns.
     *
     * @param cols the footer's columns.
     */
    footer(...cols: (string | ITablurColumn | ITablurOptionsBase)[]): Tablur;
    /**
     * Adds a new row to the instance.
     *
     * @example .row('column 1', { text: 'column 2' });
     *
     * @param cols the columns of the row to be added.
     */
    row(...cols: (string | ITablurColumn)[]): this;
    /**
     * Adds multiple rows containing table columns.
     *
     * @example .rows([ ['row1-col1], [{ text: 'row2-col1 }] ]);
     *
     * @param rows the rows of table columns to add.
     */
    rows(rows: (string | ITablurColumn)[][]): this;
    /**
     * Creates an empty break in the table.
     *
     * @example .break();
     */
    break(): this;
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
    /**
     * Configures rows for output adjusting and normalizing cells.
     *
     * @example .configure({ // optional parent config });
     *
     * @param config optional parent configuration to override with.
     */
    configure(config?: ITablurConfig): ITablurConfig;
    /**
     * Render the rows into array of strings.
     *
     * @example .render({ // optional parent config });
     *
     * @param pconfig the parent's parsed column metadata.
     */
    render(pconfig?: ITablurConfig): string[];
    toString(): string;
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
    write(wrap?: string | NodeJS.WritableStream, stream?: NodeJS.WritableStream): void;
    /**
     * Clears all current rows.
     */
    clear(): this;
    /**
     * Reset all rows and options.
     *
     * @param options pass new options.
     */
    reset(options?: ITablurOptions): this;
}
