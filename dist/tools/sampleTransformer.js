"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ts = require("typescript");
function transformSample(context) {
    // These variables contain state that changes as we descend into the tree.
    let currentSourceFile;
    return transformSourceFile;
    function transformSourceFile(node) {
        currentSourceFile = node;
        const visited = ts.visitEachChild(node, visitor, context);
        ts.addEmitHelpers(visited, context.readEmitHelpers());
        currentSourceFile = undefined;
        return visited;
    }
    /**
     * Walkes a syntaxt tree recursivly and returns the transformed nodes
     * @param node Node to transform
     * @return returns the transformed node or undefined if we want to remove the node from the AST
     */
    function visitor(node) {
        // For demo purposes lets print out the type of node we are currently visiting
        // tslint:disable-next-line:no-console
        console.log(ts.SyntaxKind[node.kind]);
        // Find out what type of node we are currently visiting
        // and call the visit function for specific nodes if available
        switch (node.kind) {
            // MethodDeclaration in a class
            case ts.SyntaxKind.MethodDeclaration:
                return visitMethodDeclaration(node);
        }
        return ts.visitEachChild(node, visitor, context);
    }
    function visitMethodDeclaration(node) {
        // Before we create anything new we visit all the child nodes
        // of this method declaration
        node = ts.visitEachChild(node, visitor, context);
        // Create a new block for the try statement and move all the method body statements into it
        const tryBlock = ts.createBlock(node.body.statements);
        // Now we start creating the catch part of the try/catch statement
        // First we need to declare the exeption variable (let's call it "ex")
        const exceptionVarDeclaration = ts.createVariableDeclaration(ts.createIdentifier('ex'));
        // As we want to print this exception to the console, create a
        // ts.createExpression
        // ts.createPropertyAccess()
        const catchBlock = ts.createBlock([]);
        const catchClause = ts.createCatchClause(exceptionVarDeclaration, catchBlock);
        // Finally after we have created all the necessary children create the try statement itself
        const tryStatement = ts.createTry(tryBlock, catchClause, void 0);
        // override the body statements we moved to the try block, with the newly created try statement
        node.body.statements = ts.createNodeArray([tryStatement]);
        // return the updated node
        return node;
    }
}
exports.transformSample = transformSample;
