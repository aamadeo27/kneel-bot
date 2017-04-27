const config = require('../config')
const urls = require('./urls')
const { loggedIn } = require('../redux/actions')
const request = require('request')
const actions = require('../redux/actions')
const info = require('./info')
const handler = require('./handler')

module.exports = {
	login(store, jar){
		const reqData = { url: urls.login, form: config.login, jar }
		
		request.post( reqData, (err, response, body) => {
			if ( err ) {
				console.log("Error al intentar el login", Object.assign({}, err))
				return handler(err, store)
			}

			body = JSON.parse(body)

			if ( ! body.authenticated ){
				return console.log("Error al intentar el login", body)
			} else {
				store.dispatch(actions.loggedIn(body.user, body.location))
			}
		})
	},
	
	moveWorker(store, jar, occupation, workers, callback){
		const reqData = { 
			url: urls.moveWorker,
			jar,
			form: { occupation, workers }
		}
		
		request.put( reqData, (err, response, body) => {
			if ( err ) return handler(err, store)

			body = JSON.parse(body)
			
			callback()
		})
	},
	
	spawn(unit, slot, jar, callback){
		const reqData = { 
			url: urls.spawn,
			jar,
			form: { name: unit, slot }
		}
		
		console.log(reqData.form)
		
		request.post( reqData, (err, response, body) => {
			if ( err ) return handler(err, store)

			body = JSON.parse(body)
			
			
			
			callback()
		})
	},
	
	build(jar, spec, callback){
		
		const reqData = { url: urls.build, form: spec, jar }
		
		request.post( reqData, (err, response, body) => {
			if ( err ) return handler(err, store)

			body = JSON.parse(body)
			//console.log("BuildResponse", body)
			
			callback()
		})
	},
	
	upgradeBuilding(jar, spec, callback){
		const reqData = { url: urls.upgradeBuilding, form: spec, jar }
		
		request.post( reqData, (err, response, body) => {
			if ( err ) return handler(err, store)

			body = JSON.parse(body)
			console.log("UpgradeResponse", body)
			
			callback()
		})
	},
	
	trade(spec, jar, callback){
		const reqData = { 
			url: urls.trade, 
			jar,
			json: true,
			headers: {
					"content-type": "application/json",
			},
			body: spec
		}
		
		request.post( reqData, (err, response, body) => {
			if ( err ) return handler(err, store)
			
			callback()
		})
	},
	
	attack(mission, store, jar, callback){

		const reqData = { 
			url: urls.Missions, 
			jar,
			json: true,
			headers: {
				"content-type": "application/json",
			},
			body: mission
		}
		
		request.post( reqData, (err, response, body) => {
			if ( err ) return handler(err, store)
			
			store.dispatch(actions.updateVillage(body))
			
			info.load(store, jar, 'Missions', callback)
		})
	}
}
