import './startup.html';
import * as mapboxgl from 'mapbox-gl';
import * as rxjs from 'rxjs'; 

Template.startup.onRendered(
  function() {
        mapboxgl.accessToken = 'pk.eyJ1Ijoiam9zYWx2YXJhZG8iLCJhIjoiY2o2aTM1dmoyMGNuZDJ3cDgxZ2d4eHlqYSJ9.23TgdwGE-zm5-8XUFkz2rQ';
        var map = new mapboxgl.Map({
            center: [-68.13734351262877, 45.137451890638886],
            zoom: 2,
            container: 'map',
            style: 'mapbox://styles/josalvarado/cj6nv3ue212172soj1nvlyaia'
        });
        setTimeout(()=>{
            Router.go('/login');
        },35000)
  }
);