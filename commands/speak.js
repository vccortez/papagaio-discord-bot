exports.run = async (client, message, args) => {
  const content = client.chatter.format(args.join(' '))

  await client.chatter.chat(content, message)

  client.chatter.save(content)
}
