const config = require('../config')
const urls = require('./urls')
const { loggedIn } = require('../redux/actions')
const request = require('request')
const actions = require('../redux/actions')
const handler = require('./handler')

module.exports = {
	loadVillage(store, jar){
		const reqData = { url: urls.village, jar }
		
		request.get( reqData, (err, response, body) => {
			if ( err ) return handler(err, store)

			body = JSON.parse(body)
			store.dispatch(actions.updateVillage(body))
		})
	},
	
	load(store, jar, item, callback){
		const reqData = { url: urls[item], jar }
		const action = actions['update' + item]

		request.get( reqData, (err, response, body) => {
			if ( err ) {
				console.log(err)
				if ( callback ) callback()
				return handler(err, store)
			}

			body = JSON.parse(body)
			store.dispatch(action(body))
			
			if ( callback ) callback()
		})
	},
	
	loadUserInfo(store, jar, callback){
		const { user } = store.getState().userInfo
		
		const reqData = {
			url: urls.users + "/" + user + "/",
			jar
		}
		
		request.get(reqData, (err, response, body) => {
			if ( err ) return handler(err, store)

			body = JSON.parse(body)

			store.dispatch(actions.updateUserInfo(body))
			
			if ( callback ) callback()
		})
	},
	
	discoverMap(store, jar){
		const {
			userInfo,
			discoverRadius
		} = store.getState()
		
		const { location : {x, y} } = userInfo
		
		const dR = Math.min( 
			(discoverRadius||config.minDiscoverRadius), 
			config.maxDiscoverRadius
		)
		
		console.log({ discoverRadius })
		
		for( let dx = -dR ; dx <= dR; dx++ ){
			for( let dy = -dR ; dy <= dR; dy++ ){
				if ( dx === dy && dx === 0 ) continue

					let queryParams = `?x=${x+5*dx}&y=${y+5*dy}`
					let url = urls.Map + queryParams
					let reqData = { url , jar }

					request.get( reqData, (err, response, body) => {
						if ( err ) return handler(err, store)

						body = JSON.parse(body)

						store.dispatch(actions.updateMap(body))
					})
			}
		}
	},
	
	getParams(store, jar){
		const reqData = { url: urls.params, jar }
		
		request.get( reqData, (err, response, body) => {
			if ( err ) return handler(err, store)

			body = JSON.parse(body)
			store.dispatch(actions.updateParams(body))
		})
	}
}
