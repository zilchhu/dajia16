import app from "apprun"

let ws = null

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

init()

app.on("ws://", (event, state, ...args) => {
  if (ws == null) return
  const msg = { event, state, args }
  if (ws.readyState == 1) {
    console.log("->", event, state)
    ws.send(JSON.stringify(msg))
  }
})

const ws2 = new WebSocket(`ws://192.168.3.3:11181`)

ws2.onmessage = function(msg) {
  const { event, state } = JSON.parse(msg.data)
  app.run(event, state)
}

app.on("ws2://", (event, state, ...args) => {
  const msg = { event, state, args }
  console.log(msg)
  if (ws2.readyState == 1) ws2.send(JSON.stringify(msg))
})
