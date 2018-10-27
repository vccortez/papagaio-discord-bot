module.exports = async (client, err) => {
  client.logger.err(err.message, err.stack || err.error)
}
