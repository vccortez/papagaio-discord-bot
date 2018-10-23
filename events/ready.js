module.exports = async (client) => {
  client.logger.bot(`connected as ${client.user.username}#${client.user.discriminator} (${client.user.id})`, 'ready')
  
  try {
    const presence = await client.user.setActivity('todo mundo', { type: 'WATCHING' })
    client.logger.log('presence updated')
  } catch (err) {
    client.logger.err(err.message)
  }
}