
const lib = {
	howMuch: (cost, resources) => [
		resources.food.r0 / cost.food,
		resources.iron.r0 / cost.iron,
		resources.wood.r0 / cost.wood,
		resources.stone.r0 / cost.stone
	].reduce( (min, k) => k < min ? k : min ),

	enoughResources(resources, cost){
		return resources.food.r0 >= cost.food &&
					resources.iron.r0 >= cost.iron &&
					resources.wood.r0 >= cost.wood &&
					resources.stone.r0 >= cost.stone
	},
	
	sameVillage: (p,q) => p.x === q.x && p.y === q.y,

	peasantsInVillage(village){
		let n = 0

		for ( o in village.occupations ){
			n += village.occupations[o].workers
		}

		return n
	},
	
	upgrades: ( occupation, tasks ) => tasks.reduce((ups, slotQueue) => 
		ups + !slotQueue ? 0 : slotQueue.reduce( (ups_, task) => 
				ups_ + ( task &&
								 task.params.job === '_upgradeOccupation' && 
								 task.params.occupation === occupation ? 1 : 0),
				0
		),
		0
	),

	stealingCapacity(missions, profiles){
		return missions.reduce( (total, m) => {
			for ( t in m.troops ){
				total += parseInt(m.troops[t]) * profiles[t].capacity
			}

			return total
		}, 0)
	},

	troopsInMissions(missions, profiles){
		return missions.reduce( (total, m) => {
			for ( t in m.troops ){
				total += parseInt(m.troops[t]) * profiles[t].fph
			}

			return total
		}, 0)
	},

	troopsInVillage(village, profiles, type){
		let fph = 0

		for ( t in village.troops ){
			if ( type && type !== t ) continue

			fph += village.troops[t].count * profiles[t].fph
		}

		return fph
	},

	emptySlot(buildings){
		const emptySlots = buildings.map( 
			(s, i) => ({ slot: i, empty: ! s })
		).filter(s => s.empty )

		//no upgrade
		if ( emptySlots.length === 0 ) return

		return emptySlots[0].slot
	},

	hasOrWillHaveBuilding: (buildings, tasks, name ) =>
		lib.hasBuilding(buildings, name) || lib.itsBeingBuilt(tasks, name),

	hasBuilding: (buildings, name) =>
		buildings.filter( b => b && b.name === name).length > 0,

	slotOf: (buildings, name) => 
		buildings.map( (s, i) => Object.assign({ slot: i}, s) )
						 .find( s => s.name === name ).slot,

	tradePossible(cost, resources){
		const trade = { }

		for( r in resources ){
			if ( resources[r].r0 > (cost[r] + 50) ){
				trade.sell = { 
					resource: r, 
					count: resources[r].r0 - cost[r]
				}
			}

			if ( resources[r].r0 < cost[r] ){
				trade.buy = r
			}

			if ( trade.sell && trade.buy ) return trade
		}
	},

	itsBeingBuilt: (tasks, name) => tasks.length > 0 && 
			tasks.reduce(	(ibb, slotQueue) => 
				ibb || slotQueue && slotQueue.reduce( (ibb_, task) => 
						ibb_ || ( task &&
				              task.params.job === 'build' && 
											task.params.building === name ),
						false
				),
				false
			)
}

module.exports = lib