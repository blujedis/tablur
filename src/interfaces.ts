
import { Colurs, IAnsiStyles, IColurs } from 'colurs';
import { Tablur } from './tablur';

export type TablurAlign = 'left' | 'right' | 'center' | 'none';
export type TablurStringLength = (str: string) => number;
export type TablurBorder = keyof ITablurBorders;
export type TablurPadding = number | [number, number, number, number];

export type TablurBorderColor = 'red' | 'green' | 'blue' | 'yellow' | 'cyan' | 'magenta' | 'black' |
  'gray' | 'redBright' | 'greenBright' | 'blueBright' | 'cyanBright' | 'yellowBright' | 'magentaBright';

export type TablurType = string | number | boolean | RegExp | Date | object;

// INTERFACES //

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

export interface ITablurColumnGlobal extends ITablurColumnBase { }

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
  width?: number; // if 0 auto width of terminal.
  justify?: boolean;  // rows without width justified.
  gutter?: number; // number of spaces between columns.
  shift?: boolean;
  padding?: TablurPadding;
  border?: TablurBorder;
  borderColor?: TablurBorderColor;
  colorize?: boolean;
  stringLength?: TablurStringLength;
}

