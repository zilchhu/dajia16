import app from 'apprun'

const ws = new WebSocket(`ws://192.168.3.3:11180`)

ws.onmessage = function (msg) {
  const { event, state } = JSON.parse(msg.data)
  app.run(event, state)
}

app.on('ws://', (event, state, ...args) => {
  const msg = { event, state, args }
  console.log(msg) 
  if (ws.readyState == 1) ws.send(JSON.stringify(msg))
})

