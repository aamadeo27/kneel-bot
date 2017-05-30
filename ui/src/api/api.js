const server = 'http://localhost:7777'

const urls = {
    state: `${server}/state`,
    config: `${server}/config`
}

const get = url => fetch(url).then( r => r.json())

const dataOp = (method) => (url, data) => fetch(url, { 
	method,
	headers : {
		'Accept': 'application/json',
		'Content-Type': 'application/json'
	},
	body: JSON.stringify(data)
}).then( r => r.json())

const put = dataOp("PUT")

export const load = () =>{
    console.log("Loading2")
    return get(urls.state)
}

export const updateConfig = config => put(urls.config, config)