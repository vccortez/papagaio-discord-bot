module.exports = async (client, message) => {
  if (!message.guild || message.author.bot || message.system) return

  if (!client.settings.has(message.guild.id)) {
    client.settings.set(message.guild.id, {})
  }

  const defaults = client.config.defaultSettings
  const guilds = client.settings.get(message.guild.id)

  const settings = message.settings = { ...defaults, ...guilds }

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

  const command = client.commands.get(cmdName) || client.commands.get(client.aliases.get(cmdName))

  if (!command) {
    client.logger.err(`${cmdName} does not exist`)
    return
  }

  let authorLevel = 0

  if (message.author.id === message.guild.ownerID) {
    authorLevel = 3
  } else {
    let roles = message.guild.roles.filter((r) => settings.admin.includes(r))
    if (roles.size > 0 && roles.some((r) => message.member.roles.has(r.id))) {
      authorLevel = 2
    } else {
      roles = message.guild.roles.filter((r) => settings.mod.includes(r))
      if (roles.size > 0 && roles.some((r) => message.member.roles.has(r.id))) {
        authorLevel = 1
      }
    }
  }

  client.logger.log(`run [ ${command.meta.name} | ${args.length} args | level ${authorLevel} ]`)
  return command.run(client, message, args, authorLevel)
}
