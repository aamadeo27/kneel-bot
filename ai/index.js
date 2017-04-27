const clear = require('clear')

const { login } = require('../api/control')
const logger = require('../logger')
const config = require('../config')
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

	logger.log('MapAnalysis')

	store.dispatch(actions.addTargets(enemies))
	
}

const mapDiscovery = (store, jar) => {
	const interval = 10 * 1000
	
	if ( store.getState().loggedIn ) {
		info.discoverMap(store, jar)
	}

	setTimeout(() => mapDiscovery(store, jar), interval)
}

const update = (store, jar) => {
	const interval = 10 * 1000
	const { 
		loggedIn, 
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
		
	} else {
		logger.log('Loggin in')
		login(store, jar)
	}
	
	setTimeout(() => update(store, jar), interval)
}

let lastExecutedOrder = undefined
const executeOrder = (store, jar) => {
	let interval = 5 * 1000

	const state = store.getState()
	const { 
		loggedIn, 
		user, 
		village, 
		lastAction,
		orders,
		saveFor,
		executingOrder,
		discoverRadius,
		targets,
		missions
	} = state

	if ( loggedIn ){
		clear()
		const timestamp = new Date().toGMTString()

		logger.log(`@${user} : ${lastAction} `)
		console.log("Minimum Troops to attack", config.minTroops)
		console.log("Saving for: " + saveFor )
		console.log("discoverRadius: " + discoverRadius )
		/*
		console.log("Targets: ", targets.map( t => t.id) )
		console.log("Missions: ", missions.map( m => {
			const obj = m.objective.action === 'return' ? m.origin : m.objective
			return obj.id
		}) )
		*/
		
		let resources = ''
		for( r in village.resources ){
			let { r0, rps } = village.resources[r]
			let type = r.substring(0,1)						 

			resources += `${Math.round(rps*3600)}${type}ph (${Math.round(r0)}${type}) `
		}
		console.log(resources)
		
		let troops = '\nTroops:\n'
		for( t in village.troops ){
			let { count } = village.troops[t]			 
			troops += `\t${count} ${t}\n`
		}
		console.log(troops)
		console.log("Orders: {\n", orders.map(o => o.type).join(",\n"), "\n}")

		if ( village.village ){
			if ( orders.length > 0 ) {
				const order = orders[0]
				
				console.log({
					order: order.id,
					lastExecutedOrder
				})
				
				if ( order.id !== lastExecutedOrder ) {
					logger.log('Executing order:', order)
					console.log(`+++++ Executing order: ${order.type}`)
					executors[order.type](order, store, jar)
					lastExecutedOrder = order.id
				} else {
					console.log("Executing order")
				}
			} else if ( ! executingOrder ) {
				console.log('+++++ Running analysis')
				logger.log('State Analysis')
				const order = analytics.nextOrder(state)
				
				if ( order ) {
					console.log("New Order: ", order)
					store.dispatch(actions.newOrder(order))
					interval = 1
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
