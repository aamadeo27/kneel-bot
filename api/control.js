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
				store.dispatch(actions.loggedIn(body))
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
			if ( err ) {
				callback()
				return handler(err, store)
			}

			body = JSON.parse(body)
			
			callback()
		})
	},
	
	spawn(store, unit, slot, jar, callback){
		const reqData = { 
			url: urls.spawn,
			jar,
			form: { name: unit, slot }
		}
		
		request.post( reqData, (err, response, body) => {
			if ( err ) {
				callback()
				return handler(err, store)
			}

			try {
				body = JSON.parse(body)
				store.dispatch(actions.updateVillage(body))
			} catch(err){
				handler(body, store)
			}
			
			callback()
		})
	},
	
	build(store, jar, spec, callback){
		
		const reqData = { url: urls.build, form: spec, jar }
		
		request.post( reqData, (err, response, body) => {
			if ( err ) {
				callback()
				return handler(err, store)
			}

			try {
				body = JSON.parse(body)
				store.dispatch(actions.updateVillage(body))
			} catch(err){
				handler(body, store)
			}
			
			callback()
		})
	},
	
	upgradeBuilding(store, jar, spec, callback){
		const reqData = { url: urls.upgradeBuilding, form: spec, jar }
		
		request.post( reqData, (err, response, body) => {
			if ( err ) {
				callback()
				return handler(err, store)
			}
			
			try {
				body = JSON.parse(body)
				store.dispatch(actions.updateVillage(body))
			} catch(err){
				handler(body, store)
			}
			
			callback()
		})
	},
	
	upgradeOccupation(store, jar, occupation, callback){
		const reqData = { 
			url: urls.upgradeOccupation, 
			form: { occupation, slot: 12},
			jar 
		}
		
		request.post( reqData, (err, response, body) => {
			if ( err ) {
				callback()
				return handler(err, store)
			}
			
			try {
				body = JSON.parse(body)
				store.dispatch(actions.updateVillage(body))
			} catch(err){
				handler(body, store)
			}
			
			console.log("UpgradeOccupationResponse", body)
			
			callback()
		})
	},
	
	trade(store, spec, jar, callback){
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
			if ( err ) {
				callback()
				return handler(err, store)
			}
			
			store.dispatch(actions.updateVillage(body))
			
			callback()
		})
	},
	
	attack(store, mission, jar, callback){

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
			if ( err ) {
				callback()
				return handler(err, store)
			}
			
			handler(body)
			store.dispatch(actions.updateVillage(body))
			
			info.load(store, jar, 'Missions', callback)
		})
	}
}
