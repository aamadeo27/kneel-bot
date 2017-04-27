const {
	idleToWork,
	spawn,
	build,
	upgradeBuilding,
	trade,
	saveForItem,
	attack
} = require('./orders')

const config = require('../config')
const {
	howMuch,
	enoughResources,
	sameVillage,
	peasantsInVillage,
	stealingCapacity,
	troopsInMissions,
	troopsInVillage,
	emptySlot,
	hasOrWillHaveBuilding,
	hasBuilding,
	slotOf,
	tradePossible,
	itsBeingBuilt
} = require('./common')

//An hour in seconds
const HOUR = 3600


const analyze ={
	idle({ village }){
		const idle = village.occupations.unoccupied.workers

		console.log("Idle: ", idle)

		if ( idle > 0 )
			return idleToWork()
	},
	
	attack({ village, params, missions, targets, location, gatherTroops }){
		console.log("--> Attack ?")
		
		const {minTroops} = config
		
		if ( ! missions ) return
		if ( ! targets ) return 
		
		missions = missions.map( m => {
			const missionTarget = m.objective.action == 'return' ? m.origin : m.objective
			return missionTarget.id
		})
		
		const troops = troopsInVillage(village, params.profiles, 'infantry') - gatherTroops
		
		if ( troops < minTroops ) return
		
		const attackedTarget = target => missions.find( m => m === target.id)
		const posibleTargets = targets.filter( t => ! attackedTarget(t))
		
		if ( posibleTargets.length === 0 ) return
		
		const target = posibleTargets[0]
		
		let mission = undefined
		const extendDiscover = posibleTargets.length === 1
		
		let count =  Math.max(
			minTroops, 
			parseInt(troops/(posibleTargets.length))
		)

		console.log({
			troops,
			PTL: posibleTargets.length,
			minTroops
		})

		if ( troops - count < minTroops){
			count = troops
		}

		mission = {
			objective: target,
			action: 'raid',
			troops: {
				infantry: { count }
			},
			path: [
				location,
				target
			]
		}
		
		return attack(mission, extendDiscover)
	},

	barn({ village, tasks, missions, params, saveFor }){
		console.log("--> Barn ?")
		if ( ! tasks ) return
		
		if ( saveFor && saveFor !== 'Barn' ) return

		if ( itsBeingBuilt(tasks, 'Barn') ){
			return
		}
		
		let looting = stealingCapacity(missions, params.profiles)
		looting /= 4						//Per resource
		looting /= ( 8 * 3600 ) //Loot Ability per 8hs
		
		const { rps, capacity } = village.resources.food
		let timeLeft = capacity / (rps + looting)
		
		console.log("Lph: " + Math.round(looting * 3600))
		// Less than 5hs to go from empty to full
		console.log({ r: 'food', timeLeft: Math.round(timeLeft/60) + 'mins' })
		if ( timeLeft > 5 * HOUR ) return
		
		let cost = params.costs.Barn
		const upgrade = hasBuilding(village.buildings, 'Barn')
		let slot = undefined
		
		if ( upgrade ){
			slot = slotOf(village.buildings, 'Barn')
			const {detail} = village.buildings[slot]
			const upgrading = detail.nextLevel - detail.level > 1

			// If it's upgrading already
			if ( upgrading ) return
			
			for( r in cost ) {
				cost[r] *= 
					Math.pow(params.price.coeficient, detail.nextLevel)
			}
			
		} else {
			slot = emptySlot(village.buildings)		
			if ( slot === undefined ) return
		}
		
		if ( ! enoughResources(village.resources, cost) ) {
			return !saveFor && saveForItem('Barn')
		}
		
		if ( upgrade ){
			return upgradeBuilding({ slot, builders: 1 })
		}
		
		return build({ name: 'Barn', slot })
	},
	
	warehouse({ village, missions, params, tasks, saveFor }){
		console.log("--> Warehouse ?")
		
		if ( ! tasks ) return
		
		if ( saveFor && saveFor !== 'Warehouse' ) return

		if ( itsBeingBuilt(tasks, 'Warehouse') ){
			return
		}
		
		let looting = stealingCapacity(missions, params.profiles)
		looting /= 4
		looting /= ( 8 * 3600 )
		
		let cost = params.costs.Barn
		const upgrade = hasBuilding(village.buildings, 'Warehouse')
		
		for( r in village.resources ){
			if ( r === 'food') continue
			
			let { rps, capacity } = village.resources[r]
			let timeLeft = capacity / (rps + looting)

			// Less than 5hs to go from empty to full
			console.log({ r, timeLeft: Math.round(timeLeft/60) + 'mins', looting })
			if ( timeLeft > 5 * HOUR ) continue
			
			if ( upgrade ){
				slot = slotOf(village.buildings, 'Warehouse')
				
				const {detail} = village.buildings[slot]
				const upgrading = detail.nextLevel - detail.level > 1

				// If it's upgrading already
				if ( upgrading ) return

				for( r in cost ) {
					cost[r] *= 
						Math.pow(params.price.coeficient, detail.nextLevel)
				}
			} else {
				slot = emptySlot(village.buildings)
				if ( slot === undefined ) return
			}
			
			if ( ! enoughResources(village.resources, cost) ) {
				return !saveFor && saveForItem('Warehouse')
			}
			
			if ( upgrade ){
				console.log("Upgrade Warehouse")
				return upgradeBuilding({ slot, builders: 1 })
			}
			
			return build({ name: 'Warehouse', slot })
		}
	},
	
	market({ village, params, tasks, saveFor }){
		console.log("--> Market ?")
		if ( ! tasks ) return

		if ( saveFor && saveFor !== 'Market' ) return
		
		if ( hasOrWillHaveBuilding(village.buildings, tasks, 'Market') ){
			return
		}
		
		const cost = params.costs.Market
		
		const slot = emptySlot(village.buildings)
		if ( slot === undefined ) return
		
		const sum = Object.keys(village.resources).reduce( 
			(sum,r) => {
				const { r0, capacity } = village.resources[r]
				
				return sum + r0 / capacity
			}, 0
		)
		
		const avg = sum / 4
		let variance = 0
		for( r in village.resources ){
			let { r0, capacity } = village.resources[r]
			variance += Math.abs(avg - r0/capacity)
		}
		
		console.log({ variance })
		if ( variance < 0.5 ) return

		if ( ! enoughResources(village.resources, cost) ) {
			console.log("No money for Market")
			return !saveFor && saveForItem('Market')
		}
		
		return build({ name: 'Market', slot, builders: 4 })
	},
	
	barracks({ village, params, tasks, saveFor }){
		console.log("--> Barracks ?")
		if ( ! tasks ) return
		
		if ( saveFor && saveFor !== 'Barracks' ) return

		if ( hasOrWillHaveBuilding(village.buildings, tasks, 'Barracks') ){
			return
		}
		
		const slot = emptySlot(village.buildings)
		if ( slot === undefined ) return
		
		const sum = Object.keys(village.resources).reduce( 
			(sum,r) => {
				const { rps } = village.resources[r]
				
				return sum + rps*3600
			}, 0
		)
		
		const avg = sum / 4
		if ( avg < 50 ) return
		
		const cost = params.costs.Barracks
		
		if ( ! enoughResources(village.resources, cost) ) {
			const spec = tradePossible(cost, village.resources)
			
			if ( spec ){
				console.log("Trading to build Barracks")
				return trade(spec)
			} 
			
			return !saveFor && saveForItem('Barracks')
		}
		
		return build({ name: 'Barracks', slot, builders: 6 })
	},
	
	troop({ village, params, missions, saveFor }){
		console.log("--> Troop ?")
		
		if ( ! params ) return
		
		if ( saveFor && saveFor !== 'Troop' ) return
		if ( ! hasBuilding(village.buildings, 'Barracks') ) return
		
		const slot = slotOf(village.buildings, 'Barracks')
				
		const peasants = peasantsInVillage(village)
		const troops = troopsInVillage(village, params.profiles) +
									 troopsInMissions(missions, params.profiles)
		
		if ( troops / peasants > 10 ) return
		
		const cost = params.costs.infantry
		
		if ( ! enoughResources(village.resources, cost) ){
			if ( ! hasBuilding(village.buildings, 'Market') ) return
			
			const tradeSpec = tradePossible(cost, village.resources)
			
			if ( tradeSpec ){
				return trade(tradeSpec)
			}
			
			return
		}
		
		let count = parseInt(howMuch(cost, village.resources))
		
		console.log("Spawning ", count)
		
		return spawn('infantry', slot, count)
	},
	
	peasant({ village, params, missions, saveFor }){
		console.log("--> Peasant ?")
		if ( saveFor && saveFor !== 'Peasant' ) return
		
		const peasants = peasantsInVillage(village)
		const troops = troopsInVillage(village, params.profiles) +
									 troopsInMissions(missions, params.profiles)
		
		if ( troops / peasants < 10 ) return
		
		
		const cost = params.costs.peasant
		
		if ( enoughResources(village.resources, cost) ){
			return spawn('peasant',12,1)
		} else {
			if ( ! hasBuilding(village.buildings, 'Market') ) return
			
			const tradeSpec = tradePossible(cost, village.resources)
			
			if ( tradeSpec ){
				return trade(tradeSpec)
			}
		}
	},
}

module.exports = {
	nextOrder: state => {
		const {
			resources,
			occupations
		} = state.village

		if ( !state.loggedIn || !resources ) return

		let cases = Object.keys(analyze)
		cases = cases.filter( f => typeof analyze[f] === 'function' )
		orders = cases.map( f => analyze[f](state) )
			           .filter( r => r !== undefined )
		
		if ( orders[0] ) return orders[0]
			
	}
}