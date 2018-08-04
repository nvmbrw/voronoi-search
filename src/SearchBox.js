import React, { Component } from 'react'
const { google } = global

export default class SearchBox extends Component {
  componentDidMount() {
    this.searchBox = new google.maps.places.Autocomplete(this.refs.search)
  }

  render() {
    return <input type="text" id="search" ref="search" placeholder="Search" />
  }
}
