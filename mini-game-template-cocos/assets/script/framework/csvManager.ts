// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html

import { Constructor, _decorator } from "cc";
const { ccclass } = _decorator;

const CELL_DELIMITERS = [",", ";", "\t", "|", "^"];
const LINE_DELIMITERS = ["\r\n", "\r", "\n"];

type Options = { header: string[] | boolean, comment: string[], cast: string[], skip: number, newline: string, delimiter: string, limit: boolean }

const getter = function (index: number) {
    return ("d[" + index + "]");
};

const getterCast = function (value: any, index: number, cast: any, d: any) {

    if (cast instanceof Array) {
        if (cast[index] === "number") {
            return Number(d[index]);
        } else if (cast[index] === "boolean") {
            return d[index] === "true" || d[index] === "t" || d[index] === "1";
        } else {
            return d[index];
        }
    } else {
        if (!isNaN(Number(value))) {
            return Number(d[index]);
        } else if (value == "false" || value == "true" || value == "t" || value == "f") {
            return d[index] === "true" || d[index] === "t" || d[index] === "1";
        } else {
            return d[index];
        }
    }
};

const CSV = {
    //

    /* =========================================
        * Constants ===============================
        * ========================================= */

    STANDARD_DECODE_OPTS: {
        skip: 0,
        limit: false,
        header: false,
        cast: false,
        comment: ""
    },

    STANDARD_ENCODE_OPTS: {
        delimiter: CELL_DELIMITERS[0],
        newline: LINE_DELIMITERS[0],
        skip: 0,
        limit: false,
        header: false
    },

    quoteMark: '"',
    doubleQuoteMark: '""',
    quoteRegex: /"/g,
    opts: {},

    /* =========================================
        * Utility Functions =======================
        * ========================================= */
    assign: function (...args: any[]) {
        const params = Array.prototype.slice.call(arguments);
        const base = args[0];
        const rest = args.slice(1);
        for (let i = 0, len = rest.length; i < len; i++) {
            for (const attr in rest[i]) {
                base[attr] = rest[i][attr];
            }
        }

        return base;
    },

    map: function (collection: any[], fn: (value: any, index: number) => any) {
        const results = [];
        for (let i = 0, len = collection.length; i < len; i++) {
            results[i] = fn(collection[i], i);
        }

        return results;
    },

    getType: function (obj: any) {
        return Object.prototype.toString.call(obj).slice(8, -1);
    },

    getLimit: function (limit: boolean, len: number) {
        return limit === false ? len : 1;
    },

    buildObjectConstructor: function (fields: any[], sample: any[], cast: any) {
        return function (d: any) {
            const object: any = {};
            const setter = function (attr: string, value: any) {
                return object[attr] = value;
            };

            if (cast) {
                fields.forEach((attr, idx) => {
                    setter(attr, getterCast(sample[idx], idx, cast, d));
                });
            } else {
                fields.forEach((attr, idx) => {
                    setter(attr, getterCast(sample[idx], idx, null, d));
                });
            }
            // body.push("return object;");
            // body.join(";\n");
            return object;
        };
    },

    buildArrayConstructor: function (fields: any[], sample: any[], cast: any) {
        return function (d: any) {
            const row = new Array(sample.length);
            const setter = function (idx: number, value: number) {
                return row[idx] = value;
            };
            if (cast) {
                fields.forEach(function (attr, idx) {
                    setter(attr, getterCast(sample[idx], idx, cast, d));
                });
            } else {
                fields.forEach(function (attr, idx) {
                    setter(attr, getterCast(sample[idx], idx, null, d));
                });
            }
            return row;
        };
    },

    frequency: function (coll: string, needle: string, limit?: boolean) {
        if (limit === void 0) limit = false;

        let count = 0;
        let lastIndex = 0;
        const maxIndex = this.getLimit(limit, coll.length);

        while (lastIndex < maxIndex) {
            lastIndex = coll.indexOf(needle, lastIndex);
            if (lastIndex === -1) break;
            lastIndex += 1;
            count++;
        }

        return count;
    },

    mostFrequent: function (coll: string, needles:string[], limit?: boolean) {
        const max = 0;
        let detected = '';

        for (let cur = needles.length - 1; cur >= 0; cur--) {
            if (this.frequency(coll, needles[cur], limit) > max) {
                detected = needles[cur];
            }
        }

        return detected || needles[0];
    },

    unsafeParse: function (text: string, opts: Options, fn: Function) {
        const lines = text.split(opts.newline!);

        if (opts.skip > 0) {
            lines.splice(opts.skip);
        }

        let fields: any;
        let constructor;

        function cells(lines: any[]) {
            let line = lines.shift()!;
            if (line.indexOf('"') >= 0) {// 含引号

                // 找到这行完整的数据, 找到对称的双引号
                let lastIndex = 0;
                let findIndex = 0;
                let count = 0;
                while (lines.length > 0) {
                    lastIndex = line.indexOf('"', findIndex);
                    if (lastIndex === -1 && count % 2 === 0) break;

                    if (lastIndex !== -1) {
                        findIndex = lastIndex + 1;
                        count++;
                    } else {
                        line = line + opts.newline + lines.shift();
                    }
                }

                const list = [];
                let item;

                let quoteCount = 0;

                let start = 0;
                let end = 0;
                const length = line.length;
                for (let key in line) {
                    if (!line.hasOwnProperty(key)) {
                        continue;
                    }

                    let numKey = parseInt(key);
                    const value = line[key];

                    if (numKey === 0 && value === '"') {
                        quoteCount++;
                        start = 1;
                    }

                    if (value === '"') {
                        quoteCount++;

                        if (line[numKey - 1] === opts.delimiter && start === numKey) {
                            start++;
                        }
                    }

                    if (value === '"' && quoteCount % 2 === 0) {

                        if (line[numKey + 1] === opts.delimiter || numKey + 1 === length) {
                            end = numKey;
                            item = line.substring(start, end);
                            list.push(item);
                            start = end + 2;
                            end = start;
                        }

                    }

                    if (value === opts.delimiter && quoteCount % 2 === 0) {
                        end = numKey;
                        if (end > start) {
                            item = line.substring(start, end);
                            list.push(item);
                            start = end + 1;
                            end = start;
                        } else if (end === start) {
                            list.push("");
                            start = end + 1;
                            end = start;
                        }
                    }

                }

                end = length;

                if (end >= start) {
                    item = line.substring(start, end);
                    list.push(item);
                }

                return list;
            } else {
                return line.split(opts.delimiter);
            }
        }

        if (opts.header) {
            if (opts.header === true) {
                opts.comment = cells(lines); // 第一行是注释
                opts.cast = cells(lines); // 第二行是数据类型
                fields = cells(lines);
            } else if (this.getType(opts.header) === "Array") {
                fields = opts.header;
            }

            constructor = this.buildObjectConstructor(fields, lines[0].split(opts.delimiter), opts.cast);
        } else {
            constructor = this.buildArrayConstructor(fields as any[], lines[0].split(opts.delimiter), opts.cast);
        }

        while (lines.length > 0) {
            const row = cells(lines);
            if (row.length > 1) {
                fn(constructor(row), fields[0]);
            }
        }

        return true;
    },

    safeParse: function (text: string, opts: Options) {
        const newline = opts.newline;

        const lines = text.split(newline);
        if (opts.skip > 0) {
            lines.splice(opts.skip);
        }

        return true;
    },

    encodeCells: function (line: string[], delimiter: any, newline: any) {
        const row = line.slice(0);
        for (let i = 0, len = row.length; i < len; i++) {
            if (row[i].indexOf(this.quoteMark) !== -1) {
                row[i] = row[i].replace(this.quoteRegex, this.doubleQuoteMark);
            }

            if (row[i].indexOf(delimiter) !== -1 || row[i].indexOf(newline) !== -1) {
                row[i] = this.quoteMark + row[i] + this.quoteMark;
            }
        }

        return row.join(delimiter);
    },

    encodeArrays: function (coll: any, opts: Options, fn: (value: string) => void) {
        const delimiter = opts.delimiter;
        const newline = opts.newline;

        if (opts.header && this.getType(opts.header) === "Array") {
            fn(this.encodeCells(opts.header as any[], delimiter, newline));
        }

        for (let cur = 0, lim = this.getLimit(opts.limit, coll.length); cur < lim; cur++) {
            fn(this.encodeCells(coll[cur], delimiter, newline));
        }

        return true;
    },

    encodeObjects: function (coll: any[], opts: Options, fn: (value: string) => void) {
        const delimiter = opts.delimiter;
        const newline = opts.newline;
        let header: string[] = [];
        let row: string[] = [];
        for (const key in coll[0]) {
            header.push(key);
            row.push(coll[0][key]);
        }

        if (opts.header === true) {
            fn(this.encodeCells(header, delimiter, newline));
        } else if (this.getType(opts.header) === "Array") {
            fn(this.encodeCells(opts.header as string[], delimiter, newline));
        }

        fn(this.encodeCells(row, delimiter, '\n'));

        for (let cur = 1, lim = this.getLimit(opts.limit, coll.length); cur < lim; cur++) {
            row = [];
            for (let i = 0, len = header.length; i < len; i++) {
                row.push(coll[cur][header[i]]);
            }

            fn(this.encodeCells(row, delimiter, newline));
        }

        return true;
    },

    parse: function (text: string, opts: any, fn: any) {
        let rows: any[] = [];

        if (this.getType(opts) === "Function") {
            fn = opts;
            opts = {};
        } else if (this.getType(fn) !== "Function") {
            fn = rows.push.bind(rows);
        }

        opts = this.assign({}, this.STANDARD_DECODE_OPTS, opts);
        this.opts = opts;

        if (!opts.delimiter || !opts.newline) {
            const limit = Math.min(48, Math.floor(text.length / 20), text.length);
            opts.delimiter = opts.delimiter || this.mostFrequent(text, CELL_DELIMITERS, limit !== 0);
            opts.newline = opts.newline || this.mostFrequent(text, LINE_DELIMITERS, limit !== 0);
        }

        // modify by jl 由表自行控制不要含有双引号.提高解析效率
        return this.unsafeParse(text, opts, fn) &&
            (rows.length > 0 ? rows : true);
    },

    encode: function (coll: string, opts: Options, fn: any) {
        let lines: any[] = [];

        if (this.getType(opts) === "Function") {
            fn = opts;
            // opts = {};
        } else if (this.getType(fn) !== "Function") {
            lines = [];
            fn = lines.push.bind(lines);
        }

        opts = this.assign({}, this.STANDARD_ENCODE_OPTS, opts);

        if (opts.skip > 0) {
            coll = coll.slice(opts.skip);
        }

        return (this.getType(coll[0]) === "Array" ? this.encodeArrays : this.encodeObjects)(coll, opts, fn) &&
            (lines.length > 0 ? lines.join(opts.newline) : true);
    }
};

