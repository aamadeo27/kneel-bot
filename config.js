const secondsToMs = s => s * 1000
const minutesToMs = m => m * 60000
const hoursToMs = h => h * 3600000

const minutesToSec = m => m * 60
const hoursToSec = h => h * 3600

module.exports = {
	server: 'https://s1.aamadeo.me',
	login: {
		user: 'JonBonachon', 
		pass: 'lamierda'
	},
	minDiscoverRadius: 0,
	maxDiscoverRadius: 5,
	minAttack: 3,
	minDefense: 0.1,
	troopsPerPeasant: 10,
	intervals: {
		discovery: secondsToMs(10),
		update: secondsToMs(10),
		execute: secondsToMs(5)
	},
	warehouseFillTime: hoursToSec(5),
	barnFillTime: hoursToSec(5)
}
