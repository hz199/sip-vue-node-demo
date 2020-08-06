module.exports = {
  env: 'development',
  app: {
    debug: true,
    port: 8788,
    keys: ['keys-sindrax-admin', 'keykeys-sindrax-admin'],
    sessionKey: 'session-key'
  },
  // redis: {
  //   host: '127.0.0.1',
  //   port: '6379'
  // },
  proxy: {
    host: 'http://192.168.1.101:8080',
    port: '',
    prefix: '/api'
  }
}
