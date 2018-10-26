exports.run = async (client, message, args) => {
  const content = client.chatter.format(args.join(' '))

  client.chatter.save(content)

  if (randomInt(1, 100) <= message.settings.rate) {
    return client.chatter.chat(content, message)
  }
}

function randomInt (min, max) {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min + 1)) + min
}
