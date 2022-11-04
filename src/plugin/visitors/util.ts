import ts from 'typescript'

export function hasPropertyKey(key: string, properties: ts.NodeArray<ts.PropertyAssignment>): boolean {
    return properties.filter(item => !isDynamicallyAdded(item)).some(item => item.name.getText() === key)
}

export function isDynamicallyAdded(identifier: ts.Node) {
    return identifier && !identifier.parent && identifier.pos === -1
}

function getNameFromExpression(expression: ts.LeftHandSideExpression) {
    if (expression && expression.kind === ts.SyntaxKind.PropertyAccessExpression) {
        return (expression as ts.PropertyAccessExpression).name
    }
    return expression
}

function getIdentifierFromName(expression: ts.LeftHandSideExpression) {
    const identifier = getNameFromExpression(expression)
    if (expression && expression.kind !== ts.SyntaxKind.Identifier) {
        throw new Error()
    }
    return identifier
}

export function getDecoratorName(decorator: ts.Decorator) {
    const isDecoratorFactory = decorator.expression.kind === ts.SyntaxKind.CallExpression
    if (isDecoratorFactory) {
        const callExpression = decorator.expression
        const identifier = (callExpression as ts.CallExpression).expression as ts.Identifier
        if (isDynamicallyAdded(identifier)) {
            return undefined
        }
        return getIdentifierFromName((callExpression as ts.CallExpression).expression).getText()
    }
    return getIdentifierFromName(decorator.expression).getText()
}

export function getDecoratorOrUndefinedByNames(
    names: string[],
    decorators: readonly ts.Decorator[],
    factory: ts.NodeFactory
): ts.Decorator | undefined {
    return (decorators || factory.createNodeArray()).find(item => {
        try {
            const decoratorName = getDecoratorName(item)
            if (!decoratorName) {
                return false
            }
            return names.includes(decoratorName)
        } catch {
            return false
        }
    })
}
