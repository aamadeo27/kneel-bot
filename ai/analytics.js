/*	
	Stable => if Calvary
	
	
	Research			  -> {
		Calvary => 250 pts
		trade-cart => if Calvary
		Siege => 300
		Catapult => Siege
		Trebuchet => Siege && 600
	}
	
	Improve Troop
	Other Troops => {
		Scouts => if Calvary && Infantry / Calvary >= 2.5
		Archers => not
		Catapults  => if Catapult
		Trebuchets => if Trebuchet
		trade-carts => if trade-cart && trade-carts < 6
	}
	
	Attack Players { 
		Raid => Troops >= 400 fph
		SiegeC => 50 Catapults && Troops >= 1000
		SiegeT => 20 Trebuchets && Troops >= 10000
	}
	
	Fund Villages => 300 pts && 6 trade carts
*/

const {
	idleToWork,
	spawn,
	build,
	upgradeBuilding,
	trade,
	saveForItem,
	attack,
	upgradeOccupation,
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
	itsBeingBuilt,
	itsBeingResearched,
	upgrades
} = require('./common')

//An hour in seconds
const HOUR = 3600

const barnCondition = ({ params, missions, village, config }) => {
		let looting = stealingCapacity(missions, params.profiles)
		looting /= 4						//Per resource
		looting /= ( 8 * 3600 ) //Loot Ability per 8hs
		
		const { rps, capacity } = village.resources.food
		let timeLeft = capacity / (rps + looting)
		
		return timeLeft > config.barnFillTime
}

const marketCondition = ({ village }) => {
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
		
		return variance < 0.5
}

const barracksCondition = ({ points, config, village }) => {
	const slot = slotOf(village.buildings, 'Barracks')
	
	if ( ! slot ) return true
	
	const { detail } = village.buildings[slot]
	
	return parseInt(points / config.points.barracks) > (detail.nextLevel - 1)
}

const building = (buildingName, ignoreCondition, builders = 1, allowUpgrade = true) => state => {
	  const { village, tasks, params, saveFor } = state
		console.log(`[analysis] Building ${buildingName}`)
		
		if ( ! tasks ) return
		
		if ( saveFor && saveFor !== buildingName ) return
		

		if ( itsBeingBuilt(tasks, buildingName) ){
			return
		}
		
		if (! ignoreCondition(state) ) return
		
		let cost = Object.assign({}, params.costs[buildingName])
		const upgrade = hasBuilding(village.buildings, buildingName)
		let slot = undefined
		
		if ( upgrade ){
			if ( ! allowUpgrade ) return
			
			slot = slotOf(village.buildings, buildingName)
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
			return !saveFor && saveForItem(buildingName)
		}
		
		if ( upgrade ){
			return upgradeBuilding({ slot, builders })
		}
		
		return build({ name: buildingName, slot })
}

const research = ( tech, ignoreCondition ) => state => {
	const { params, config, village, tasks, userInfo: { points } } = state
	
	console.log("--> Research " + tech + " ?")
	if ( params.userTech[tech] ) return
	if ( itsBeingResearched(tasks, tech) ) return 
	
	const cost = params.costs[tech]
	
	if ( ignoreCondition && ignoreCondition(state) ) return
	if ( config.points[tech] && config.points[tech] < points ) return
	
	if ( ! enoughResources(village.resources, cost) ) {
		//return !saveFor && saveForItem(buildingName)
		console.log("Save For " + tech)
	}

	return tech
}

const techConditions = {
	Calvary: () => true,
	"Trade Cart Research" : ({ params: { userTech }}) => !!userTech.Calvary,
	Siege: () => true,
	"Catapult Research": ({ params: { userTech }}) => !!userTech.Siege,
	"Trebuchet Research": ({ params: { userTech }}) => !!userTech.Siege
}

