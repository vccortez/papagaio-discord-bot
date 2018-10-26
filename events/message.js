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
    const regularMention = new RegExp(`<@!?${client.user.id}>`, 'g')

    if (message.content.match(prefixMention)) {
      message.content = `${settings.prefix} prefix`
    } else if (message.content.match(regularMention)) {
      message.content.replace(regularMention, 'papagaio')
      message.content = `${settings.prefix} speak ${message.content}`
    } else {
      message.content = `${settings.prefix} listen ${message.content}`
    }
  }

  const args = message.content.slice(settings.prefix.length).trim().split(/\s+/g)
  const cmdName = args.shift().toLowerCase()

  const command = client.commands.get(cmdName)

  if (!command) {
    client.logger.err(`attempted to invoke [${cmdName}] command`)
    return
  }

  client.logger.log(`invoking [${cmdName}] command`)
  await command.run(client, message, args)
}
