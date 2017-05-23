process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"
//const https = require('https')
const jar = require('request').jar()
const {createStore} = require('redux')
const config = require('./config')
const reducer = require('./redux/reducers')
const store = createStore(reducer, { config })
const admin = require('./admin')

console.log("InitialConfig", config)

const bot = require('./ai')(store, jar)

admin(store).init()
