import _ from 'lodash'
import ts from 'typescript'
import { ApiHideProperty } from '../../decorator'
import { getDecoratorOrUndefinedByNames, hasPropertyKey } from './util'

export class ModelClassVisitor {
    addImportDeclaration(sourceFile: ts.SourceFile, factory: ts.NodeFactory, program: ts.Program): ts.SourceFile {
        const importEqualsDeclaration = factory.createImportEqualsDeclaration(
            undefined,
            false,
            factory.createIdentifier('openapi'),
            factory.createExternalModuleReference(factory.createStringLiteral('@nestjs/swagger'))
        )
        return factory.updateSourceFile(sourceFile, [importEqualsDeclaration, ...sourceFile.statements])
    }

    visit(sourceFile: ts.SourceFile, ctx: ts.TransformationContext, program: ts.Program, options: any) {
        const typeChecker = program.getTypeChecker()
        sourceFile = this.addImportDeclaration(sourceFile, ctx.factory, program)

        const visitClassNode = (node: ts.Node): ts.Node => {
            if (ts.isClassDeclaration(node)) {
                const metadata: any = {}
                node = ts.visitEachChild(node, child => {
                    if (!ts.isPropertyDeclaration(child)) {
                        return child
                    }
                    const decorators = ts.getDecorators(child)
                    if (!decorators) {
                        return child
                    }
                    const hidePropertyDecorator = getDecoratorOrUndefinedByNames([ApiHideProperty.name], decorators, ts.factory)
                    if (hidePropertyDecorator) {
                        return child
                    }
                    const isPropertyStatic = (child.modifiers || []).some(modifier => modifier.kind === ts.SyntaxKind.StaticKeyword)
                    if (isPropertyStatic) {
                        return child
                    }
                    const existingProperties = ctx.factory.createNodeArray()
                    const isRequired = !child.questionToken;
                    const hasRequiredProperty = hasPropertyKey('required', existingProperties as ts.NodeArray<ts.PropertyAssignment>)
                    let properties = [
                      ...existingProperties,
                      !hasRequiredProperty &&
                        ctx.factory.createPropertyAssignment(
                          'required',
                          isRequired ? ctx.factory.createTrue() : ctx.factory.createFalse()
                        ),
                    console.log('ge')
                    //   ...this.createTypePropertyAssignments(
                    //     ctx.factory,
                    //     child.type,
                    //     typeChecker,
                    //     existingProperties,
                    //     hostFilename
                    //   ),
                    //   ...this.createDescriptionAndTsDocTagPropertyAssigments(
                    //     ctx.factory,
                    //     child,
                    //     typeChecker,
                    //     existingProperties,
                    //     options,
                    //     sourceFile
                    //   ),
                    //   this.createDefaultPropertyAssignment(ctx.factory, child, existingProperties),
                    //   this.createEnumPropertyAssignment(
                    //     ctx.factory,
                    //     child,
                    //     typeChecker,
                    //     existingProperties,
                    //     hostFilename
                    //   )
                    ];
                    // if (options.classValidatorShim) {
                    //   properties = properties.concat(
                    //     this.createValidationPropertyAssignments(ctx.factory, child)
                    //   );
                    // }
                    const objectLiteralExpr =  ctx.factory.createObjectLiteralExpression(_.compact(_.flatten(properties as any)));
                    const hostClass = child.parent;
                    const className = hostClass.name && hostClass.name.getText();
                    if (!className) {
                      return child;
                    }
                    const propertyName = child.name && child.name.getText(sourceFile);
                    if (
                      !propertyName ||
                      (child.name && child.name.kind === ts.SyntaxKind.ComputedPropertyName)
                    ) {
                      return child;
                    }
                    metadata[propertyName] = objectLiteralExpr;
                    return child
                }, ctx) as ts.ClassDeclaration
                const returnValue = ctx.factory.createObjectLiteralExpression(
                    Object.keys(metadata).map((key) =>
                      ctx.factory.createPropertyAssignment(
                        ctx.factory.createIdentifier(key),
                        metadata[key]
                      )
                    )
                )
                // TODO
                const method = ctx.factory.createMethodDeclaration(
                    [ctx.factory.createModifier(ts.SyntaxKind.StaticKeyword)],
                    undefined,
                    ctx.factory.createIdentifier(METADATA_FACTORY_NAME),
                    undefined,
                    undefined,
                    [],
                    undefined,
                    ctx.factory.createBlock(
                        [ctx.factory.createReturnStatement(returnValue)],
                        true
                    )
                )
                return ctx.factory.updateClassDeclaration(
                    node as ts.ClassDeclaration,
                    node.modifiers,
                    node.name,
                    node.typeParameters,
                    node.heritageClauses,
                    [...node.members, method]
                  )
                //return this.addMetadataFactory(ctx.factory, node as ts.ClassDeclaration, metadata)
            }
            return ts.visitEachChild(node, visitClassNode, ctx)
        }
        return ts.visitNode(sourceFile, visitClassNode)
    }

}
