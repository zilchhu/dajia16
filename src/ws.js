import app from "apprun"

let ws = null
let ws2 = null

function init() {
  ws = new WebSocket(`ws://192.168.3.3:11180`)

  ws.onopen = function() {
    app.run("ws-open", { result: "websocket1重连中..." })
  }

  ws.onmessage = function(msg) {
    const { event, state } = JSON.parse(msg.data)
    console.log("<-", event, state)
    app.run(event, state)
  }

  ws.onclose = function() {
    app.run("ws-close", { error: "websocket1连接中断" })
    setTimeout(() => {
      init()
    }, 10000)
  }

  ws.onerror = function() {
    app.run("ws-close", { error: "websocket1连接中断" })
    setTimeout(() => {
      init()
    }, 10000)
  }
}

function init2() {
  ws2 = new WebSocket(`ws://192.168.3.3:11181`)

  ws2.onopen = function() {
    app.run("ws-open", { result: "websocket2重连中..." })
  }

  ws2.onmessage = function(msg) {
    const { event, state } = JSON.parse(msg.data)
    console.log("<-", event, state)
    app.run(event, state)
  }

  ws2.onclose = function() {
    app.run("ws-close", { error: "websocket2连接中断" })
    setTimeout(() => {
      init2()
    }, 10000)
  }

  ws2.onerror = function() {
    app.run("ws-close", { error: "websocket2连接中断" })
    setTimeout(() => {
      init2()
    }, 10000)
  }
}

init()
init2()

app.on("ws://", (event, state, ...args) => {
  if (ws == null) return
  const msg = { event, state, args }
  if (ws.readyState == 1) {
    console.log("->", event, state)
    ws.send(JSON.stringify(msg))
  }
})


app.on("ws2://", (event, state, ...args) => {
  if (ws2 == null) return
  const msg = { event, state, args }
  if (ws2.readyState == 1) {
    console.log("->", event, state)
    ws2.send(JSON.stringify(msg))
  }
})
