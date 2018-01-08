import { autoinject } from 'aurelia-framework';
import * as L from 'leaflet';
import 'https://gist.githubusercontent.com/nick-aranz/cf48b66818e0c225fbf9369483551af8/raw/7bd909667767d38006d2d08be51669b8094e5769/Polyline.encoded.js';
import 'fetch';
import * as Papa from 'papaparse'

@autoinject
export class StravaActivities {
  private map: L.Map;
  private polylines: string[];
  private activityData;

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

    Papa.parse('https://funemployment.blob.core.windows.net/data/mytrip.csv',
    { download: true,
      skipEmptyLines: true,
      header: true,
      complete: (results, file) =>
      {
        console.log('Parsing complete');
        this.activityData = results.data;
        this.addPolylinesToMap();
      }
    });
  }

  private createPopup(activity): HTMLElement {
    let popup = L.DomUtil.create('div', 'map-popup');
    let title = L.DomUtil.create('p', 'actitity-title', popup);
    (<HTMLParagraphElement>title).innerText = activity.name;
    let detail = L.DomUtil.create('p', 'actitity-detail', popup);
    (<HTMLParagraphElement>detail).innerHTML = `<b>Distance:</b> ${(activity.distance / 1000).toFixed(1)}km`;
    (<HTMLParagraphElement>detail).innerHTML += `<br /><b>Moving Time:</b> ${activity.moving_time}`;
    (<HTMLParagraphElement>detail).innerHTML += `<br /><b>Elevation Gain:</b> ${activity.total_elevation_gain}m`;
    let img = L.DomUtil.create('img', 'my-img', popup);
    (<HTMLImageElement>img).src = `https://funemployment.blob.core.windows.net/data/imgs/${activity.id}.jpg`;
    img.onerror = this.imageError;
    return popup;
  }

  private imageError(this: HTMLElement, ev: ErrorEvent) {
    (<HTMLImageElement>this).src = '';
  }

  private addPolylinesToMap() {
    const LxPolyline = L.Polyline as any as Lx.Polyline;

    for (let activity of this.activityData) {
      let polyline = LxPolyline.fromEncoded(activity.polyline);
      let coordinates = polyline.getLatLngs();

      L.polyline(
        coordinates,
        {
          color: activity.type === 'Ride' ? 'blue' : 'red',
          weight: 4,
          opacity: .7,
          lineJoin: 'round'
        }
      )
      .bindPopup(this.createPopup(activity))
      .addTo(this.map);
    }
  }
}
