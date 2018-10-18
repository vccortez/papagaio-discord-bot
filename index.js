const Discord = require('discord.js')
const markov = require('markov')
const slug = require('slug')
const { Tail } = require('tail')
const emojiRegex = require('emoji-regex')
const emojiMap = require('emoji-unicode-map')
const StreamCat = require('stream-concat')
const { oneLine } = require('common-tags')
const fs = require('fs')
const http = require('http')

const emojiPattern = emojiRegex()

const { BOT_TOKEN, BOT_PREFIX, BOT_OWNERID, PORT } = process.env

const m = markov(1,
  function (s) {
    return s.toLowerCase()
    // replace emoji with its name
      .replace(emojiPattern, (m) => {
        return emojiMap.get(m) || 'unknown'
      })
    // replace discord emoji with its name
      .replace(/<:(\S+):\S+>/g, '$1')
    // tag punctuation
      .replace(/(\s|^)([\u2000-\u206F\u2E00-\u2E7F¯ツ\\'!"#$%&()*+,\-.\/:;<=>?@\[\]^_`´{|}~]+)(?!\S)/gi, '$1«p:$2»')
      .replace(/([\u00C0-\u00FF\w\u2000-\u206F\u2E00-\u2E7F¯ツ\\'!"#$%&()*+,\-.\/:;<=>?@\[\]^_`´{|}~]+)(?![^«»]*\»)/gi, (m, p1) => {
        const s = slug(p1, '_')
        return `«w:${s}»`
      })
  },
  function (s) {
    return s.split(/\s+/)
  }
)

const initialSeed = 'the-office-us.txt'
const dataFile = 'data.txt'

const file = new Tail(dataFile)
tag = '[papagaio]'


file.watch()
file
  .on('line', (data) => {
    console.log(`${tag} :: reading read stream data ...`)
    m.seed(data)
    saveModel()
  })

const wstream = fs.createWriteStream(dataFile, { flags: 'a' })

const client = new Discord.Client()

let prefix = BOT_PREFIX, mentionRegex, seedFiles = [initialSeed, dataFile], seedIdx = 0, keys = 0, answerRate = 1

const nextStream = () => {
  if (seedIdx === seedFiles.length) {
    return null
  }
  return fs.createReadStream(seedFiles[seedIdx++])
}

m.seed(new StreamCat(nextStream), () => {
  console.log(`${tag} :: read initial seeding file`)
  saveModel()
  setupClient()
  client.login(BOT_TOKEN)
})

function setupClient() {
  client
    .on('error', console.error)
    .on('warn', console.warn)
    .on('debug', console.log)
    .on('ready', () => {
      console.log(`Client ready logged in as ${client.user.username}#${client.user.discriminator} (${client.user.id})`)

      mentionRegex = new RegExp(`[@]?${client.user.username}`, 'i')

      client.user.setActivity('every word you type', { type: 'WATCHING' })
        .then((presence) => console.log(`${tag} :: set presence to`, presence.game ? presence.game.name : 'none'))
        .catch(console.error)

    })
    .on('disconnect', () => { console.warn('Disconnected!') })
    .on('reconnecting', () => { console.warn('Reconnecting...') })
    .on('message', async (msg) => {
      if (msg.system || msg.author.bot) {
        return
      }

      let content = msg.cleanContent

      if (content.indexOf(prefix) === 0) {
        const arg = content.slice(prefix.length).trim().split(/\s+/g)
        const cmd = arg.shift().toLowerCase()

        switch (cmd) {
          case "ping":
            const m = await msg.channel.send('ping?')
            m.edit(`pong! bot latency : ${m.createdTimestamp - msg.createdTimestamp}ms. API latency : ${Math.round(client.ping)}ms`)
            break
          case "reply-chance":
            if (arg.length === 0) {
              await send(msg, `right now I reply to ${answerRate}% of the messages`)
              return
            }

            if (msg.author.id !== BOT_OWNERID) {
              await send(msg, 'you do not have the permission to set this')
              return
            }

            const rate = parseInt(arg[0], 10)
            if (!rate || rate < 1 || rate > 50) {
              console.log(`${tag} :: cmd=answer invalid rate`)
              await send(msg, 'send me a number between 1 and 50 !')
              return
            } else {
              console.log(`${tag} :: cmd=answer update rate to ${rate}`)
              await send(msg, `updated reply chance to ${rate}%`)
              answerRate = rate
            }
        }
      }
      else if (msg.isMentioned(client.user)) {
        content = clean(content.split(mentionRegex).join(''))

        await talk(content, msg)

        write(content)
      }
      else {
        content = clean(content)

        write(content)

        if (getRandomInt(0, 100) < answerRate) {
          await talk(content, msg)
        }
      }
    })
}

async function talk(ct, msg) {
  let answer = m.respond(ct, 21).join(' ')

  await msg.channel.startTyping()

  setTimeout(async () => {
    await msg.channel.stopTyping(true)
    await send(msg, answer)
  }, 2000)
}

async function send(msg, text) {
  await msg.channel.send(text)
    .catch((err) => console.error(`${tag} :: message blocked => ${text}`))
}

function write(ct) {
  if (ct.split(/\s+/).length > 2) {
    wstream.write(ct + '\n')
  }
}

function clean(str) {
  return str.replace(/\s+/g, ' ').trim()
}

function saveModel() {
  const db = m.getDB()
  const dbkeys = Object.keys(db).length

  if (dbkeys !== keys && client.user) {
    keys = dbkeys

    client.user.setActivity(`every word: ${keys} words`, { type: 'WATCHING' })
      .then((presence) => console.log(`${tag} :: update activity`, keys))
      .catch(console.error)
  }

  fs.writeFile('model.json', JSON.stringify(db, null, 2), 'utf8', (err) => {
    if (err) console.error(err.message)
    else console.log(`${tag} :: saved new model`)
  })
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}


const server = http.createServer((req, res) => {
  res.writeHead(200)
  res.end('OK')
})

server.listen(PORT)

process.once('SIGINT', (code) => {
  client.destroy()
  server.close()
  file.unwatch()
  wstream.close()
})
