import { autoinject } from 'aurelia-framework';
import * as L from 'leaflet';
import 'https://gist.githubusercontent.com/nick-aranz/cf48b66818e0c225fbf9369483551af8/raw/7bd909667767d38006d2d08be51669b8094e5769/Polyline.encoded.js';
import 'fetch';
import * as Papa from 'papaparse';

@autoinject
export class StravaActivities {
  private map: L.Map;
  private activityData: any[];
  private docTracks: any[];

  constructor() {}

  public async activate() {}

  public attached() {
    let corner1 = L.latLng(-35, 160);
    let corner2 = L.latLng(-52, 180);
    let bounds = L.latLngBounds(corner1, corner2);
    this.map = L.map('map').setView([-43, 170], 6).setMaxBounds(bounds);

    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
      attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
      id: 'mapbox.outdoors',
      accessToken: 'pk.eyJ1IjoibndhcmVpbmciLCJhIjoiY2ozbnNyZ3N5MDAzZTMybGd3bTl2ZnZrYiJ9.xwQ9Y424hzaHcMpmezVSAw',
      maxZoom: 18,
      minZoom: 6
    }).addTo(this.map);

    this.parseStravaActivities();
    this.parseDocActivities();
  }

  private parseDocActivities() {
    Papa.parse('https://funemployment.blob.core.windows.net/data/my-doc-tracks.csv',
    { download: true,
      skipEmptyLines: true,
      header: true,
      complete: (results, file) => {
        this.docTracks = results.data;
        this.addDocTracksToMap();
      }
    });
  }

  private addDocTracksToMap() {
    let docTracksLayer: L.GeoJSON;

    this.docTracks.forEach(track => {
      let order = track.order.split('/');
      if (order[0] === '1') {
        docTracksLayer = L.geoJson().addTo(this.map);
      }
      let linestring: string = track.linestring;
      if (linestring.charAt(0) === 'M') {
        let linestrings = this.getLineStringsFromMultilineString(linestring);
        linestrings.forEach(pointstring => {
          let coordinates = this.getCoordinatesFromLineString(pointstring);
          docTracksLayer.addData(this.buildFeature(track.name, coordinates));
        });
      } else {
        let pointstring = linestring.match(/\(([^)]+)\)/)[1];
        let coordinates = this.getCoordinatesFromLineString(pointstring);
        docTracksLayer.addData(this.buildFeature(track.name, coordinates));
      }
      if (order[0] === order[1]) {
        docTracksLayer.bindPopup(this.createTrackPopup(track.tripname, track.tripid));
        docTracksLayer.setStyle(function(feature) {
          return { color: 'blue',
            weight: 5,
            opacity: .7 };
        });
      }
    });
  }

  private buildFeature(name: string, coordinates: Array<Array<number>>)
  {
    return {
      "type": "Feature",
      "properties": {
        "name": name
      },
      "geometry": {
        "type": "LineString",
        "coordinates": coordinates
      }
    };
  }

  private getLineStringsFromMultilineString(multiline: string): Array<string> {
    let inner = multiline.match(/\(\((.+?)\)\)/)[1];
    return inner.split('),(');
  }

  private getCoordinatesFromLineString(line: string): Array<Array<number>> {
    let coordinates = []
    let points = line.split(',');
    for (let point of points) {
      let latlong = point.split(' ');
      let long = parseFloat(latlong[1]);
      let lat = parseFloat(latlong[0]);
      coordinates.push([lat, long]);
    }
    return coordinates;
  }

  private parseStravaActivities() {
    Papa.parse('https://funemployment.blob.core.windows.net/data/mytrip.csv',
    { download: true,
      skipEmptyLines: true,
      header: true,
      complete: (results, file) => {
        this.activityData = results.data;
        this.addPolylinesToMap();
      }
    });
  }

  private createTrackPopup(name: string, tripid: string): HTMLElement {
    let popup = L.DomUtil.create('div', 'map-popup');
    let title = L.DomUtil.create('h3', 'actitity-title', popup);
    (<HTMLParagraphElement>title).innerText = name;
    let img = L.DomUtil.create('img', 'my-img', popup);
    (<HTMLImageElement>img).src = `https://funemployment.blob.core.windows.net/data/imgs/${tripid}.jpg`;
    return popup;
  }

  private createStravaPopup(activity): HTMLElement {
    let popup = L.DomUtil.create('div', 'map-popup');
    let title = L.DomUtil.create('h3', 'actitity-title', popup);
    (<HTMLParagraphElement>title).innerText = activity.name;
    let detail = L.DomUtil.create('p', 'actitity-detail', popup);
    (<HTMLParagraphElement>detail).innerHTML = `<b>Distance:</b> ${(activity.distance / 1000).toFixed(1)}km`;
    (<HTMLParagraphElement>detail).innerHTML += `<br /><b>Moving Time:</b> ${this.secondsToHms(activity.moving_time)}`;
    (<HTMLParagraphElement>detail).innerHTML += `<br /><b>Elevation Gain:</b> ${activity.total_elevation_gain}m`;
    let img = L.DomUtil.create('img', 'my-img', popup);
    (<HTMLImageElement>img).src = `https://funemployment.blob.core.windows.net/data/imgs/${activity.id}.jpg`;
    return popup;
  }

  secondsToHms(d) {
    d = Number(d);
    var h = Math.floor(d / 3600);
    var m = Math.floor(d % 3600 / 60);
    var s = Math.floor(d % 3600 % 60);

    var hDisplay = h > 0 ? h + "h " : "";
    var mDisplay = m > 0 ? m + "m " : "";
    var sDisplay = s > 0 ? s + "s" : "";
    return hDisplay + mDisplay + sDisplay; 
  }

  private addPolylinesToMap() {
    const LxPolyline = L.Polyline as any as Lx.Polyline;

    for (let activity of this.activityData) {
      let polyline = LxPolyline.fromEncoded(activity.polyline);
      let coordinates = polyline.getLatLngs();

      let color: string;
      switch (activity.type) {
        case 'Run':
         color = 'red';
         break;
        case 'Ride':
          color = 'green';
          break;
        default:
          color = 'blue';
      }

      L.polyline(
        coordinates,
        {
          color: color,
          weight: 5,
          opacity: .7
        }
      )
      .bindPopup(this.createStravaPopup(activity), {autoPanPaddingTopLeft: L.point(0, 25)})
      .addTo(this.map);
    }
  }
}
