say = (splat...) -> console.log.apply console, splat
die = (splat...) ->
  console.log.apply console, splat
  process.exit 0

SSH_MSG_KEXRSA_PUBKEY = 30
SSH_MSG_KEXRSA_SECRET = 31
SSH_MSG_KEXRSA_DONE = 32

SSH_MSG_GLOBAL_REQUEST = 80
SSH_MSG_REQUEST_SUCCESS = 81
SSH_MSG_REQUEST_FAILURE = 82
SSH_MSG_CHANNEL_OPEN = 90
SSH_MSG_CHANNEL_OPEN_CONFIRMATION = 91
SSH_MSG_CHANNEL_OPEN_FAILURE = 92
SSH_MSG_CHANNEL_WINDOW_ADJUST = 93
SSH_MSG_CHANNEL_DATA = 94
SSH_MSG_CHANNEL_EXTENDED_DATA = 95
SSH_MSG_CHANNEL_EOF = 96
SSH_MSG_CHANNEL_CLOSE = 97
SSH_MSG_CHANNEL_REQUEST = 98
SSH_MSG_CHANNEL_SUCCESS = 99
SSH_MSG_CHANNEL_FAILURE = 100

packet = require "packet"

parser = new packet.Parser

net = require "net"

parser.packet "preamble", "b8z<13,10>|utf8()", (line) ->
  if /^SSH/.test line
    say line
    client.destroy()
  else
    parser.extract "preamble"

parser.extract "preamble"

client = net.connect 22, "alvar.balance.south.virginia.runpup.com", ->
client.on "data", (data) -> parser.parse data
