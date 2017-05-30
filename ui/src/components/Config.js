import React from 'react'
import { connect } from 'react-redux'
import { Panel, Table, Glyphicon } from 'react-bootstrap'
import ReactJson  from 'react-json-view'
import * as api from '../api/api'
import * as actions from '../redux/actions'

class ConfigValue extends React.Component {
    constructor(props){
        super(props)

        this.state = { edit: false }
    }

    render() {
        const value = this.state.value || this.props.value

        if ( typeof value === "object" ){
            return <td><ReactJson 
                    name={""}
                    collapsed
                    displayObjectSize={false}
                    displayDataType={false}
                    onEdit={e => this.props.onChange(e.updated_src)}
                    src={value} />
            </td>
        }

        const props = {
            onClick: () => this.setState({ edit: true }),
            onBlur: () => this.setState({ edit: false }),
            style: {
                cursor: "pointer"
            }
        }

        const onChange = type => e => {
            let value = ''

            switch(type){
                case "number":
                    value = parseFloat(e.target.value)
                    break
                case "boolean":
                    value = e.target.value === 't' || e.target.value === 'true'
                    break
                default:
                    value = e.target.value
                    break
            }
            
            this.setState({ value })
            this.props.onChange(value)
        }

        if ( this.state.edit ){
            let type = ''
            switch(typeof value){
                case "number":
                    type = "number"
                    break
                case "boolean":
                    type = "boolean"
                    break
                default:
                    type = "text"
            }
                
            return <td {...props}>
                <input type={type} autoFocus value={value + ""} onChange={onChange(type)}/>
            </td>
        }

        return <td {...props}>{value + ""}</td>
    }
}

class Config extends React.Component {
    componentWillMount(){
        const { updateConfig } = this.props
        
        api.load().then( state => {
            updateConfig(state.config)
        })
    }

    render(){
        const { updateConfig, config } = this.props
        const onUpdate = name => value =>
            updateConfig(Object.assign({}, config, { [name] : value }))

        console.log({ config })

        const configH = <span>
            <strong> Configuration </strong>
            <span href="#" onClick={() => api.updateConfig(config) }>
                <Glyphicon glyph="refresh" />
            </span>
        </span>
        
        
        const values = Object.keys(config).map( v => 
            <tr key={v}>
                <td>{v}</td>
                <ConfigValue name={v} value={config[v]} onChange={onUpdate(v)}/>
            </tr>
        )

        return <Panel header={configH} collapsible bsStyle="info" defaultExpanded>
            <Table bordered condensed striped fill>
            <thead>
                <tr>
                    <th>Variable</th>
                    <th>Value</th>
                </tr>
            </thead>
            <tbody>
                {values}
            </tbody>
            </Table>
        </Panel>
    }
}

const mapStateToProps = ({ config }) => ({ config })
const mapDispatchToProps = dispatch => ({ 
    updateConfig: config => dispatch(actions.updateConfig(config))
})

export default connect(mapStateToProps, mapDispatchToProps)(Config)