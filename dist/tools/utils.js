"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ts = require("typescript");
const path = require("path");
const chalk = require("chalk");
const parseConfigHost = {
    useCaseSensitiveFileNames: true,
    fileExists: ts.sys.fileExists,
    readDirectory: ts.sys.readDirectory,
    readFile: ts.sys.readFile
};
function readConfiguration(project, basePath, existingOptions) {
    // Allow a directory containing tsconfig.json as the project value
    // Note, TS@next returns an empty array, while earlier versions throw
    let projectDir = project;
    try {
        if (this.readDirectory(project).length > 0) {
            project = path.join(project, 'tsconfig.json');
        }
        else {
            projectDir = path.parse(project).dir;
        }
    }
    catch (e) {
        // Was not a directory, continue on assuming it's a file
        projectDir = path.parse(project).dir;
    }
    // project is path to project file
    const { config, error } = ts.readConfigFile(project, ts.sys.readFile);
    check([error]);
    const parsed = ts.parseJsonConfigFileContent(config, parseConfigHost, basePath, existingOptions);
    check(parsed.errors);
    return parsed;
}
exports.readConfiguration = readConfiguration;
function check(diags) {
    if (diags && diags.length && diags[0]) {
        throw new UserError(formatDiagnostics(diags));
    }
}
exports.check = check;
function formatDiagnostics(diags) {
    return diags
        .map((d) => {
        let res = ts.DiagnosticCategory[d.category];
        if (d.file) {
            res += ' at ' + d.file.fileName + ':';
            const { line, character } = d.file.getLineAndCharacterOfPosition(d.start);
            res += (line + 1) + ':' + (character + 1) + ':';
        }
        res += ' ' + ts.flattenDiagnosticMessageText(d.messageText, '\n');
        switch (d.category) {
            case ts.DiagnosticCategory.Error:
                res = chalk.red(res);
                break;
            case ts.DiagnosticCategory.Warning:
                res = chalk.yellow(res);
                break;
        }
        return res;
    })
        .join('\n');
}
exports.formatDiagnostics = formatDiagnostics;
class UserError extends Error {
    constructor(message) {
        super(message);
        // Required for TS 2.1, see
        // https://github.com/Microsoft/TypeScript/wiki/Breaking-Changes#extending-built-ins-like-error-array-and-map-may-no-longer-work
        Object.setPrototypeOf(this, UserError.prototype);
        const nativeError = new Error(message);
        this._nativeError = nativeError;
    }
    get message() { return this._nativeError.message; }
    set message(message) {
        if (this._nativeError)
            this._nativeError.message = message;
    }
    get name() { return this._nativeError.name; }
    set name(name) {
        if (this._nativeError)
            this._nativeError.name = name;
    }
    get stack() { return this._nativeError.stack; }
    set stack(value) {
        if (this._nativeError)
            this._nativeError.stack = value;
    }
    toString() { return this._nativeError.toString(); }
}
exports.UserError = UserError;
