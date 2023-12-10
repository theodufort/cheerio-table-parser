import _ from "lodash";
import { Element } from "domhandler";

import { Config, defaultConfig } from "./config";
import {
  create2dArrays,
  findLastContinueIndex,
  getColSpan,
  getRowSpan,
  selectCells,
  selectRows
} from "./func";

type RowColSpan = {
  // Remaining row count to span the column
  rowSpan: number;
  colSpan: number;
};

const findMaxColumn = (rows: Element[], config: Config): number => {
  let maxColumns = 0;
  let spanFromPrevRows: RowColSpan[] = [];
  rows.forEach(row => {
    const cells = selectCells(row, config);
    let rowColSpan = 0;
    const newSpanFromPrevRows: RowColSpan[] = [];

    // Sum the colSpan from previous rows.
    spanFromPrevRows.forEach(spanFromPrevRow => {
      const { rowSpan, colSpan } = spanFromPrevRow;
      // rowSpan == 0 means to the end of table
      const newRowSpan = rowSpan > 1 ? rowSpan - 1 : 0;
      rowColSpan += colSpan;
      // If the rowSpan is 1, than its colSpan should not affect next row.
      if (newRowSpan > 1 || newRowSpan === 0) {
        newSpanFromPrevRows.push({ rowSpan: newRowSpan, colSpan });
      }
    });

    // Sum the colSpan from current row.
    cells.forEach(cell => {
      const rowSpan = getRowSpan(cell, config);
      const colSpan = getColSpan(cell, config);
      rowColSpan += colSpan;
      // If the rowSpan is 1, than its colSpan should not affect next row.
      if (rowSpan > 1 || rowSpan === 0) {
        newSpanFromPrevRows.push({ rowSpan, colSpan });
      }
    });

    spanFromPrevRows = newSpanFromPrevRows;
    maxColumns = rowColSpan > maxColumns ? rowColSpan : maxColumns;
  });
  return maxColumns;
};

const findMaxRow = (rows: Element[]): number => rows.length;

const nothing = Symbol("nothing");
const isNothing = (value: any): boolean => value === nothing;

interface UpdateTableOption {
  table: any[][];
  rowLimit: number;
  colSpan: number;
  rowIndex: number;
  realColIndex: number;
  cell: Element;
  parser?: (element: Element) => any;
}
const updateTable = (option: UpdateTableOption): void => {
  const {
    table,
    rowLimit,
    colSpan,
    rowIndex,
    realColIndex,
    parser,
    cell
  } = option;
  for (let j = 0; j < rowLimit; j++) {
    for (let i = 0; i < colSpan; i++) {
      if (!isNothing(table[rowIndex + j][realColIndex + i])) {
        return;
      }
      table[rowIndex + j][realColIndex + i] = parser ? parser(cell) : cell;
    }
  }
};

// Handle overlapping triming
const cleanupNothing = (table: any[][]): any[][] => {
  let lastSymbolCol = -1;
  table.forEach(row => {
    const index = findLastContinueIndex(row, isNothing);
    if (index > lastSymbolCol) {
      lastSymbolCol = index;
    }
  });

  return lastSymbolCol >= 0
    ? table.map(row =>
        row
          .slice(0, lastSymbolCol)
          .map(value => (isNothing(value) ? undefined : value))
      )
    : table;
};

export interface ParseTableOption<T> {
  parser: (element: Element) => T;
  config?: Partial<Config>;
}

type ParseTableFunction = {
  (tableElement: Element, option?: ParseTableOption<Element>): Element[][];
  <T>(tableElement: Element, option?: ParseTableOption<T>): T[][];
};

export const parseTable: ParseTableFunction = (
  tableElement: Element,
  option?: ParseTableOption<any>
) => {
  const { parser, config: userConfig } = option || {};
  const config: Config = _.defaultsDeep(userConfig, defaultConfig);

  const rows = selectRows(tableElement, config);
  const maxColumn = findMaxColumn(rows, config);
  const maxRow = findMaxRow(rows);
  const table = create2dArrays<any>(maxRow, maxColumn, () => nothing);

  rows.forEach((row, rowIndex) => {
    const cells = selectCells(row, config);
    cells.forEach((cell, colIndex) => {
      const tableRow = table[rowIndex];
      let realColIndex = colIndex;
      while (!isNothing(tableRow[realColIndex])) {
        realColIndex++;
      }
      const rowSpan = getRowSpan(cell, config);
      const colSpan = getColSpan(cell, config);

      // If rowSpan > 1, fill X rows
      // If rowSpan == 0, fill until the end
      const rowLimit =
        rowSpan >= 1 ? rowSpan : rowSpan === 0 ? maxRow - rowIndex : -1;
      updateTable({
        table,
        rowLimit,
        colSpan,
        rowIndex,
        realColIndex,
        parser,
        cell
      });
    });
  });
  return cleanupNothing(table);
};
