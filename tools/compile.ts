import * as ts from 'typescript';
import * as path from 'path';
import * as fs from 'fs';
import {check, readConfiguration} from './utils';
import {transformSample} from './sampleTransformer';

/**
 * The main function for compiling a project (a folder with an optional tsconfig file in it)
 * @param project Path to the project directory of tsconfig file
 * @param compilerOptions Optional additional compiler options. Otherwise we will read those option directly from the tsconfig file.
 */
export async function main(project: string, compilerOptions?: ts.CompilerOptions) {

  // if project path is a file (tsconfig.json) we need to find out
  // the corresponding folder
  let projectDir = project;
  if (fs.lstatSync(project).isFile()) {
      projectDir = path.dirname(project);
  }

  // file names in tsconfig are resolved relative to this absolute path
  const basePath = path.resolve(process.cwd(), projectDir);

  // read the tsconfig.json
  const config = readConfiguration(project, basePath, compilerOptions);

  // if we got diagnostics enable performance measuring
  const diagnostics = (config.options as any).diagnostics;
  if (diagnostics) (ts as any).performance.enable();

  // Create a CompilerHost
  // Typescript Docs:
  // The CompilerHost allows the compiler to read and write files,
  // get the current directory, ensure that files and directories exist,
  // and query some of the underlying system properties such as case
  // sensitivity and new line characters.
  const host = ts.createCompilerHost(config.options, true);

  // Now create a program with the files we want to transpile, the compiler option
  // specified in the tsconfig and the created CompilerHost
  const program = ts.createProgram(config.fileNames!, config.options!, host);

  // After we have created the program check in the provided
  // diagnostics for errors
  const errors = program.getOptionsDiagnostics();
  check(errors);

  // Now emit the program (start the compilation/transpilation)
  const emitResult = program.emit(undefined, undefined, undefined, false, {
    before: [transformSample]
  });

  // if we get diagnostics (errors), also print measured performace figures
  if (diagnostics) {
    (ts as any).performance.forEachMeasure(
      (name: string, duration: number) => {console.error(`TS ${name}: ${duration}ms`);});
  }
}

// Expose our compile main function to the commandline
// and handle the arguments provided
if (require.main === module) {
  const args = process.argv.slice(2);
  const {options, errors} = ts.parseCommandLine(args);
  check(errors);
  const project = options.project || './tsconfig.json';
  main(project, options)
    .then((exitCode: any) => process.exit(exitCode))
    .catch((e: any) => {
      console.error(e.stack);
      console.error('Compilation failed');
      process.exit(1);
    });
}
