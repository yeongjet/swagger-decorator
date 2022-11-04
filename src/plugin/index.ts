import 'reflect-metadata'
import ts from 'typescript'
import { ModelClassVisitor } from './visitors'

const isFilenameMatched = (patterns: string[], filename: string) => patterns.some(path => filename.includes(path))

const modelClassVisitor = new ModelClassVisitor();

export const before = (options: Record<string, any>, program: ts.Program) => {
    return (ctx: ts.TransformationContext): ts.Transformer<any> => {
        return (sf: ts.SourceFile) => {
            if (isFilenameMatched(['.dto.ts', '.entity.ts'], sf.fileName)) {
                return modelClassVisitor.visit(sf, ctx, program, options)
            }
            if (isFilenameMatched(['.controller.ts'], sf.fileName)) {
                // return controllerClassVisitor.visit(sf, ctx, program, options)
            }
            return sf
        }
    }
}

export const build = rootDir => {
    const {
        fileNames: rootNames,
        projectReferences,
        options
    } = ts.getParsedCommandLineOfConfigFile(
        `${rootDir}/tsconfig.json`,
        undefined!,
        ts.sys as unknown as ts.ParseConfigFileHost
    )!
    const program = ts.createIncrementalProgram({ rootNames, projectReferences, options })
    const programRef = program.getProgram()
    const emitResult = program.emit(undefined, undefined, undefined, undefined, {
        before: [before(options, programRef)]
    })
}


