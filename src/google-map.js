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
    //overlay.onRemove = function() {}

    overlay.onAdd = function() {
      let layer = d3
        .select(this.getPanes().overlayLayer)
        .append('div')
        .attr('class', 'voronoiVertices')

      overlay.draw = function() {
        let projection = this.getProjection(),
          padding = 10

        const simpleTransform = d => projection.fromLatLngToDivPixel(d)

        voronoiPoints = voronoiPoints.map(point => simpleTransform(point))

        const voronoiInstance = voronoi()
          .size([mapWidthpx, mapHeightpx])
          .x(d => d.x)
          .y(d => d.y)

        const diagram = voronoiInstance(voronoiPoints)

        console.log(diagram)

        function transform(d) {
          return d3
            .select(this)
            .style('left', Math.round(d.x - padding) + 'px')
            .style('top', Math.round(d.y - padding) + 'px')
        }

        const edgesFromCell = cell =>
          diagram.edges.filter((edge, i) => cell.halfedges.includes(i))

        const buildPathFromPolygon = edgesArr => 'M' + edgesArr.join('L') + 'Z'

        var marker = layer
          .selectAll('svg')
          .data(voronoiPoints)
          .each(transform)
          .enter()
          .append('svg')
          .each(transform)
          .attr('class', 'marker')

        marker
          .append('circle')
          .attr('r', 4.5)
          .attr('cx', padding)
          .attr('cy', padding)

        layer
          .selectAll('svg')
          .data(diagram.polygons())
          .enter()
          .append('path')
          .attr('d', buildPathFromPolygon)
      }
    }

    overlay.setMap(this.map)

    this.map.addListener('bounds_changed', () => {
      const bounds = this.map.getBounds()
      this.searchBox.setBounds(bounds)
    })

    let voronoiPoints = []

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

      let bounds = new google.maps.LatLngBounds()

      places.forEach(place => {
        if (!place.geometry) {
          console.log('Returned place contains no geometry')
          return
        }

        // let icon = {
        //   url: place.icon,
        //   size: new google.maps.Size(71, 71),
        //   origin: new google.maps.Point(0, 0),
        //   anchor: new google.maps.Point(17, 34),
        //   scaledSize: new google.maps.Size(25, 25),
        // }

        // markers.push(
        //   new google.maps.Marker({
        //     map: this.map,
        //     icon,
        //     title: place.name,
        //     position: place.geometry.location,
        //   })
        // )

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
    return (
      <div>
        <input id="search" ref="search" />
        <div id="map" ref="map" />
      </div>
    )
  }
}
