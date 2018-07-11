import React from 'react'
import { connect } from 'react-redux'
import { Panel } from 'react-bootstrap'
import ReactJson  from 'react-json-view'

class BotState extends React.Component {
    render(){
        const { botState } = this.props

        const stateH = <span>
            <strong> State </strong>
        </span>

        return <Panel header={stateH} collapsible bsStyle="info" defaultExpanded={false}>
            <ReactJson 
                name="Bot"
                collapsed
                displayObjectSize={false}
                displayDataType={false}
                src={botState} />
        </Panel>
    }
}

const mapStateToProps = ({ botState }) => ({ botState })
const mapDispatchToProps = dispatch => ({ 
    
})

export default connect(mapStateToProps, mapDispatchToProps)(BotState)