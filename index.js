const Discord = require('discord.js')
const Enmap = require('enmap')
const path = require('path')
const fs = require('fs')

const client = new Discord.Client()

const { BOT_TOKEN: token, BOT_OWNERID: owner } = process.env
const defaultSettings = require('./settings.json')

client.logger = require('./logger')
client.config = { token, owner, defaultSettings }
client.settings = new Enmap({ name: 'settings' })

client.commands = new Enmap()
client.aliases = new Enmap()

const evtFiles = fs.readdirSync(path.resolve(__dirname, 'events/'))

for (let file of evtFiles) {
  if (!file.endsWith('.js')) continue
  const evtCall = require(`./events/${file}`)
  const evtName = file.split('.')[0]
  client.logger.log(`registering event : ${evtName}`)
  client.on(evtName, evtCall.bind(null, client))
}

const cmdFiles = fs.readdirSync(path.resolve(__dirname, 'commands/'))

for (let file of cmdFiles) {
  if (!file.endsWith('.js')) continue
  let cmdData = require(`./commands/${file}`)
  let cmdName = file.split('.')[0]
  client.logger.log(`loading command : ${cmdName}`)
  client.commands.set(cmdName, cmdData)
}

require('./chatter')(client)

client.login(client.config.token)

process.once('SIGINT', () => {
  client.logger.log('killing', 'sigint')
  client.destroy()
  if (client.chatter) {
    client.chatter.tailed.unwatch()
    client.chatter.wstream.close()
  }
})
