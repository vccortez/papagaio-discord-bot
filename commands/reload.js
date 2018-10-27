exports.run = async (client, message, args, level) => {
  if (!args || args.length < 1) return

  if (level < 2) {
    return client.chatter.type('you cannot tell me what to do !', message)
  }

  const cmdName = args[0]

  if (!client.commands.has(cmdName)) return

  delete require.cache[require.resolve(`./${cmdName}.js`)]
  client.commands.delete(cmdName)

  const cmdData = require(`./${cmdName}.js`)
  client.commands.set(cmdName, cmdData)
  return client.chatter.type(`the \`${cmdName}\` command has been reloaded`, message)
}

exports.meta = {
  name: 'reload',
  category: 'guild',
  description: 'reloads given command',
  usage: '[command]',
  aliases: [],
  level: 2
}
