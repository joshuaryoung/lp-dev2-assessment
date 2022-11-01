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
      handle_handshake(header, conn)
      return
    }

    const isCustomer = header.type === 'customer'
    let user
    if (isCustomer) {
      // user = connectedCustomers.find(cust => cust.clientId === header.clientId)
      processCustomerMessage(conn, header, message)
    } else {
      // user = connectedTellers.find(tell => tell.clientId === header.clientId)
    }
    // console.log({ header })
		// server_send_message(conn, `The bank is ${connectedTellers.length ? 'open' : 'closed'}.`)
	})


	conn.on('close', () => {
		console.log('client disconnected')
	})
})

function handle_handshake(header, conn) {
  switch (header.type) {
    case 'customer':
      const newCustomer = {
        ...header,
        conn,
        account: {
          balance: 100,
          status: 'Active'
        },
        currentTeller: {},
        chat_log: []
      }
      connectedCustomers.push(newCustomer)
      const place_in_line = connectedCustomers.findIndex(el => el.clientId === header.clientId)
      const { chat_log } = newCustomer
      send_update_to_customer(conn, place_in_line, chat_log)
      connectedTellers.forEach(el => send_update_to_teller(el.conn, connectedCustomers))
      break;
  
    case 'teller':
      const newTeller = {
        ...header,
        conn,
        currentCustomer: {},
        chat_log: []
      }
      connectedTellers.push(newTeller)
      connectedCustomers.forEach(el => send_update_to_customer(el.conn))
      send_update_to_teller(conn, connectedCustomers, newTeller.chat_log)

      break;

    default:
      throw new Error('Unknown client type specified in header!')
  }
  // console.log({ connectedCustomers, connectedTellers })
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

function send_update_to_customer(conn, place_in_line = -1, chat_log = null) {
  const bank_is_open = connectedTellers.length > 0
  const payload = {
    bank_is_open,
    place_in_line,
    chat_log
  }
  const stringified_payload = JSON.stringify(payload)
  server_send_message(conn, `{ "type": "update", "payload": ${stringified_payload} }`)
}

function send_update_to_teller(conn, customers_waiting = null, chat_log = null) {
  const payload = {
    customers_waiting: customers_waiting.map(cust => cust.clientId),
    chat_log
  }
  const stringified_payload = JSON.stringify(payload)
  console.log({ stringified_payload })
  server_send_message(conn, `{ "type": "update", "payload": ${stringified_payload} }`)
}

function processCustomerMessage(conn, { clientId }, message, user) {
  const isBeingServed = connectedTellers.find(tell => tell.currentCustomer.clientId === clientId)
  const bank_is_open = connectedTellers.length > 0

  if (!bank_is_open) {
    server_send_message(conn, 'The bank is closed.')
    return
  }

  if (isBeingServed) {
    // future logic
    return
  }

  server_send_message(conn, 'You are not currently being served.')
}
