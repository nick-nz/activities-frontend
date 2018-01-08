import {Router, RouterConfiguration} from 'aurelia-router';

export class App {
  public router: Router;

  public configureRouter(config: RouterConfiguration, router: Router) {
    config.title = 'Funemployment';
    config.map([
      { route: '', name: 'strava-activities', moduleId: 'strava-activities', nav: true, title: 'Activities' }
    ]);

    this.router = router;
  }
}
