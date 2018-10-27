exports.run = async (client, message, args, level) => {
  if (!args || args.length < 1) {
    return client.chatter.type(`my current prefix is \`${message.settings.prefix}\``, message)
  }

  if (level < 1) {
    return client.chatter.type('you cannot tell me what to do !', message)
  }

  const prefix = args[0]

  client.settings.set(message.guild.id, prefix, 'prefix')

  return client.chatter.type(`prefix set to \`${prefix}\``, message)
}

exports.meta = {
  name: 'prefix',
  category: 'guild',
  description: 'shows bot prefix',
  usage: '[prefix]',
  aliases: ['p'],
  level: 0
}
