#!/usr/bin/env node

const net = require('net')
const { render, handle_input, handle_message } = require('./lib/helpers')
const conn = net.createConnection('./bank.sock')



function connection_ready() {
	render([
		'Hello Teller'
	])
}



handle_input(line => {
	console.log(`Prompt command entered:`, line)
})



handle_message(conn, ({header, message}) => {
  console.log({ header, message })
	// console.log('Message received:', message)
})










conn.on('ready', connection_ready)

conn.on('close', () => {
	console.log('connection closed')
	process.exit(1)
})

conn.on('error', () => {
	console.log('No connection')
	process.exit(1)
})