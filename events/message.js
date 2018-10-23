module.exports = async (client, message) => {
  if (!message.guild || message.author.bot || message.system) return

  if (!client.settings.has(message.guild.id)) {
    client.settings.set(message.guild.id, {})
  }

  const combinedSettings = {}
  const defaults = client.config.defaultSettings
  const guilds = client.settings.get(message.guild.id)
  Object.keys(defaults).forEach((key) => {
    combinedSettings[key] = guilds[key] || defaults[key]
  })

  const settings = message.settings = combinedSettings

  if (!message.content.startsWith(settings.prefix)) {
    const prefixMention = new RegExp(`^<@!?${client.user.id}>( |)$`)
    const mention = new RegExp(`<@!?${client.user.id}>`)

    if (message.content.match(prefixMention)) {
      await message.channel.send(`my current prefix is \`${settings.prefix}\``)
    } else if (message.content.match(mention)) {
      const content = client.chatter.format(message.content.split(mention).join(''))
      await client.chatter.chat(content, message)
      client.chatter.save(content)
    } else {
      const content = client.chatter.format(message.content)
      client.chatter.save(content)
      if (Math.floor(Math.random() * (100 - 1)) + 1 < settings.rate) {
        await client.chatter.chat(content, message)
      }
    }

    return
  }

  const args = message.content.slice(settings.prefix.length).trim().split(/\s+/g)
  const cmdName = args.shift().toLowerCase()

  const command = client.commands.get(cmdName)

  if (!command) return

  await command.run(client, message, args)
}