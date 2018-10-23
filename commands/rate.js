exports.run = async (client, message, args) => {
  const cRate = message.settings.rate

  if (!args || args.length < 1) {
    return await message.channel.send(`there is a ${cRate}% chance I reply to a message`)
  }

  if (message.author.id !== client.config.owner) {
    return await message.channel.send('you cannot tell me what to do !')
  }

  const rate = parseInt(args[0], 10)

  if (!rate || rate < 1 || rate > 50) {
    client.logger.bot(`invalid value : ${rate}`, 'rate')
    return await message.channel.send('send me a number between 1 and 50 !')
  }

  client.settings.set(message.guild.id, rate, 'rate')
  client.logger.bot(`updated value : ${rate}`, 'rate')
  await message.channel.send(`updated reply chance to ${rate}%`)
}