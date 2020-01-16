/* @flow */

import { parse } from './parser/index'
import { optimize } from './optimizer'
import { generate } from './codegen/index'
import { createCompilerCreator } from './create-compiler'

// `createCompilerCreator` allows creating compilers that use alternative
// parser/optimizer/codegen, e.g the SSR optimizing compiler.
// Here we just export a default compiler using the default parts.
export const createCompiler = createCompilerCreator(function baseCompile (
  template: string,
  options: CompilerOptions
): CompiledResult {
  /**
   * 解析模板字符串生成 AST
   */
  const ast = parse(template.trim(), options)
  if (options.optimize !== false) {
    /**
     * 优化语法树
     * 优化的目标：生成模版AST，检测不需要进行DOM改变的静态子树，一🥚检测到这些静态子树，我们就能做以下事情：
     * 1.把他们变成常数， 这样就不需要每次重新渲染的时候创建新的节点
     * 2.在patch过程中直接跳过
     */
    /* optimize主要作用是标记static静态节点，当更新的时候，会直接跳过静态节点，性能优化 */
    optimize(ast, options)
  }
  /**
   * 将AST转化成render funtion字符串的过程
   * 根据AST生成所需的code，内部包含render与staticRenderFns
   */
  const code = generate(ast, options)
  return {
    ast,
    render: code.render,
    staticRenderFns: code.staticRenderFns
  }
})
