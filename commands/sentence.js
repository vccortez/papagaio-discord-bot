exports.run = async (client, message, args, level) => {
  const cLength = message.settings.sentence

  if (!args || args.length < 1) {
    return client.chatter.type(`my average sentence length is \`${cLength}\``, message)
  }

  if (level < 1) {
    return client.chatter.type('you cannot tell me what to do !', message)
  }

  const length = parseInt(args[0], 10)

  if (!length || length < 8 || length > 20) {
    client.logger.bot(`invalid value : ${length}`, 'sentence')
    return client.chatter.type('send me a number between `8` and `20` !', message)
  }

  client.settings.set(message.guild.id, length, 'sentence')
  client.logger.bot(`updated value : ${length}`, 'sentence')

  return message.channel.send(`updated sentence length to \`${length}\``, message)
}

exports.meta = {
  name: 'sentence',
  category: 'chatter',
  description: 'shows bot answer length',
  usage: '[number]',
  aliases: ['s'],
  level: 1
}
