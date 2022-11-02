#!/usr/bin/env node

const { randomUUID } = require('crypto')
const net = require('net')
const { render, handle_input, handle_message, client_send_message, red, isHandshakeMessage, handle_handshake, isUpdateMessage, parse_json, green, parseChatLog } = require('./lib/helpers')
const conn = net.createConnection('./bank.sock')
const clientId = randomUUID()
let bank_is_open = false
let chat_log
let place_in_line = -1
let being_served_by = null

function connection_ready() {
  render([
    `The Bank is ${bank_is_open ? 'open' : red('closed')}.`,
    ''
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
  let message_to_display = message
  if (message && typeof message === 'string' && isHandshakeMessage(message)) {
    handle_handshake(conn, message, createHeader)
    return
  } else if (message && typeof message === 'string' && isUpdateMessage(message)) {
    const { payload } = parse_json(message) || { payload: {} }
    bank_is_open = payload.bank_is_open
    if (payload.chat_log != null && payload.chat_log != undefined) {
      chat_log = payload.chat_log
    }
    if (payload.served_by != null && payload.served_by != undefined) {
      being_served_by = payload.served_by
    }
    if (payload.place_in_line != -1) {
      place_in_line = payload.place_in_line
    }
    
    message_to_display = ''
  }

  const screen = [
    `The Bank is ${bank_is_open ? green('open') : red('closed')}.`
	]

  let place_text = ['']
  if (bank_is_open && place_in_line != -1) {
    switch (true) {
      case place_in_line === 0:
        place_text = [ being_served_by ? `Teller #${being_served_by.slice(-4)} is now serving you!` : 'You are the next customer to be served.', '']
        break;
    
      case place_in_line === 1:
        place_text = ['There is 1 customer in line ahead of you.', '']
        break;
    
      case place_in_line > 1:
        place_text = [`There are ${place_in_line} customers in line ahead of you.`, '']
        break;
    
      default:
        break;
    }
  }
  screen.push(...place_text)
  if (message_to_display) {
    screen.push(`[ SYSTEM ] ${message_to_display}`, '')
  }
  if (chat_log && chat_log.length) {
    const parsedChatLog = parseChatLog(chat_log, conn.id, 'Teller')
    screen.push(...parsedChatLog, '')
  }
  render(screen)
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