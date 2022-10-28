#!/usr/bin/env node

const net = require('net')
const { server_handle_message, server_send_message } = require('./lib/helpers')
const SOCKET = "./bank.sock"

const registeredClients = []

// TCP Server using a Unix socket
const server = net.createServer(conn => {
	console.log('client connected')


	server_handle_message(conn, ({ header, message }) => {
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
