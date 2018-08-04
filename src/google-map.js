import React, { Component } from 'react'
import * as d3 from 'd3'
import { voronoi } from 'd3-voronoi'
const { google } = global

export default class Map extends Component {
  shouldComponentUpdate() {
    return false
  }

  componentDidMount() {
    const mapHeightpx = 720,
      mapWidthpx = 1280

    this.map = new google.maps.Map(this.refs.map, {
      center: { lat: 14.6937, lng: -17.44406 },
      zoom: 13,
    })
    this.places = new google.maps.places.PlacesService(this.map)

    this.searchBox = new google.maps.places.SearchBox(this.refs.search)
    this.map.controls[google.maps.ControlPosition.TOP_LEFT].push(
      this.refs.search
    )

    // overlay is necessary to call getProjection and from there fromLatLngToContainerPixel....
    const overlay = new google.maps.OverlayView()
    overlay.onRemove = function() {}

    overlay.onAdd = function() {
      let layer = d3
        .select(this.getPanes().overlayLayer)
        .append('div')
        .attr('class', 'voronoiVertices')

      console.log('getpanes overlayLayer', this.getPanes().overlayLayer)

      overlay.draw = function() {
        let projection = this.getProjection(),
          padding = 10

        function transform(d) {
          //console.log('data point lat/long', d.lat(), d.lng())
          d = projection.fromLatLngToDivPixel(d)
          //console.log('data point', d)

          return d3
            .select(this)
            .style('left', Math.round(d.x - padding) + 'px')
            .style('top', Math.round(d.y - padding) + 'px')
        }
        let marker = layer
          .selectAll('svg')
          .data(voronoiPoints)
          .each(transform)
          .enter()
          .append('svg')
          .each(transform)
          .attr('class', 'marker')

        //console.log('marker object', marker)

        marker
          .append('circle')
          .attr('r', 4.5)
          .attr('cx', padding)
          .attr('cy', padding)
      }
    }

    overlay.setMap(this.map)

    this.map.addListener('bounds_changed', () => {
      const bounds = this.map.getBounds()
      this.searchBox.setBounds(bounds)
    })

    let voronoiPoints = []
    // getProjection is only available after action projection_changed... so we wrap the whole thing in it

    this.searchBox.addListener('places_changed', () => {
      let markers = []

      let places = this.searchBox.getPlaces()
      if (places.length === 0) {
        return
      }

      markers.forEach(marker => {
        marker.setMap(null)
      })

      markers = []
      voronoiPoints = [] // reset voronoi points
      //const voronoiInstance = voronoi().size([mapWidthpx, mapHeightpx])

      let bounds = new google.maps.LatLngBounds()

      places.forEach(place => {
        if (!place.geometry) {
          console.log('Returned place contains no geometry')
          return
        }

        let icon = {
          url: place.icon,
          size: new google.maps.Size(71, 71),
          origin: new google.maps.Point(0, 0),
          anchor: new google.maps.Point(17, 34),
          scaledSize: new google.maps.Size(25, 25),
        }

        markers.push(
          new google.maps.Marker({
            map: this.map,
            icon,
            title: place.name,
            position: place.geometry.location,
          })
        )

        voronoiPoints.push(place.geometry.location)

        if (place.geometry.viewport) {
          bounds.union(place.geometry.viewport)
        } else {
          bounds.extend(place.geometry.location)
        }
      })

      this.map.fitBounds(bounds)
    })
  }

  render() {
    return <div id="map" ref="map" />
  }
}
