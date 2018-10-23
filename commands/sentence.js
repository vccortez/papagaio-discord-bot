exports.run = async (client, message, args) => {
  const cLength = message.settings.sentence

  if (!args || args.length < 1) {
    return await message.channel.send(`my average sentence length is \`${cLength}\``)
  }

  const length = parseInt(args[0], 10)

  if (!length || length < 8 || length > 20) {
    client.logger.bot(`invalid value : ${length}`, 'sentence')
    return await message.channel.send('send me a number between \`8\` and \`20\` !')
  }

  client.settings.set(message.guild.id, length, 'sentence')
  client.logger.bot(`updated value : ${length}`, 'sentence')

  await message.channel.send(`updated sentence length to \`${length}\``)
}