
export enum TablurBorder {
  single = 'single',
  double = 'double',
  round = 'round',
  single_double = 'single-double',
  double_single = 'double-single',
  classic = 'classic'
}

export enum TablurAlign {
  left = 'left',
  right = 'right',
  center = 'center'
}

export enum TablurScheme {
  wrap = 'wrap',
  truncate = 'truncate',
  none = 'none'
}

export interface ITablurMap<T> {
  [key: string]: T;
}

export interface ITablurBorder {
  topLeft: string;
  topRight: string;
  bottomLeft: string;
  bottomRight: string;
  horizontal: string;
  vertical: string;
}

export interface ITablurColumn {
  text?: string;
  align?: TablurAlign;
  size?: number;
  configure?: boolean;
}

export interface ITablurColumnInternal extends ITablurColumn {
  length?: number;
  lines?: string[];
  adjusted?: number;
}

export interface ITablurConfig {
  columns?: number[];
  total?: number;
  layout?: number;
  adjustedLayout?: number;
  adjustment?: number;
  remainder?: number;
  lines?: { [key: string]: number; };
  rows?: ITablurColumnInternal[][];
}

export enum TablurColor {
  'black' = 'black',
  'red' = 'red',
  'green' = 'green',
  'blue' = 'blue',
  'magenta' = 'magenta',
  'cyan' = 'cyan',
  'gray' = 'gray'
}

export interface ITablurOptionsBase {
  width?: number;
  scheme?: TablurScheme;
  padding?: number;
  aligns?: TablurAlign | TablurAlign[];
  sizes?: number | number[];
  border?: TablurBorder;
  borderColor?: TablurColor;
  colorize?: boolean;
}

export interface ITablurOptions extends ITablurOptionsBase {
  float?: TablurAlign;
  borders?: ITablurMap<ITablurBorder>;
  rows?: string[][] | ITablurColumn[][];
}
