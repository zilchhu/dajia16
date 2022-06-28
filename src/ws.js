import app from "apprun"

let ws = null
let wsIniting = false

function init() {
  if (wsIniting) return
  wsIniting = true
  ws = new WebSocket(`ws://192.168.3.3:43261`)

  ws.onopen = function() {
    app.run("ws-open", { result: "websocket连接成功" })
    wsIniting = false
  }

  ws.onmessage = function(msg) {
    const { event, json } = JSON.parse(msg.data)
    console.log("<-", event, json)
    app.run(event, json)
  }

  ws.onclose = function() {
    app.run("ws-close", { error: "websocket连接中断" })
    wsIniting = false
    setTimeout(() => {
      init()
    }, 10000)
  }

  ws.onerror = function() {
    app.run("ws-close", { error: "websocket连接中断" })
    wsIniting = false
    setTimeout(() => {
      init()
    }, 10000)
  }
}

init()

app.on("ws://", (event, state) => {
  if (ws == null) return
  if (ws.readyState == 1) {
    console.log("->", event, state)
    ws.send(JSON.stringify({ event, ...state }))
  }
})
