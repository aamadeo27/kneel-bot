process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"
//const https = require('https')
const jar = require('request').jar()
const {createStore} = require('redux')

const reducer = require('./redux/reducers')
const store = createStore(reducer)
const bot = require('./ai')(store, jar)