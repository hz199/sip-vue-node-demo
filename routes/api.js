const Router = require('koa-router')
const auth = require('../controllers/auth')

const router = new Router()

router.get('/login', auth.login)

module.exports = router
