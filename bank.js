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
      handle_handshake(header)
      return
    }
    console.log({ message, header })
		server_send_message(conn, `The bank is ${connectedTellers.length ? 'open' : 'closed'}.`)
	})


	conn.on('close', () => {
		console.log('client disconnected')
	})
})

function handle_handshake(header) {
  switch (header.type) {
    case 'customer':
      const newCustomer = {
        ...header,
        balance: 100
      }
      connectedCustomers.push(newCustomer)
      break;
  
    case 'teller':
      const newTeller = {
        ...header,
        currentCustomer: {}
      }
      connectedTellers.push(newTeller)
      break;

    default:
      throw new Error('Unknown client type specified in header!')
  }
  console.log({ connectedCustomers, connectedTellers })
}










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
