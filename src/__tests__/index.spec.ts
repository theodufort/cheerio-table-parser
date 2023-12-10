import cheerio from "cheerio";

import { parseTable } from "../index";

const html = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
  </head>
  <body>
    <table id="simple">
      <tr>
        <th>A</th>
        <th>B</th>
        <th>C</th>
        <th>D</th>
        <th>E</th>
      </tr>
      <tr>
        <td>1a</td>
        <td>2a</td>
        <td>3a</td>
        <td>4a</td>
        <td>5a</td>
      </tr>
      <tr>
        <td>1b</td>
        <td>2b</td>
        <td>3b</td>
        <td>4b</td>
        <td>5b</td>
      </tr>
      <tr>
        <td>1c</td>
        <td>2c</td>
        <td>3c</td>
        <td>4c</td>
        <td>5c</td>
      </tr>
      <tr>
        <td>1d</td>
        <td>2d</td>
        <td>3d</td>
        <td>4d</td>
        <td>5d</td>
      </tr>
      <tr>
        <td>1e</td>
        <td>2e</td>
        <td>3e</td>
        <td>4e</td>
        <td>5e</td>
      </tr>
    </table>
    <table id="complex">
      <tr>
        <td>A</td>
        <td>B</td>
        <td>C</td>
        <td>D</td>
        <td>E</td>
      </tr>
      <tr>
        <td rowspan="5">1a</td>
        <td>2a</td>
        <td>3a</td>
        <td>4a</td>
        <td>5a</td>
      </tr>
      <tr>
        <td rowspan="2" colspan="2">2b</td>
        <td>4b</td>
        <td>5b</td>
      </tr>
      <tr>
        <td rowspan="2">4c</td>
        <td>5c</td>
      </tr>
      <tr>
        <td rowspan="2">2d</td>
        <td>3d</td>
        <td>5d</td>
      </tr>
      <tr>
        <td>3e</td>
        <td>4e</td>
        <td>5e</td>
      </tr>
    </table>
    <table id="overlap">
      <tr>
        <td>1a</td>
        <td rowspan="2">2a</td>
        <td>3a</td>
      </tr>
      <tr>
        <td colspan="2">1b</td>
        <td>2b</td>
        <td>3b</td>
      </tr>
    </table>
  </body>
</html>
`;

describe("parseTable", () => {
  test("no span", () => {
    const dom = cheerio.load(html);
    expect(
      parseTable(dom("table#simple")[0], {
        parser: element => cheerio(element).text()
      })
    ).toEqual([
      ["A", "B", "C", "D", "E"],
      ["1a", "2a", "3a", "4a", "5a"],
      ["1b", "2b", "3b", "4b", "5b"],
      ["1c", "2c", "3c", "4c", "5c"],
      ["1d", "2d", "3d", "4d", "5d"],
      ["1e", "2e", "3e", "4e", "5e"]
    ]);
  });

  test("span", () => {
    const dom = cheerio.load(html);
    expect(
      parseTable(dom("table#complex")[0], {
        parser: element => cheerio(element).text()
      })
    ).toEqual([
      ["A", "B", "C", "D", "E"],
      ["1a", "2a", "3a", "4a", "5a"],
      ["1a", "2b", "2b", "4b", "5b"],
      ["1a", "2b", "2b", "4c", "5c"],
      ["1a", "2d", "3d", "4c", "5d"],
      ["1a", "2d", "3e", "4e", "5e"]
    ]);
  });

  test("parser", () => {
    const dom = cheerio.load(html);
    expect(
      parseTable(dom("table#simple")[0], {
        parser: () => ""
      })
    ).toEqual([
      ["", "", "", "", ""],
      ["", "", "", "", ""],
      ["", "", "", "", ""],
      ["", "", "", "", ""],
      ["", "", "", "", ""],
      ["", "", "", "", ""]
    ]);
  });

  test("no parser", () => {
    const dom = cheerio.load(html);
    const table = parseTable(dom("table#simple")[0]);
    expect(cheerio(table[0][0]).text()).toBe("A");
  });

  test("overlap", () => {
    const dom = cheerio.load(html);
    expect(
      parseTable(dom("table#overlap")[0], {
        parser: element => cheerio(element).text()
      })
    ).toEqual([
      ["1a", "2a", "3a", undefined],
      ["1b", "2a", "2b", "3b"]
    ]);
  });
});
