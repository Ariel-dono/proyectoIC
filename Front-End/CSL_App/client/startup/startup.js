import './startup.html';
import * as mapboxgl from 'mapbox-gl';
import * as rxjs from 'rxjs'; 

Template.startup.onRendered(
  Router.go('/login')
);