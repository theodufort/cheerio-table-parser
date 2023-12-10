import cheerio from "cheerio";
import { isInteger } from "lodash";
import { Element } from "domhandler";

import { Config, SpanConfig } from "./config";

export const parseIntOrDefault = (
  value: string | undefined,
  defaultValue: number
): number => {
  if (!value) {
    return defaultValue;
  }
  const parsed = parseInt(value);
  return !isInteger(parsed) ? defaultValue : parsed;
};

const getSpan = (element: Element, config: SpanConfig): number => {
  const { tag, defaultValue, min, max } = config;
  const attr = cheerio(element).attr(tag);
  const attrValue = parseIntOrDefault(attr, defaultValue);
  return attrValue >= min && attrValue <= max ? attrValue : defaultValue;
};

export const getColSpan = (element: Element, config: Config): number =>
  getSpan(element, config.col);

export const getRowSpan = (element: Element, config: Config): number =>
  getSpan(element, config.row);

export const create2dArrays = <T>(
  row: number,
  col: number,
  generator: (value: undefined, index: number) => T
): T[][] =>
  Array.from({ length: row }, () => Array.from({ length: col }, generator));

export const selectCells = (row: Element, config: Config): Element[] =>
  cheerio(config.cellSelector, row).toArray();

export const selectRows = (table: Element, config: Config): Element[] =>
  cheerio(config.rowSelector, table).toArray();

export const findLastContinueIndex = <T>(
  array: T[],
  equalFn: (value: T) => boolean
): number => {
  let index = -1;
  for (let i = array.length - 1; i >= 0; i--) {
    if (!equalFn(array[i])) {
      break;
    }
    index = i;
  }
  return index;
};
