exports.run = async (client, message, [action, type, ...values], level) => {
  if (level < 2) {
    return client.chatter.type('you cannot tell me what to do !', message)
  }

  if (!['admin', 'mod'].includes(type)) {
    return client.chatter.type('invalid role', message)
  }

  if (!['set', 'get', 'del'].includes(action)) {
    return client.chatter.type('invalid operation', message)
  }

  client.logger.log('rolename', action, type, values)

  switch (action) {
    case 'set':
      client.settings.set(message.guild.id, values, type)
      return client.chatter.type(`${type} roles set : \`${values.join('`, `')}\``, message)
    case 'get':
      const data = message.settings[type]
      return client.chatter.type(`${type} roles are : \`${data.join('`, `')}\``, message)
    case 'del':
      client.settings.delete(message.guild.id, type)
      return client.chatter.type(`${type} roles reset`, message)
  }
}

exports.meta = {
  hidden: false,
  name: 'rolename',
  category: 'guild',
  description: 'sets management roles',
  usage: '[get|set|del] [admin|mod] [values]',
  aliases: [],
  level: 2
}
