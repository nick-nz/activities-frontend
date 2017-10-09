import { autoinject } from 'aurelia-framework';
import * as L from 'leaflet';
import 'https://gist.githubusercontent.com/nick-aranz/cf48b66818e0c225fbf9369483551af8/raw/7bd909667767d38006d2d08be51669b8094e5769/Polyline.encoded.js';
import { HttpClient, json } from 'aurelia-fetch-client';
import 'fetch';
import { Constants } from 'src/constants';

@autoinject
export class StravaActivities {
  private map: L.Map;
  private polylines: string[]

  constructor(private http: HttpClient) {
    http.configure(config => {
      config
        .useStandardConfiguration()
        .withBaseUrl('http://activities-api.azurewebsites.net/api/')
    });
  }

  public async activate() {
    try {
      const response = await this.http.fetch('polyline');
      if (response.ok) {
        const json = await response.json();
        this.polylines = json.polylines;
      }
    } catch (ex) {
      console.log(ex);
    }
  }

  public  attached() {
    this.map = L.map('map').setView([-43.4175044, 172.185657], 8);
    L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
      maxZoom: 18
    }).addTo(this.map);

    this.addPolylinesToMap()
  }

  private addPolylinesToMap()
  {
    const LxPolyline = L.Polyline as any as Lx.Polyline;

    for (let encoded of this.polylines) {
      let polyline = LxPolyline.fromEncoded(encoded);
      let coordinates = polyline.getLatLngs();

      L.polyline(
        coordinates,
        {
          color: 'blue',
          weight: 2,
          opacity: .7,
          lineJoin: 'round'
        }
      ).addTo(this.map);
    }
  }
}
