exports.run = async (client, message) => {
  const reply = await message.channel.send('ping')
  reply.edit(`pong! bot latency : ${reply.createdTimestamp - message.createdTimestamp}ms. API latency : ${Math.round(client.ping)}ms`)
}