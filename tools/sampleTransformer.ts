import * as ts from 'typescript';

/**
 * A sample transformer that wraps every method declaration body
 * in try/catch statements.
 * @param context TransformationContext
 */
export function transformSample(context: ts.TransformationContext):
  (node: ts.SourceFile) => ts.SourceFile {

  // These variables contain state that changes as we descend into the tree.
  let currentSourceFile: ts.SourceFile | undefined;

  return transformSourceFile;

  function transformSourceFile(node: ts.SourceFile): ts.SourceFile {

    // before we start visiting all the nodes in the sourcefile we
    // may store this source file node so we can access it later when
    // we are somewhere deep in the Node tree.
    currentSourceFile = node;

    // Now start visiting all the nodes and thir children
    const visited = ts.visitEachChild(node, visitor as (node: ts.Node) => ts.VisitResult<ts.Node>, context);

    // after the visiting/transfomation of the nodes in this source file
    // has been finished, add the context's emit helpers to the visit result
    ts.addEmitHelpers(visited, context.readEmitHelpers());

    // reset the source file variable so we don't get any conflicts later
    currentSourceFile = undefined;

    // resturn the visit result
    return visited;
  }

  /**
   * Walkes a syntaxt tree recursivly and returns the transformed nodes
   * @param node Node to transform
   * @return returns the transformed node or undefined if we want to remove the node from the AST
   */
  function visitor<N extends ts.Node>(node: ts.Node): ts.VisitResult<ts.Node> | undefined {

    // For demo purposes lets print out the type of node we are currently visiting
    // tslint:disable-next-line:no-console
    console.log(ts.SyntaxKind[node.kind]);

    // Find out what type of node we are currently visiting
    // and call the visit function for specific nodes if available
    switch (node.kind) {

      // MethodDeclaration in a class
      case ts.SyntaxKind.MethodDeclaration:
        return visitMethodDeclaration(node as ts.MethodDeclaration);

    }
    return ts.visitEachChild(node, visitor, context);
  }

  function visitMethodDeclaration(node: ts.MethodDeclaration): ts.VisitResult<ts.MethodDeclaration> {

    // Before we create anything new we visit all the child nodes
    // of this method declaration
    node = ts.visitEachChild(node, visitor, context);

    // Create a new block for the try statement and move all the method body statements into it
    const tryBlock = ts.createBlock(node.body!.statements);

    // Now we start creating the catch part of the try/catch statement
    // The first step of a catch is to declare the exeption variable (let's call it "ex")
    const exceptionVarDeclaration = ts.createVariableDeclaration(ts.createIdentifier('ex'));

    // As we want to print this exception to the console, create a console.error statement as the
    // body of the catch

    // First create the console.error expression which is basically just a property access (the error property)
    // on the console object
    const logExpression = ts.createPropertyAccess(ts.createIdentifier('console'), ts.createIdentifier('error'));

    // Now that we have accessed the error function, we need to make a function call
    // out of it, with the "ex" variable as an argument.
    const logCall = ts.createCall(logExpression, void 0, [ts.createIdentifier('ex')]);

    // As the block we will create needs a list of statement, we need to wrap this
    // log call into one.
    const logStatement = ts.createStatement(logCall);

    // Create the catch body block and append the log statement to it
    const catchBlock = ts.createBlock([logStatement]);

    // Put the catch clause together
    const catchClause = ts.createCatchClause(exceptionVarDeclaration, catchBlock);

    // Finally after we have created all the necessary children create the try statement itself
    const tryStatement = ts.createTry(tryBlock, catchClause, void 0);

    // override the body statements we moved to the try block, with the newly created try statement
    node.body!.statements = ts.createNodeArray([tryStatement]);

    // return the updated node
    return node;
  }
}
