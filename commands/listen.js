const { randomInt } = require('../util')

exports.run = async (client, message, args) => {
  const content = client.chatter.format(args.join(' '))

  client.chatter.save(content, () => {
    if (randomInt(1, 100) <= message.settings.rate) {
      client.logger.log('listen answered')
      return client.chatter.chat(content, message)
    }
  })
}
