const types = {
	IDLE_TO_WORK: 'idleToWork',
	SPAWN: 'spawn',
	BUILD: 'build',
	TRADE: 'trade',
	SAVE_FOR: 'saveFor',
	ATTACK: 'attack',
	UPGRADE_BUILDING: 'upgradeBuilding',
	UPGRADE_OCCUPATION: 'upgradeOccupation'
}

const newId = () => new Date().getTime()

module.exports = {
	idleToWork: () => ({ 
		type: types.IDLE_TO_WORK, 
		id: newId()
	}),
	
	spawn: (unit, slot, count) => ({ 
		type: types.SPAWN, 
		id: newId(),
		unit,
		slot,
		count
	}),
	
	build: building => ({
		type: types.BUILD,
		id: newId(),
		building
	}),
	
	upgradeBuilding: spec => ({
		type: types.UPGRADE_BUILDING,
		id: newId(),
		spec
	}),
	
	upgradeOccupation: occupation => ({
		type: types.UPGRADE_OCCUPATION,
		id: newId(),
		occupation
	}),
	
	trade: spec => ({
		type: types.TRADE,
		id: newId(),
		trade: spec
	}),
	
	saveForItem: item => ({
		type: types.SAVE_FOR,
		id: newId(),
		item
	}),
	
	attack: (mission, extendDiscover) => ({
		type: types.ATTACK,
		id: newId(),
		mission,
		extendDiscover
	})
}