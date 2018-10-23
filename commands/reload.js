exports.run = async (client, message, args) => {
  if (!args || args.length < 1) return

  const cmdName = args[0]

  if (!client.commands.has(cmdName)) return

  delete require.cache[require.resolve(`./${cmdName}.js`)]
  client.commands.delete(cmdName)

  const cmdData = require(`./${cmdName}.js`)
  client.commands.set(cmdName, cmdData)
  await message.channel.send(`the ${cmdName} command has been reloaded`)
}