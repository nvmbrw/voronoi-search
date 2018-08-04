import React, { Component } from 'react'
import * as d3 from 'd3'
import { voronoi } from 'd3-voronoi'
const { google } = global

const dummyPoints = [
  {
    x: 656.6053660445614,
    y: 524.7138696039328,
  },
  {
    x: 615.6817749334732,
    y: 410.1902018302353,
  },
  {
    x: 886.2435100442963,
    y: 571.972982189036,
  },
  {
    x: 883.0051578310085,
    y: 578.0609021408018,
  },
  {
    x: 827.6793753596721,
    y: 627.564703813754,
  },
  {
    x: 393.7564899557037,
    y: 151.75414818618447,
  },
  {
    x: 815.6935691375984,
    y: 579.8469275260577,
  },
  {
    x: 849.332469760091,
    y: 579.9131657776888,
  },
  {
    x: 881.5930754847359,
    y: 561.9245408335701,
  },
  {
    x: 684.679240817437,
    y: 142.7680811501341,
  },
  {
    x: 829.7887607468292,
    y: 534.5698950131191,
  },
  {
    x: 439.9293690311024,
    y: 81.50240137183573,
  },
  {
    x: 440.1012189864414,
    y: 78.06513519119471,
  },
  {
    x: 398.55663786665536,
    y: 82.8782691503875,
  },
  {
    x: 863.0169691019692,
    y: 579.0514660804765,
  },
  {
    x: 858.4620714663761,
    y: 664.3004045062698,
  },
  {
    x: 507.5462098493008,
    y: 55.703408314846456,
  },
  {
    x: 504.76340565353166,
    y: 78.40669359033927,
  },
  {
    x: 601.5265814753948,
    y: 330.1526141548529,
  },
  {
    x: 470.8571181509178,
    y: 64.86356378754135,
  },
]

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

      console.log('getpanes overlayLayer', this.getPanes().overlayLayer)

      overlay.draw = function() {
        let projection = this.getProjection(),
          padding = 10

        function simpleTransform(d) {
          return projection.fromLatLngToContainerPixel(d)
        }
        function transform(d) {
          //console.log('data point lat/long', d.lat(), d.lng())
          //d = projection.fromLatLngToDivPixel(d)
          //console.log('data point', d)

          return d3
            .select(this)
            .style('left', Math.round(d.x - padding) + 'px')
            .style('top', Math.round(d.y - padding) + 'px')
        }

        console.log(voronoiPoints.map(point => simpleTransform(point)))

        var marker = layer
          .selectAll('svg')
          .data(dummyPoints)
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
    return (
      <div>
        <input id="search" ref="search" />
        <div id="map" ref="map" />
      </div>
    )
  }
}
