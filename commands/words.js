exports.run = async (client, message) => {
  const words = Object.keys(client.chatter.markov.getDB()).length

  message.channel.send(`I have learned ${words} words`)
}