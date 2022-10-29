import ts from 'typescript'

export class ModelClassVisitor {
    updateImports(sourceFile: ts.SourceFile, factory: ts.NodeFactory, program: ts.Program): ts.SourceFile {
        const importEqualsDeclaration = factory.createImportEqualsDeclaration(
            undefined,
            false,
            factory.createIdentifier('openapi'),
            factory.createExternalModuleReference(factory.createStringLiteral('@nestjs/swagger'))
        )
        return factory.updateSourceFile(sourceFile, [
          importEqualsDeclaration,
          ...sourceFile.statements
        ])
    }

    visit(sourceFile: ts.SourceFile, ctx: ts.TransformationContext, program: ts.Program, options: any) {
        const typeChecker = program.getTypeChecker()
        sourceFile = this.updateImports(sourceFile, ctx.factory, program)

        const visitClassNode = (node: ts.Node): ts.Node => {
            if (ts.isClassDeclaration(node)) {
              console.log('ge')
                // const metadata: ClassMetadata = {};
                // node = ts.visitEachChild(
                //   node,
                //   propertyNodeVisitorFactory(metadata),
                //   ctx
                // );
                // return this.addMetadataFactory(
                //   ctx.factory,
                //   node as ts.ClassDeclaration,
                //   metadata
                // );
            }
            return ts.visitEachChild(node, visitClassNode, ctx)
        }
        return ts.visitNode(sourceFile, visitClassNode)
    }
}
