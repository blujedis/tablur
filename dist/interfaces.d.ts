/// <reference types="node" />
export declare type TablurAlign = 'left' | 'right' | 'center' | 'none';
export declare type TablurStringLength = (str: string) => number;
export declare type TablurBorder = keyof ITablurBorders;
export declare type TablurPadding = number | [number, number, number, number];
export declare type TablurBorderColor = 'red' | 'green' | 'blue' | 'yellow' | 'cyan' | 'magenta' | 'black' | 'gray' | 'redBright' | 'greenBright' | 'blueBright' | 'cyanBright' | 'yellowBright' | 'magentaBright';
export declare type TablurType = string | number | boolean | RegExp | Date | object;
export interface ITablurBorder {
    topLeft: string;
    topRight: string;
    bottomLeft: string;
    bottomRight: string;
    horizontal: string;
    vertical: string;
}
export interface ITablurBorders {
    single: ITablurBorder;
    double: ITablurBorder;
    round: ITablurBorder;
    singleDouble: ITablurBorder;
    doubleSingle: ITablurBorder;
    classic: ITablurBorder;
}
export interface ITablurColumnBase {
    width?: number;
    align?: string;
    padding?: [number, number, number, number];
    indent?: number;
    shift?: boolean;
    borders?: boolean;
}
export interface ITablurColumnGlobal extends ITablurColumnBase {
}
export interface ITablurColumn extends ITablurColumnBase {
    text: any;
    isRepeat?: boolean;
    isRow?: boolean;
    isSection?: boolean;
}
export interface ITablurColumnInternal extends ITablurColumn {
    padRow: string;
}
export interface ITablurTokens {
    pad: string;
    align: string;
    indent: string;
    shift: string;
}
export interface ITablurOptions {
    stream?: NodeJS.WritableStream;
    width?: number;
    justify?: boolean;
    gutter?: number;
    shift?: boolean;
    padding?: TablurPadding;
    border?: TablurBorder;
    borderColor?: TablurBorderColor;
    colorize?: boolean;
    stringLength?: TablurStringLength;
}
