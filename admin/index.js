const express = require('express')
const bodyParser = require('body-parser')
const compression = require('compression')
const path = require('path')
const fs = require('fs')
const app = express()
const actions = require('../redux/actions')

const admin = store => ({
	init(){

		app.use(bodyParser.json())
		app.use(bodyParser.urlencoded({
						extended: false
		}))
		
		app.use((req, res, next) => {
			// Website you wish to allow to connect
			res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000')
			// Request methods you wish to allow
			res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE')
			// Request headers you wish to allow
			res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type')
			
			next()
		})

		app.use(express.static( path.join(__dirname, 'public')))
		
		app.get('/state', (req, res) => {
			console.log("========================================================>")
			res.send(JSON.stringify(store.getState()))
			res.end()
		})
		
		app.put('/config', (req, res) => {
			console.log("=======================CONFIG_UDPATE===================================>\n", req.body)
			try {
				store.dispatch(actions.updateConfig(req.body))
			} catch (err){
				console.error(err)
			}
			res.send('{ "status" : 0 }')
			res.end()
		})
		
		app.listen(7777, () => {
			console.log('Admin is running in http://localhost:7777')
		})
	}
})

module.exports = admin