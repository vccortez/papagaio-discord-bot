exports.run = async (client, message, args, level) => {
  const cRate = message.settings.rate

  if (!args || args.length < 1) {
    return client.chatter.type(`there is a \`${cRate}%\` chance I reply to a message`, message)
  }

  if (level < 1) {
    return client.chatter.type('you cannot tell me what to do !', message)
  }

  const rate = parseInt(args[0], 10)

  if (!rate || rate < 1 || rate > 50) {
    client.logger.bot(`invalid value : ${rate}`, 'rate')
    return client.chatter.type('send me a number between `1` and `50` !', message)
  }

  client.settings.set(message.guild.id, rate, 'rate')
  client.logger.bot(`updated value : ${rate}`, 'rate')
  return client.chatter.type(`updated reply chance to \`${rate}%\``, message)
}

exports.meta = {
  name: 'rate',
  category: 'chatter',
  description: 'shows bot answer rate',
  usage: '[number]',
  aliases: ['r'],
  level: 1
}
