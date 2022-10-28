#!/usr/bin/env node

const { randomUUID } = require('crypto')
const net = require('net')
const { render, handle_input, handle_message, client_send_message, red, isHandshakeMessage } = require('./lib/helpers')
const conn = net.createConnection('./bank.sock')
const clientId = randomUUID()

function connection_ready() {
  render([
    `The Bank is ${red('closed')}.`
	])
}



function connection_closed() {
	console.log('connection closed')
}



handle_input(line => {
  const messageHeader = createHeader()
	client_send_message(conn, line, messageHeader)
})



handle_message(conn, message => {
  if (message && typeof message === 'string' && isHandshakeMessage(message)) {
    try {
      const jsonObj = JSON.parse(message)
      if (typeof jsonObj === 'object') {
        const { id } = jsonObj
        conn.id = id
        const message = `{ "type": "handshake", "id": "${conn.id}" }`
        const messageHeader = createHeader()
  
        client_send_message(conn, message, messageHeader)
      }
    } catch (error) {
    }
  }
})










conn.on('ready', connection_ready)

conn.on('close', () => {
	connection_closed()
	process.exit(1)
})

conn.on('error', () => {
	console.log('No connection')
	process.exit(1)
})

function createHeader () {
  const messageHeader = {
    clientId: conn.id,
    type: 'customer'
  }

  return messageHeader
}