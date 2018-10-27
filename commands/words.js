exports.run = async (client, message) => {
  const words = Object.keys(client.chatter.model.getDB()).length

  return client.chatter.type(`I have learned \`${words}\` words`, message)
}

exports.meta = {
  name: 'words',
  category: 'chatter',
  description: 'shows amount of words learned',
  usage: '',
  aliases: ['w'],
  level: 0
}
