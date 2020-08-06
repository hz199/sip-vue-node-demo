module.exports = {
  env: 'development',
  app: {
    debug: false,
    port: 8788,
    keys: ['keys-sip-demo', 'keykeys-sip-demo'],
    sessionKey: 'session-key'
  },
  // redis: {
  //   host: '127.0.0.1',
  //   port: '6379'
  // },
  proxy: {
    host: '',
    port: '',
    prefix: '/api'
  }
}
