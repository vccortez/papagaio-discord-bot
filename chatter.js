const Markov = require('markov')
const slug = require('slug')
const emojiRegex = require('emoji-regex')
const emojiMap = require('emoji-unicode-map')
const fs = require('fs')

const { randomInt } = require('./util')

const emojiPattern = emojiRegex()

module.exports = function (client, done) {
  const data = 'data.log'
  const dataStream = fs.createWriteStream(data, { flags: 'a' })

  const model = Markov(1, (s) => {
    // replace emoji with its name
    // replace discord emoji with its name
    // tag punctuation
    return s.toLowerCase()
      .replace(emojiPattern, (m) => {
        return emojiMap.get(m) || 'unknown'
      })
      .replace(/<:(\S+):\S+>/g, '$1')
      .replace(/(\s|^)([\u2000-\u206F\u2E00-\u2E7F¯ツ\\'!"#$%&()*+,\-./:;<=>?@[\]^_`´{|}~]+)(?!\S)/gi, '$1«p:$2»')
      .replace(/([\u00C0-\u00FF\w\u2000-\u206F\u2E00-\u2E7F¯ツ\\'!"#$%&()*+,\-./:;<=>?@[\]^_`´{|}~]+)(?![^«»]*»)/gi, (_, p1) => {
        const s = slug(p1, '_')
        return `«w:${s}»`
      })
  }, (s) => s.split(/\s+/))

  client.chatter = { model, dataStream }

  client.chatter.format = (message) => message.trim().replace(/\s+/g, ' ')

  client.chatter.save = (message, done) => {
    if (message.split(/\s+/).length > 2) {
      client.logger.log('appending new data')
      client.chatter.model.seed(message)
      dataStream.write(message + '\n', done)
    } else {
      (done instanceof Function) && done(true, null)
    }
  }

  client.chatter.chat = async (content, message) => {
    const response = client.chatter.model.respond(content, message.settings.sentence)

    if (response.length === 0) {
      let squawks = randomInt(1, 6)
      return client.chatter.type(`*${new Array(squawks).fill('squawk').join(' ')}*`, message).catch((err) => client.logger.err(err.message))
    }

    const filtered = response.join(' ')
      .replace(/@(everyone|here)/g, '@\u200b$1')
      .replace(/<@!?[0-9]+>/g, (input) => {
        const id = input.replace(/<|!|>|@/g, '')

        const member = message.channel.guild.members.get(id)
        if (member) {
          if (member.nickname) return `@\u200b${member.nickname}`
          return `@\u200b${member.user.username}`
        } else {
          const user = message.client.users.get(id)
          if (user) return `@\u200b${user.username}`
          return input
        }
      })
      .replace(/<@&[0-9]+>/g, (input) => {
        const role = message.guild.roles.get(input.replace(/<|@|>|&/g, ''))
        if (role) return `@\u200b${role.name}`
        return input
      })

    return client.chatter.type(filtered, message).catch((err) => client.logger.err(err.message))
  }

  client.chatter.type = async (text, message) => {
    const typingDuration = Math.min(text.length * 50, 5000)

    message.channel.startTyping()

    return new Promise((resolve, reject) => {
      client.setTimeout(() => {
        message.channel.stopTyping(true)
        try {
          resolve(message.channel.send(text))
        } catch (err) {
          client.logger.err(err.message, err.stack)
          reject(err)
        }
      }, typingDuration)
    })
  }

  client.chatter.model.seed(fs.createReadStream(data), done)
}
