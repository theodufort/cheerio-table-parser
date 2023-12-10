export interface SpanConfig {
  tag: string;
  defaultValue: number;
  min: number;
  max: number;
}

export interface Config {
  cellSelector: string;
  rowSelector: string;
  col: SpanConfig;
  row: SpanConfig;
}

export const defaultConfig: Config = {
  cellSelector: "td, th",
  rowSelector: "tr",
  col: {
    tag: "colspan",
    defaultValue: 1,
    min: 1,
    max: 1000
  },
  row: {
    tag: "rowspan",
    defaultValue: 1,
    min: 0,
    max: 65534
  }
};
