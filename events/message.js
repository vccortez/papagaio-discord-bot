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
    const mentions = new RegExp(`<@!?${client.user.id}>`, 'g')

    let content = message.content

    if (mentions.test(content)) {
      content = content.replace(mentions, (_, offset) => offset === 0 ? '' : 'papagaio')
      if (!/[^\s]/.test(content)) {
        content = `${settings.prefix} prefix`
      } else {
        content = `${settings.prefix} speak ${content}`
      }
    } else {
      content = `${settings.prefix} listen ${content}`
    }

    message.content = content
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
