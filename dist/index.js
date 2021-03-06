#!/usr/bin/env node
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var buildClientSchema_1 = require("graphql/utilities/buildClientSchema");
var schemaPrinter_1 = require("graphql/utilities/schemaPrinter");
var introspectionQuery_1 = require("graphql/utilities/introspectionQuery");
var commander_1 = require("commander");
var isomorphic_fetch_1 = __importDefault(require("isomorphic-fetch"));
var fs_1 = __importDefault(require("fs"));
var util_1 = __importDefault(require("util"));
var writeFile = util_1.default.promisify(fs_1.default.writeFile);
var HEADER_COMMENT = "\n# ----------------------- IMPORTANT -------------------------------\n#\n#      The contents of this file are AUTOMATICALLY GENERATED.  Please do\n#      not edit this file directly.  To modify its contents, make\n#      changes to your schema, and re-run this command line.\n#\n# -----------------------------------------------------------------\n";
function generateSchema(url, outputFilename, rawHeaders) {
    return __awaiter(this, void 0, void 0, function () {
        var headers, body, schemaData, schemaJson, sdl;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('Warming up...');
                    headers = { 'Content-Type': 'application/json' };
                    rawHeaders === null || rawHeaders === void 0 ? void 0 : rawHeaders.forEach(function (h) {
                        if (!h.includes(':')) {
                            console.error('Invalid headers: header must be key value pair', h);
                        }
                        var _a = h.split(':'), key = _a[0], value = _a[1];
                        headers[key.trim()] = value.trim();
                    });
                    console.log('Fetching schema...');
                    body = JSON.stringify({ query: introspectionQuery_1.getIntrospectionQuery() });
                    return [4 /*yield*/, isomorphic_fetch_1.default(url, {
                            method: 'POST',
                            body: body,
                            headers: headers,
                        })];
                case 1:
                    schemaData = _a.sent();
                    console.log('Cleaning up...');
                    return [4 /*yield*/, schemaData.json()];
                case 2:
                    schemaJson = _a.sent();
                    sdl = "\n  " + HEADER_COMMENT + "\n\n  " + json2Sdl(schemaJson).replace(/Json/gm, 'JSON') /* Uppercase JSON for consistency*/ + "\n  ";
                    console.log('Outputting file...');
                    // Write to filename
                    return [4 /*yield*/, writeFile(outputFilename, sdl)];
                case 3:
                    // Write to filename
                    _a.sent();
                    console.log('Success!');
                    return [2 /*return*/];
            }
        });
    });
}
exports.generateSchema = generateSchema;
function json2Sdl(rawjson) {
    // Credit to https://github.com/potatosalad/graphql-introspection-json-to-sdl
    if (!!rawjson && typeof rawjson === 'object') {
        if (typeof rawjson.__schema === 'object') {
            var data = rawjson;
            var schema = buildClientSchema_1.buildClientSchema(data);
            var print_1 = schemaPrinter_1.printSchema(schema);
            return print_1;
        }
        else if (typeof rawjson.data === 'object' &&
            typeof rawjson.errors === 'undefined') {
            var data = rawjson.data;
            var schema = buildClientSchema_1.buildClientSchema(data);
            var print_2 = schemaPrinter_1.printSchema(schema);
            return print_2;
        }
        else if (typeof rawjson.errors === 'object') {
            throw new Error(JSON.stringify(rawjson.errors, null, 2));
        }
        else {
            throw new Error('No "data" key found in JSON object');
        }
    }
    else {
        throw new Error('Invalid JSON object');
    }
}
function run() {
    return __awaiter(this, void 0, void 0, function () {
        var _a, url, outputFilename, headers;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    commander_1.program
                        .usage('[options] ...')
                        .description('Downloads a GraphQL schema file from an endpoint.')
                        .option('-u, --url <url>', 'Url for graphql api endpoint. ex: https://website.com/graphql')
                        .option('-o, --output-filename <fileName>', 'Name of file to be output. Should be appended with .gql')
                        .option('-h, --headers [headers...]', 'Headers to be appended to request')
                        .parse(process.argv);
                    _a = commander_1.program.opts(), url = _a.url, outputFilename = _a.outputFilename, headers = _a.headers;
                    if (!url || !outputFilename) {
                        return [2 /*return*/, commander_1.program.help()];
                    }
                    return [4 /*yield*/, generateSchema(url, outputFilename, headers)];
                case 1:
                    _b.sent();
                    return [2 /*return*/];
            }
        });
    });
}
run().catch(function (e) {
    console.error(e);
    process.exit(1);
});
module.exports = run;
//# sourceMappingURL=index.js.map