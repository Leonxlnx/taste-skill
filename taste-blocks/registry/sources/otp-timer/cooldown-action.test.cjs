const assert = require("node:assert/strict")
const fs = require("node:fs")
const path = require("node:path")
const Module = require("node:module")
const test = require("node:test")
const React = require("react")
const { renderToStaticMarkup } = require("react-dom/server")
const ts = require("typescript")

const file = path.join(
  __dirname,
  "components/cooldown-action/cooldown-action.tsx"
)
const source = fs.readFileSync(file, "utf8")
const output = ts.transpileModule(source, {
  compilerOptions: {
    esModuleInterop: true,
    jsx: ts.JsxEmit.ReactJSX,
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2022,
  },
}).outputText
const componentModule = new Module(file)
componentModule.filename = file
componentModule.paths = Module._nodeModulePaths(path.dirname(file))
componentModule._compile(output, file)
const CooldownAction = componentModule.exports.default

function makeStateSynchronous(instance) {
  instance.setState = (update, callback) => {
    const patch =
      typeof update === "function"
        ? update(instance.state, instance.props)
        : update
    instance.state = { ...instance.state, ...patch }
    callback?.()
  }
}

test("uses wall time across hidden tabs and a real guarded action lifecycle", async () => {
  const originalDocument = global.document
  const originalSetTimeout = global.setTimeout
  const originalClearTimeout = global.clearTimeout
  const originalNow = Date.now
  const listeners = new Map()
  const fakeDocument = {
    hidden: false,
    addEventListener(type, listener) {
      listeners.set(type, listener)
    },
    removeEventListener(type, listener) {
      if (listeners.get(type) === listener) listeners.delete(type)
    },
  }
  let now = 1_000
  let timer
  let actionCalls = 0
  let finishAction

  global.document = fakeDocument
  global.setTimeout = (callback, delay) => {
    timer = { callback, delay }
    return 1
  }
  global.clearTimeout = () => {
    timer = undefined
  }
  Date.now = () => now

  try {
    const action = new CooldownAction({
      minutes: 0,
      seconds: 3,
      ButtonText: "Export again",
      resend: () => {
        actionCalls += 1
        return new Promise((resolve) => {
          finishAction = resolve
        })
      },
    })
    makeStateSynchronous(action)
    action.componentDidMount()

    assert.equal(action.state.seconds, 3)
    assert.equal(listeners.size, 1)
    assert.ok(timer.delay <= 1_000)

    now = 2_500
    fakeDocument.hidden = true
    listeners.get("visibilitychange")()
    assert.equal(timer, undefined)

    now = 4_200
    fakeDocument.hidden = false
    listeners.get("visibilitychange")()
    assert.equal(action.state.seconds, 0)
    assert.equal(action.state.announcement, "Action available.")

    const availableMarkup = renderToStaticMarkup(
      React.createElement("form", null, action.render())
    )
    assert.match(availableMarkup, /<button[^>]*type="button"/)
    assert.match(availableMarkup, /min-block-size:2\.75rem/)
    assert.doesNotMatch(availableMarkup, /type="submit"/)

    let prevented = 0
    const first = action.handleClick({
      preventDefault() {
        prevented += 1
      },
    })
    const duplicate = action.handleClick({
      preventDefault() {
        prevented += 1
      },
    })

    assert.equal(actionCalls, 1)
    assert.equal(action.state.pending, true)
    assert.equal(prevented, 2)
    assert.match(renderToStaticMarkup(action.render()), /aria-busy="true"/)

    finishAction()
    await Promise.all([first, duplicate])
    assert.equal(action.state.pending, false)
    assert.equal(action.state.seconds, 3)

    const previousProps = action.props
    action.props = { ...previousProps, seconds: 5 }
    action.componentDidUpdate(previousProps)
    assert.equal(action.state.seconds, 5)

    now = 9_300
    fakeDocument.hidden = true
    listeners.get("visibilitychange")()
    fakeDocument.hidden = false
    listeners.get("visibilitychange")()
    action.props = {
      ...action.props,
      resend: async () => {
        throw new Error("request failed")
      },
    }
    await action.handleClick({ preventDefault() {} })
    assert.equal(action.state.pending, false)
    assert.equal(action.state.seconds, 0)
    assert.equal(action.state.announcement, "Action failed. Try again.")
    assert.match(renderToStaticMarkup(action.render()), /type="button"/)

    action.componentWillUnmount()
    assert.equal(listeners.size, 0)
    assert.equal(timer, undefined)

    const countdownMarkup = renderToStaticMarkup(
      React.createElement(CooldownAction, {
        resend() {},
        seconds: 2,
      })
    )
    assert.match(countdownMarkup, /aria-live="off"/)
    assert.equal((countdownMarkup.match(/role="status"/g) || []).length, 1)
    assert.doesNotMatch(source, /\b(?:animation|transition)\s*:/)
  } finally {
    Date.now = originalNow
    global.setTimeout = originalSetTimeout
    global.clearTimeout = originalClearTimeout
    if (originalDocument === undefined) delete global.document
    else global.document = originalDocument
  }
})
