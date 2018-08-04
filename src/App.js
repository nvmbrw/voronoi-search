import React, { Component } from 'react'
import Map from './google-map'
import './App.css'

class App extends Component {
  constructor(props) {
    super(props)
    this.state = { query: '' }
    this.handleChange = this.handleChange.bind(this)
  }

  handleChange(evt) {
    this.setState({ query: evt.target.value })
  }
  render() {
    return (
      <div className="App">
        <Map query={this.state.query} />
      </div>
    )
  }
}

export default App
