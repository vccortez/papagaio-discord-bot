exports.run = async (client, message, args) => {
  if (!args || args.length < 1) return

  if (message.author.id !== client.config.owner) {
    return await message.channel.send('you cannot tell me what to do !')
  }
  
  const prefix = args[0]

  client.settings.set(message.guild.id, prefix, 'prefix')
  
  await message.channel.send(`prefix set to \`${prefix}\``)
}