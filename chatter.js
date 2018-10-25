const Markov = require('markov')
const slug = require('slug')
const { Tail } = require('tail')
const emojiRegex = require('emoji-regex')
const emojiMap = require('emoji-unicode-map')
const fs = require('fs')

const emojiPattern = emojiRegex()

module.exports = function (client) {
  const logs = 'data.txt'
  const tailed = new Tail(logs)
  const wstream = fs.createWriteStream(logs, { flags: 'a' })

  const markov = Markov(1, (s) => {
    // replace emoji with its name
    // replace discord emoji with its name
    // tag punctuation
    return s.toLowerCase()
      .replace(emojiPattern, (m) => {
        return emojiMap.get(m) || 'unknown'
      })
      .replace(/<:(\S+):\S+>/g, '$1')
      .replace(/(\s|^)([\u2000-\u206F\u2E00-\u2E7F¯ツ\\'!"#$%&()*+,\-./:;<=>?@[\]^_`´{|}~]+)(?!\S)/gi, '$1«p:$2»')
      .replace(/([\u00C0-\u00FF\w\u2000-\u206F\u2E00-\u2E7F¯ツ\\'!"#$%&()*+,\-./:;<=>?@[\]^_`´{|}~]+)(?![^«»]*»)/gi, (m, p1) => {
        const s = slug(p1, '_')
        return `«w:${s}»`
      })
  }, (s) => s.split(/\s+/))

  client.chatter = { markov, wstream, tailed }

  client.chatter.format = (content) => content.replace(/\s+/g, ' ').trim()
  client.chatter.save = (content) => content.split(/\s+/).length > 2 && client.chatter.wstream.write(`${content}\n`)
  client.chatter.chat = async (content, message) => {
    const answer = client.chatter.markov.respond(content, message.settings.sentence).join(' ')

    client.chatter.type(answer, message)
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

  tailed.on('line', (data) => {
    client.logger.log('feeding new line')
    client.chatter.markov.seed(data)
  })
  tailed.watch()

  client.chatter.markov.seed(fs.createReadStream(logs), () => {
    client.logger.log('read initial chatter file')
  })
}
