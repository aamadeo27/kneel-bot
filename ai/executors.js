const actions = require('../redux/actions')
const { 
	moveWorker,
	spawn,
	build,
	upgradeBuilding,
	trade,
	attack
} = require('../api/control')
const info = require('../api/info')

module.exports = {
	idleToWork(order, store, jar){
		const { resources, occupations } = store.getState().village

		let target = undefined
		for ( r in resources ){
			if ( !target || target.rps > resources[r].rps ){
				target = resources[r]
			}
		}
		
		console.log("Move idle to " + target.resource)
		
		const callback = () => store.dispatch(actions.removeOrder(order))
		const workers = occupations[target.resource].workers + 1
		moveWorker(store, jar, target.resource, workers, callback)
	},
	
	spawn(order, store, jar){
		store.dispatch(actions.saveFor(''))
		console.log("Spawning ", order.unit)
		const callback = () => store.dispatch(actions.removeOrder(order))
		const nullCB = () => {}
		
		for( let i = 0; i < order.count ; i++ ){
			let cb = (i == order.count-1) ? callback : nullCB
			spawn(store, order.unit, order.slot, jar, cb)
		}
	},
	
	build(order, store, jar){
		/*
		   MoveWorker
			 Build (cb1)
			 RemoveOrder (cb2)
		*/
		
		console.log("Building", order.building)
		
		const removeOrderCB = () => store.dispatch(actions.removeOrder(order))
		
		const { resources, occupations } = store.getState().village

		let target = undefined
		for ( r in resources ){
			if ( !target || target.rps < resources[r].rps ){
				target = resources[r]
			}
		}
		
		order.building.builders = order.building.builders || 1
		const workers = occupations[target.resource].workers - order.building.builders
		
		const buildCB = () => {
			store.dispatch(actions.saveFor(''))
			console.log("Building?")
			build(store, jar, order.building, removeOrderCB)
		}
		
		moveWorker(store, jar, target.resource, workers, buildCB)
	},
	
	trade(order, store, jar){
		console.log("Trading", order.trade)
		
		const callback = () => store.dispatch(actions.removeOrder(order))
		trade(store, order.trade, jar, callback)
	},
	
	saveFor(order, store){
		store.dispatch(actions.saveFor(order.item))
		store.dispatch(actions.removeOrder(order))
	},
	
	attack(order, store, jar){
		console.log("Executing Mission", order.mission)
		const callback = () => store.dispatch(actions.removeOrder(order))
		
		if ( order.extendDiscover ){
			store.dispatch(actions.extendDiscover())
		}
		
		attack(store, order.mission, jar, callback)
	},
	
	upgradeBuilding(order, store, jar){
		/*
		   MoveWorker
			 Upgrade (cb1)
			 RemoveOrder (cb2)
		*/
		
		console.log("Upgrading Building", order.spec)
		
		const removeOrderCB = () => {
			info.load(
				store, jar, 'tasks', 
				( ) => store.dispatch(actions.removeOrder(order))
			)
		}
		
		const { resources, occupations } = store.getState().village

		let target = undefined
		for ( r in resources ){
			if ( !target || target.rps < resources[r].rps ){
				target = resources[r]
			}
		}
		
		const workers = occupations[target.resource].workers - order.spec.builders
		
		console.log("Workers: ", workers)
		
		const buildCB = () => {
			store.dispatch(actions.saveFor(''))
			upgradeBuilding(store, jar, order.spec, removeOrderCB)
		}
		
		moveWorker(store, jar, target.resource, workers, buildCB)
	}
}