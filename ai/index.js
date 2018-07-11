const clear = require('clear')

const { login } = require('../api/control')
const logger = require('../logger')
const info = require('../api/info')
const actions = require('../redux/actions')
const { 
	UPDATE_MAP, 
	UPDATE_DIPLOMACY 
} = require('../redux/actions').constants

const executors = require('./executors')
const analytics = require('./analytics')

const militarAnalyzer = (store) => {
	const interval = 10 * 1000
	
	const { 
		cells, 
		missions,
		diplomacy,
		village,
		user,
	} = store.getState()
	
	/*
		Normalizar los tamaños de saqueos
			Gather: Cantidad de tropas Totales
			O
			Modificar MinTroops
			
		** Depende de utilizar common.js para sacar calculos de tropas
	*/
	
	
	setTimeout(() => militarAnalyzer(store), interval)
}

const mapAnalyzer = (store) => {
	const { 
		cells, 
		lastAction, 
		diplomacy, 
		user,
	} = store.getState()
	
	if ( lastAction !== UPDATE_MAP && lastAction !== UPDATE_DIPLOMACY ) return
	
	if ( ! diplomacy.allies ) return
	
	const enemies = cells.filter( c =>
		c.owner !== user &&
		! diplomacy.allies.find( a => a === c.owner ) &&
		c.raidable
	)

	//logger.log('MapAnalysis')

	store.dispatch(actions.addTargets(enemies))
	
}

const mapDiscovery = (store, jar) => {
	const { intervals } = store.getState().config
	
	if ( store.getState().loggedIn ) {
		info.discoverMap(store, jar)
	}

	setTimeout(() => mapDiscovery(store, jar), intervals.discovery)
}

const update = (store, jar) => {
	const { 
		loggedIn,
		config
	} = store.getState()
	
	if ( loggedIn ){
		const timestamp = new Date().toGMTString()
		logger.log(`[${timestamp}] Updating`)
		
		const data = [
			'Village', 'Params', 'Tasks', 'Missions', 'Map', 'Diplomacy'
		]
		
		const params = store.getState().params
		
		data.forEach( d => {
			if ( d === 'Params' && params.costs ) return
			info.load(store, jar, d)
			logger.log('Loading ', d)
		})
		
		info.loadUserInfo(store, jar)
		
	} else {
		logger.log('Loggin in')
		login(store, jar)
	}
	
	setTimeout(() => update(store, jar), config.intervals.update)
}

let lastExecutedOrder = undefined
const executeOrder = (store, jar) => {
	const state = store.getState()
	const {
		userInfo,
		loggedIn, 
		village, 
		lastAction,
		orders,
		saveFor,
		executingOrder,
		lastRemovedOrder,
		discoverRadius,
		targets,
		missions,
		config,
		params
	} = state
	
	let interval = config.intervals.execute
	const {user} = userInfo

	if ( loggedIn ){
		clear()
		const timestamp = new Date().toGMTString()
		
		
		if ( config.verbose ){
			let resources = ''
			for( r in village.resources ){
				let { r0, rps } = village.resources[r]
				let type = r.substring(0,1)						 

				resources += `${Math.round(rps*3600)}${type}ph (${Math.round(r0)}${type}) `
			}

			let troops = '\nTroops:\n'
			for( t in village.troops ){
				let { count } = village.troops[t]			 
				troops += `\t${count} ${t}\n`
			}
			
			console.log("Villages: ", userInfo.villages )
			console.log(resources)
			console.log(troops)
			console.log("Orders: {\n", orders.map(o => o.type).join(",\n"), "\n}")
		}
		
		console.log("Occupations: ", village.occupations )
		console.log("Minimum Troops to attack", config.minAttack)
		console.log("Minimum Troops to defend", config.minDefense)
		console.log("Saving for: " + saveFor )
		console.log("discoverRadius: " + discoverRadius )
		console.log("Targets: ", targets.length )
		console.log("Missions: ", missions.length )
		console.log("Points: ", userInfo.points )
		console.log("dt: ", interval )

		if ( village.village ){
			if ( orders.length > 0 ) {
				const order = orders[0]
				
				console.log({
					order: order.id,
					lastExecutedOrder,
					lastRemovedOrder
				})
				
				if ( order.id !== lastExecutedOrder ) {
					console.log("Executing order:", order)
					executors[order.type](order, store, jar)
					lastExecutedOrder = order.id
				} else {
					console.log("Executing order")
				}
			} else if ( ! executingOrder ) {
				console.log('+++++ Running analysis')
				const order = analytics.nextOrder(state)
				
				if ( order ) {
					console.log("New Order: ", order)
					store.dispatch(actions.newOrder(order))
					//interval = 1
				}
			}
		}
	}
	
	setTimeout(() => executeOrder(store, jar), interval)
}

module.exports = (store, jar) => {
	update(store, jar)
	executeOrder(store, jar)
	mapDiscovery(store, jar)
	store.subscribe( () => mapAnalyzer(store))
}
