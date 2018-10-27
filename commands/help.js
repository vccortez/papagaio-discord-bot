const { stripIndent } = require('common-tags')

exports.run = async (client, message, args, level) => {
  if (!args[0]) {
    const commands = client.commands.filter((c) => !c.meta.hidden && c.meta.level <= level)

    const names = commands.keyArray()
    const longest = names.reduce((prev, curr) => Math.max(prev, curr.length), 0)

    let output = `= available commands =\n\n[ use '${message.settings.prefix} help <command name>' for more details ]\n`

    const sorted = commands.array().sort((a, b) => a.meta.category > b.meta.category ? 1 : a.meta.category === b.meta.category && a.meta.name > b.meta.name ? 1 : -1)

    let currCategory = ''

    sorted.forEach((c) => {
      if (currCategory !== c.meta.category) {
        currCategory = c.meta.category
        output += `\u200b\n== ${currCategory} ==\n`
      }
      output += `${message.settings.prefix} ${c.meta.name}${' '.repeat(longest - c.meta.name.length)} :: ${c.meta.description}\n`
    })

    return message.channel.send(output, { code: 'asciidoc', split: { char: '\u200b' } })
  } else if (client.commands.has(args[0])) {
    let command = client.commands.get(args[0])
    if (command.meta.level > level) return
    message.channel.send(stripIndent`
      = ${command.meta.name} =
      details :: ${command.meta.description}
      usage   :: ${message.settings.prefix} ${command.meta.name} ${command.meta.usage}
      aliases :: ${command.meta.aliases.join(', ')}
      = ${command.meta.category} =`, { code: 'asciidoc' }
    )
  }
}

exports.meta = {
  hidden: false,
  name: 'help',
  category: 'system',
  description: 'displays available commands',
  usage: '[command]',
  aliases: ['h'],
  level: 0
}
