exports.run = async (client, message) => {
  const words = Object.keys(client.chatter.model.getDB()).length

  return client.chatter.type(`I have learned \`${words}\` words`, message)
}
