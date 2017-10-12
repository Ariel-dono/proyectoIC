import './startup.html';
import * as mapboxgl from 'mapbox-gl';
import * as rxjs from 'rxjs'; 

Template.startup.onRendered(
  function() {
        setTimeout(()=>{
            Router.go('/login');
        },10000)
  }
);