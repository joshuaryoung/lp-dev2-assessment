#!/usr/bin/env node

const { randomUUID } = require('crypto')
const net = require('net')
const { server_handle_message, server_send_message, isHandshakeMessage } = require('./lib/helpers')
const SOCKET = "./bank.sock"

const connectedCustomers = []
const connectedTellers = []

// TCP Server using a Unix socket
const server = net.createServer(conn => {
  conn.id = randomUUID()
  send_id(conn)
	console.log('client connected')

	server_handle_message(conn, ({ header, message }) => {
    if (isHandshakeMessage(message)) {
      switch (header.type) {
        case 'customer':
          connectedCustomers.push(header)
          break;
      
        case 'teller':
          connectedTellers.push(header)
          break;

        default:
          throw new Error('Unknown client type specified in header!')
      }
      console.log({ connectedCustomers, connectedTellers })
      return
    }
		server_send_message(conn, `I, the Bank, received: ${message}`)
	})


	conn.on('close', () => {
		console.log('client disconnected')
	})
})










server.listen(SOCKET)
console.log(`Bank server is listening...`)


process.on('exit', shutdown)
process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)
process.on('SIGUSR2', shutdown)

process.on('uncaughtException',function(err){
	console.log('Uncaught ERROR:', err)
})

function shutdown() {
	server.close()
	process.exit()
}

function send_id(conn) {
  server_send_message(conn, `{ "type": "handshake", "id": "${conn.id}" }`)
}
