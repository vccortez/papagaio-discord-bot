exports.run = async (client, message, args) => {
  if (!args || args.length < 1) return

  if (message.author.id !== client.config.owner) {
    return await message.channel.send('you cannot tell me what to do !')
  }
  
  const cmdName = args[0]

  if (!client.commands.has(cmdName)) return

  delete require.cache[require.resolve(`./${cmdName}.js`)]
  client.commands.delete(cmdName)

  const cmdData = require(`./${cmdName}.js`)
  client.commands.set(cmdName, cmdData)
  await message.channel.send(`the ${cmdName} command has been reloaded`)
}