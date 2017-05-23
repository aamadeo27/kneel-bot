const express = require('express')
const bodyParser = require('body-parser')
const compression = require('compression')
const path = require('path')
const fs = require('fs')

const admin = store => ({
	init(){
		const app = express()

		app.use(bodyParser.json())
		app.use(bodyParser.urlencoded({
						extended: false
		}))

		app.use(express.static( path.join(__dirname, 'public')))
		
		app.get('/state', function (req, res) {
			res.send(JSON.stringify(store.getState()))
		})
		
		app.put('/config', (req, res) => {
			console.log("req", req.body)
		})
		
		app.listen(7777, () => {
			console.log('Admin is running in http://localhost:7777')
		})
	}
})

module.exports = admin