type ObjType<T = any> = Constructor<T>;
// type ObjData<T> =

@ccclass("csvManager")
export class csvManager {
    /* class member could be defined like this */

    csvTables: any = {};
    csvTableForArr: any = {};
    tableCast: any = {};
    tableComment: any = {};

    addTable(tableName: string, tableContent: string, force?: boolean) {
        if (this.csvTables[tableName] && !force) {
            return;
        }

        const tableData: any = {};
        const tableArr: any[] = [];
        const opts = { header: true };
        CSV.parse(tableContent, opts, (row: any, keyName: string) => {
            tableData[row[keyName]] = row;
            tableArr.push(row);
        });

        this.tableCast[tableName] = (CSV as any).opts.cast;
        this.tableComment[tableName] = (CSV as any).opts.comment;

        this.csvTables[tableName] = tableData;
        this.csvTableForArr[tableName] = tableArr;

        //this.csvTables[tableName].initFromText(tableContent);
    }

    getTableArr(tableName: string) {
        return this.csvTableForArr[tableName];
    }

    getTable(tableName: string) {
        return this.csvTables[tableName];
    }

    queryOne(tableName: string, key: string | null, value: any) {
        const table = this.getTable(tableName);
        if (!table) {
            return null;
        }

        if (key) {
            for (const tbItem in table) {
                if (!table.hasOwnProperty(tbItem)) {
                    continue;
                }

                if (table[tbItem][key] === value) {
                    return table[tbItem];
                }
            }
        } else {
            return table[value];
        }
    }

