#!/usr/bin/env node

const net = require('net')
const { render, handle_input, handle_message, handle_handshake, isHandshakeMessage, client_send_message, handle_update, isUpdateMessage } = require('./lib/helpers')
const conn = net.createConnection('./bank.sock')
let currently_serving = 0
let currently_waiting = []
let current_chat_log


function connection_ready() {
	render([
    'Good Morning.',
    ...render_teller_header_info()
	])
}



handle_input(line => {
  const messageHeader = createHeader()
	client_send_message(conn, line, messageHeader)
})



handle_message(conn, message => {
  let message_to_display = message
  if (message && typeof message === 'string' && isHandshakeMessage(message)) {
    handle_handshake(conn, message, createHeader)
    return
  } else if (message && typeof message === 'string' && isUpdateMessage(message)) {
    const { payload } = handle_update(message) || { payload: {} }
    
    if (payload.chat_log != null && payload.chat_log != undefined) {
      current_chat_log = payload.chat_log
    }
    if (payload.customers_waiting != null && payload.customers_waiting != undefined) {
      currently_waiting = payload.customers_waiting
    }
    
    message_to_display = ''
  }

  debugger

  // const screen = [
  //   `The Bank is ${bank_is_open ? green('open') : red('closed')}.`
	// ]

	render([
    ...render_teller_header_info()
	])
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

function createHeader () {
  const messageHeader = {
    clientId: conn.id,
    type: 'teller'
  }

  return messageHeader
}

function render_teller_header_info() {
  debugger
  return [
    currently_serving > 0 ? `You` : 'You are not serving any customers.',
    `You have ${currently_waiting.length} customers waiting in line.`,
    ''
  ]
}