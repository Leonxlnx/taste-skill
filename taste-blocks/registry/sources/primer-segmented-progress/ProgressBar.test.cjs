const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const Module = require('node:module')
const test = require('node:test')
const React = require('react')
const {renderToStaticMarkup} = require('react-dom/server')
const ts = require('typescript')

const file = path.join(__dirname, 'components/primer-segmented-progress/ProgressBar.tsx')
const output = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
  compilerOptions: {
    esModuleInterop: true,
    jsx: ts.JsxEmit.ReactJSX,
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2022,
  },
}).outputText
const previousCssLoader = require.extensions['.css']
require.extensions['.css'] = module => {
  module.exports = {ProgressBarContainer: 'container', ProgressBarItem: 'item'}
}
const componentModule = new Module(file)
componentModule.filename = file
componentModule.paths = Module._nodeModulePaths(path.dirname(file))
const localRequire = componentModule.require.bind(componentModule)
componentModule.require = id =>
  id === 'clsx' ? {clsx: (...values) => values.filter(Boolean).join(' ')} : localRequire(id)
componentModule._compile(output, file)
if (previousCssLoader) require.extensions['.css'] = previousCssLoader
else delete require.extensions['.css']

function assertProgress(progress, expected) {
  const html = renderToStaticMarkup(
    React.createElement(componentModule.exports.Item, {progress, 'aria-label': 'Test progress'}),
  )
  assert.match(html, new RegExp(`aria-valuenow="${expected}"`))
  assert.match(html, new RegExp(`--progress-width:${expected}%`))
}

test('clamps invalid and out-of-range progress values', () => {
  assertProgress('not-a-number', 0)
  assertProgress(-8, 0)
  assertProgress(120, 100)

  const overriddenAria = renderToStaticMarkup(
    React.createElement(componentModule.exports.Item, {
      'aria-label': 'Test progress',
      'aria-valuenow': 140,
      progress: 25,
    }),
  )
  assert.match(overriddenAria, /aria-valuenow="100"/)
  assert.match(overriddenAria, /--progress-width:25%/)
})
