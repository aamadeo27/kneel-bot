import React, { Component } from 'react';
import { Grid, Row, Col, Jumbotron } from 'react-bootstrap'
import { Provider } from 'react-redux'
import { createStore } from 'redux'
import Config from './components/Config'
import BotState from './components/BotState'
import reducer from './redux/reducer'
const store = createStore( reducer )

class App extends Component {
  render() {

    return (
      <Provider store={store}>
        <Grid className="App">
          <Row>
            <Col xs={12}>
              <Jumbotron>
                <h1>Bot Admin</h1>
              </Jumbotron>
              <Config />
              <BotState />
            </Col>
          </Row>
        </Grid>
      </Provider>
    );
  }
}

export default App;
