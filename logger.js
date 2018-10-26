function log (tag, ...message) {
  console.log(`[${tag}] :: `, ...message)
}

exports.log = (...message) => log('debug', ...message)
exports.bot = (...message) => log('event', ...message)
exports.err = (...message) => log('error', ...message)
