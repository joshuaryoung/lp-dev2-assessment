#!/usr/bin/env node

const net = require('net')
const { render, handle_input, handle_message, handle_handshake, isHandshakeMessage, client_send_message, parse_json, isUpdateMessage, isServerMessage, parseChatLog } = require('./lib/helpers')
const conn = net.createConnection('./bank.sock')
let currently_serving = 0
let currently_waiting = []
let current_chat_log = []


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
  let server_message = ''
  if (message && typeof message === 'string' && isHandshakeMessage(message)) {
    handle_handshake(conn, message, createHeader)
    return
  } else if (message && typeof message === 'string' && isUpdateMessage(message)) {
    debugger
    const { payload } = parse_json(message) || { payload: {} }
    if (payload.chat_log != null && payload.chat_log != undefined) {
      current_chat_log = payload.chat_log
    }
    if (payload.customers_waiting != null && payload.customers_waiting != undefined) {
      currently_waiting = payload.customers_waiting
    }
    if (payload.currentCustomer != null && payload.currentCustomer != undefined) {
      currently_serving = payload.currentCustomer
    }
    
    message_to_display = ''
  } else if (message && typeof message === 'string' && isServerMessage(message)) {
    const { message } = parse_json(message) || { payload: {} }
  }

  // debugger

  const screen = [
    ...render_teller_header_info()
	]

  if (current_chat_log.length) {
    const parsedChatLog = parseChatLog(current_chat_log, conn.id, 'Customer')
    screen.push('[ CHAT ]', ...parsedChatLog, '')
  }
  if (currently_serving) {
    const { account } = currently_serving
    const headerLine = '[ CUSTOMER ACCOUNT ]'
    const parsedStatus = `Status: ${account.status}`
    const parsedBalance = `Balance: $${account.balance}`
    screen.push(headerLine, parsedStatus, parsedBalance, '')
  }

	render(screen)
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
  return [
    currently_serving ? `You are serving customer #${currently_serving.clientId.slice(-4)}` : 'You are not serving any customers.',
    `You have ${currently_waiting.length} customers waiting in line.`,
    ''
  ]
}