const { server } = require('../config')


module.exports = {
	Params: `${server}/v2/users/params`,
	/*Village*/
	Village:`${server}/v2/villages`,
	villageTroops:`${server}/v2/villages/troops`,
	moveWorker: `${server}/v2/villages/moveWorker`,
	research: `${server}/v2/villages/research`,
	upgradeOccupation: `${server}/v2/villages/upgradeOccupation`,
	spawn: `${server}/v2/villages/spawn`,
	spawnArmy: `${server}/v2/villages/spawnArmy`,
	build: `${server}/v2/villages/build`,
	upgradeBuilding: `${server}/v2/villages/upgrade`,
	trade:  `${server}/v2/villages/sell`,
	tech: `${server}/v2/villages/tech`,
	/*Map*/
	Map: `${server}/v2/cells/`,
	/*Mission*/
	Missions: `${server}/v2/missions/`,
	reports: `${server}/v2/missions/reports`,
	toggleLoop: `${server}/v2/missions/toggleLoop`,
	abort: `${server}/v2/missions/abort`,
	/*Tasks*/
	Tasks:  `${server}/v2/tasks`,
	/*Auth*/
	login: `${server}/v2/users/login`,
	logout: `${server}/v2/users/logout`,
	freeUser: `${server}/v2/users/free`,
	users: `${server}/v2/users/`,
	/*Diplomacy*/
	surrender: `${server}/v2/diplomacy/surrender`,
	Diplomacy: `${server}/v2/diplomacy`,
	troopsCalling: `${server}/v2/diplomacy/troopsCalling`
}