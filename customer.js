#!/usr/bin/env node

const { randomUUID } = require('crypto')
const net = require('net')
const { render, handle_input, handle_message, client_send_message, red } = require('./lib/helpers')
const conn = net.createConnection('./bank.sock')
const clientId = randomUUID()
const messageHeader = {
  clientId,
  type: 'customer'
}



function connection_ready() {
	render([
		`The Bank is ${red('closed')}.`
	])
}



function connection_closed() {
	console.log('connection closed')
}



handle_input(line => {
	client_send_message(conn, line, messageHeader)
})



handle_message(conn, message => {
	console.log('Message received:', message)
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