const readline = require('readline')

const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
	prompt: 'LP Bank> ',
})

rl.on('close', () => {
	process.exit(1)
})


function render(lines) {
	clear_screen_and_scrollback()
	process.stdout.write(lines.join("\n") + "\n")

	rl.prompt()
}


function handle_input(handler) {
	rl.on('line', line => {
		handler(line.trim())
	})
}


function clear_screen_and_scrollback() {
	process.stdout.write("\u001b[3J\u001b[2J\u001b[1J");
	process.stdout.cursorTo(0,0)
	process.stdout.clearScreenDown()
}


function red(string) {
	return "\033[31;1m" + string + "\033[0m"
}

function green(string) {
	return "\033[32;1m" + string + "\033[0m"
}

function yellow(string) {
	return "\033[33;1m" + string + "\033[0m"
}

function blue(string) {
	return "\033[34;1m" + string + "\033[0m"
}

const HEADER_TERM = '\u00A0'
function parse_header_and_message(input) {
  if (typeof input != 'string') { throw new Error('Required input of type array not received!') }
  if (!input.includes(HEADER_TERM)) {
    throw new Error('No header received!')
  }
  const [headerStr, message] = input.split(HEADER_TERM)
  let header
  try {
    header = JSON.parse(headerStr)
  } catch (error) {
    throw new error('Header format incorrect!')
  }
  
  return { header, message }
}

const TERM = '\u00A0'
function server_handle_message(conn, handler) {
	let buffer = ''

	function flush() {
    const { message, header } = parse_header_and_message(buffer)

    if (!header) {
      conn.destroy()
      throw new Error('Header not received!')
    }
		handler({ message, header })
		buffer = ''
	}

	conn.on('data', chunk => {
		chunk = chunk.toString()

		if (chunk.charAt(chunk.length - 1) === TERM) {
			buffer += chunk.slice(0, chunk.length - 1)
			flush()
		}
		else {
			buffer += chunk
		}
	})
}

function handle_message(conn, handler) {
	let buffer = ''

	function flush() {
		handler(buffer)
		buffer = ''
	}

	conn.on('data', chunk => {
		chunk = chunk.toString()

		if (chunk.charAt(chunk.length - 1) === TERM) {
			buffer += chunk.slice(0, chunk.length - 1)
			flush()
		}
		else {
			buffer += chunk
		}
	})
}

function server_send_message(conn, message) {
	conn.write(message + TERM)
}

function client_send_message(conn, message, messageHeader) {
  const stringifiedHeader = JSON.stringify(messageHeader)
	conn.write(stringifiedHeader + HEADER_TERM + message + TERM)
}

function isHandshakeMessage(message) {
  return message.includes('"type": "handshake"')
}

function isUpdateMessage(message) {
  return message.includes('"type": "update"')
}

function isServerMessage(message) {
  return message.includes('"type": "server_message"')
}

function handle_handshake(conn, message, createHeader) {
  try {
    const jsonObj = JSON.parse(message)
    if (typeof jsonObj === 'object') {
      const { id } = jsonObj
      conn.id = id
      const _message = `{ "type": "handshake", "id": "${conn.id}" }`
      const messageHeader = createHeader()

      client_send_message(conn, _message, messageHeader)
    }
  } catch (error) {
  }
}

function parse_json(message) {
  const jsonObj = JSON.parse(message)
  return jsonObj
}


module.exports = {
	render,
	handle_input,

	handle_message,
	server_send_message,
  client_send_message,
  server_handle_message,
  isHandshakeMessage,
  handle_handshake,
  isUpdateMessage,
  isServerMessage,
  parse_json,

	red,
	green,
	yellow,
	blue,
}