const analyze = {

	attack({ village, params, missions, targets, userInfo, gatherTroops, config }){
		console.log("--> Attack ?")
		
		const { minAttack, minDefense } = config
		const { location } = userInfo
		
		if ( ! missions ) return
		if ( ! targets ) return 
		
		let available = troopsInVillage(village, params.profiles, 'infantry')
		let allTroops = available + troopsInMissions(missions, params.profiles)
		
		available = available - parseInt(minDefense * allTroops, 10)
		available = available - gatherTroops
		
		if ( available < minAttack ) return
		
		missions = missions.map( m => {
			const missionTarget = m.objective.action == 'return' ? m.origin : m.objective
			return missionTarget.id
		})
		
		const attackedTarget = target => missions.find( m => m === target.id)
		const possibleTargets = targets.filter( t => ! attackedTarget(t))
		
		if ( possibleTargets.length === 0 ) return
		
		const target = possibleTargets[0]
		
		let mission = undefined
		const extendDiscover = possibleTargets.length === 1
		
		let count =  Math.max(
			minAttack, 
			parseInt(available/(possibleTargets.length))
		)

		if ( available - count < minAttack){
			console.log("Last batch")
			count = available
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
	
	idle({ village }){
		const idle = village.occupations.unoccupied.workers

		console.log("Idle: ", idle)

		if ( idle > 0 )
			return idleToWork()
	},

	barn: building('Barn', barnCondition),
	university: building('University', ({ userInfo: {points} }) => points < 30, 1, false),
	market: building('Market', marketCondition, 4, false),
	barracks: building('Barracks', barracksCondition, 6),
	stable: building('Stable', ({ params : { userTech } }) => userTech.Calvary, 6, false),
	
	research(state){
		let tech = undefined
		Object.keys(techConditions).forEach(tech => {
			tech = tech || research(tech, techConditions[tech])(state)
		})
		
		console.log("Research " + tech)
	},
	
	warehouse({ village, missions, params, tasks, saveFor, config }){
		console.log("--> Warehouse ?")
		
		if ( ! tasks ) return
		
		if ( saveFor && saveFor !== 'Warehouse' ) return

		if ( itsBeingBuilt(tasks, 'Warehouse') ){
			return
		}
		
		let looting = stealingCapacity(missions, params.profiles)
		looting /= 4
		looting /= ( 8 * 3600 )
		
		let cost = Object.assign({}, params.costs.Warehouse)
		const upgrade = hasBuilding(village.buildings, 'Warehouse')
		
		for( r in village.resources ){
			if ( r === 'food') continue
			
			let { rps, capacity } = village.resources[r]
			let timeLeft = capacity / (rps + looting)

			// Less than 5hs to go from empty to full
			if ( timeLeft > config.warehouseFillTime ) continue
			
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
	
	occupationTech({ village, missions, params, tasks, saveFor, config }){
		console.log("--> OccupationTech ?")
		if ( ! tasks ) return
		
		if ( saveFor && saveFor !== 'OccupationTech' ) return
		
		const expectedTechLevel = parseInt(peasantsInVillage(village) / config.peasantsPerTechLevel)
		let occupationToUpgrade = undefined
		let currentLevel = undefined
		
		console.log({ expectedTechLevel })
		
		Object.keys(village.occupations).forEach( o => {
			if ( o === "builders" || o === "unoccupied" ) return
			if ( occupationToUpgrade ) return
			
			currentLevel = village.occupations[o].level + upgrades(o, tasks)
			console.log({ o, currentLevel })
			
			if ( currentLevel < expectedTechLevel ){
				occupationToUpgrade = o
			}
		})
		
		if ( ! occupationToUpgrade ) return
		
		let cost = Object.assign({}, params.costs[occupationToUpgrade + "Tech"])
		for( r in cost ) {
			if ( typeof cost[r] !== 'number' ) continue
			cost[r] *= 
				Math.pow(params.price.coeficient, currentLevel+1)
		}
		
		if ( ! enoughResources(village.resources, cost) ) {
			const spec = tradePossible(cost, village.resources)
			
			if ( spec ){
				console.log("Trading to upgrade occupation",{ spec, cost, currentLevel })
				return trade(spec)
			} 
			
			return !saveFor && saveForItem('OccupationTech')
		}
		
		return upgradeOccupation(occupationToUpgrade)
	},
	
	troop({ village, params, missions, saveFor, config }){
		console.log("--> Troop ?")
		
		if ( ! params ) return
		
		if ( saveFor && saveFor !== 'Troop' ) return
		if ( ! hasBuilding(village.buildings, 'Barracks') ) return
		
		const slot = slotOf(village.buildings, 'Barracks')
				
		const peasants = peasantsInVillage(village)
		const troops = troopsInVillage(village, params.profiles) +
									 troopsInMissions(missions, params.profiles)
		
		if ( troops / peasants > config.troopsPerPeasant ) return
		
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
	
	peasant({ village, params, missions, saveFor, config }){
		console.log("--> Peasant ?")
		if ( saveFor && saveFor !== 'Peasant' ) return
		
		const peasants = peasantsInVillage(village)
		const troops = troopsInVillage(village, params.profiles) +
									 troopsInMissions(missions, params.profiles)
		
		console.log({
			troops,
			peasants,
			tpp: config.troopsPerPeasant
		})
		if ( troops / peasants < config.troopsPerPeasant ) return
		
		
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
		let order = undefined
		orders = cases.forEach( f => order = order || analyze[f](state) )
		
		return order
			
	}
}