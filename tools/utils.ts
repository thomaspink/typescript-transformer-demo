import * as ts from 'typescript';
import * as fs from 'fs';
import * as path from 'path';
import * as chalk from 'chalk';

const parseConfigHost: ts.ParseConfigHost = {
  useCaseSensitiveFileNames: true,
  fileExists: ts.sys.fileExists,
  readDirectory: ts.sys.readDirectory,
  readFile: ts.sys.readFile
};

/**
 * Reads the tsconfig file in a project folder and parses it.
 * @param project Path to the project folder
 * @param basePath File names in tsconfig are resolved relative to this absolute path
 * @param existingOptions Optional already existing options
 */
export function readConfiguration(project: string, basePath: string, existingOptions?: ts.CompilerOptions): ts.ParsedCommandLine {
  // Allow a directory containing tsconfig.json as the project value
  // Note, TS@next returns an empty array, while earlier versions throw
  let projectDir = project;
  try {
      if (this.readDirectory(project).length > 0) {
          project = path.join(project, 'tsconfig.json');
      } else {
          projectDir = path.parse(project).dir;
      }
  } catch (e) {
      // Was not a directory, continue on assuming it's a file
      projectDir = path.parse(project).dir;
  }

  // project is path to project file
  const { config, error } = ts.readConfigFile(project, ts.sys.readFile);
  check([error!]);

  const parsed = ts.parseJsonConfigFileContent(config, parseConfigHost, basePath, existingOptions);
  check(parsed.errors);
  return parsed;
}

/**
 * Checks a list of diagnostic objects and throws an error
 * @param diags The diagnostic array
 */
export function check(diags: ts.Diagnostic[]) {
  if (diags && diags.length && diags[0]) {
    throw new Error(formatDiagnostics(diags));
  }
}

/**
 * Formats a list of diagnostics into a nice readable format
 * for logging errors and warnings.
 * @param diags The diagnostic array
 */
export function formatDiagnostics(diags: ts.Diagnostic[]): string {
  return diags
    .map((d) => {
      let res = ts.DiagnosticCategory[d.category];
      if (d.file) {
        res += ' at ' + d.file.fileName + ':';
        const {line, character} = d.file.getLineAndCharacterOfPosition(d.start!);
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
