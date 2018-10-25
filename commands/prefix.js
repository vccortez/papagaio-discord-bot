exports.run = async (client, message, args) => {
  if (!args || args.length < 1) return

  if (message.author.id !== client.config.owner) {
    return client.chatter.type('you cannot tell me what to do !', message)
  }

  const prefix = args[0]

  client.settings.set(message.guild.id, prefix, 'prefix')

  return client.chatter.type(`prefix set to \`${prefix}\``, message)
}