    queryByID(tableName: string, ID: string) {
        return this.queryOne(tableName, null, ID);
    }

    queryAll(tableName: string, key: string, value: any) {
        const table = this.getTable(tableName);
        if (!table || !key) {
            return null;
        }

        const ret: { [name: string]: any } = {};
        for (const tbItem in table) {
            if (!table.hasOwnProperty(tbItem)) {
                continue;
            }

            if (table[tbItem][key] === value) {
                ret[tbItem] = table[tbItem];
            }
        }

        return ret;
    }

    queryIn(tableName: string, key: string, values: Array<any>) {
        const table = this.getTable(tableName);
        if (!table || !key) {
            return null;
        }

        const ret: { [name: string]: any } = {};
        const keys = Object.keys(table);
        const length = keys.length;
        for (let i = 0; i < length; i++) {
            const item = table[keys[i]];
            if (values.indexOf(item[key]) > -1) {
                ret[keys[i]] = item;
            }
        }

        return ret;
    }

    queryByCondition(tableName: string, condition: any) {
        if (condition.constructor !== Object) {
            return null;
        }

        const table = this.getTable(tableName);
        if (!table) {
            return null;
        }

        const ret: { [keu: string]: any } = {};
        const tableKeys = Object.keys(table);
        const tableKeysLength = tableKeys.length;
        const keys = Object.keys(condition);
        const keysLength = keys.length;
        for (let i = 0; i < tableKeysLength; i++) {
            const item = table[tableKeys[i]];
            let fit = true;
            for (let j = 0; j < keysLength; j++) {
                const key = keys[j];
                fit = fit && (condition[key].indexOf(item[key]) > -1 && !ret[tableKeys[i]]);
            }

            if (fit) {
                ret[tableKeys[i]] = item;
            }
        }

        return ret;
    }
}
