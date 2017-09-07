import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import {GlobalState} from '../global-state';
import * as mapboxgl from 'mapbox-gl';
import  MapboxDraw  from '@mapbox/mapbox-gl-draw';
import turf from '@turf/turf';

import {rxjs} from 'rxjs';



var flagControl=0;
const radius = 10;
function pointOnCircle(lng,lat) {
    return {
        "type": "Point",
        "coordinates": [
            lng,  
            lat
        ]
    };
}

Template.CSL.onCreated(function homeOnCreated() {
    this.flagControl = new ReactiveVar(1);
});

Template.CSL.helpers({
    flagControl(){
        return Template.instance().flagControl.get();
    },
    namespace(){
        return Template.instance().namespace.get();
    }
});

Template.CSL.events({
    'click #cslnewproy'(event, instance) {
        event.preventDefault();
        Router.go('/login');
      },
    'click #cslabrirproy'(event, instance) {
        event.preventDefault();
        console.log(GlobalState.namespacing)  
      },
    'click #cslsaveproy'(event, instance) {
        event.preventDefault();
        Router.go('/login');
      },
    'click #closecsl'(event, instance) {
        event.preventDefault();
        Router.go('/login');
      },
      //Boton izquierda
      'click #cslplano'(event, instance) {
        event.preventDefault();
        if(Template.instance().flagControl.get()==1){
            notify("Establecer las area del plano", 3000, 'rounded')
        }
        Router.go('/login');
      },
      'click #cslbloqueo'(event, instance) {
        event.preventDefault();
        if(Template.instance().flagControl.get()==2){
            notify("Establecer las areas bloqueadas", 3000, 'rounded')
        }
        Router.go('/login');
      },
      'click #cslacomet'(event, instance) {
        event.preventDefault();
        if(Template.instance().flagControl.get()==3){
            notify("Establecer las acometidas", 3000, 'rounded')
        }
        Router.go('/login');
      },
      'click #cslmaq'(event, instance) {
        event.preventDefault();
        if(Template.instance().flagControl.get()==4){
            notify("Establecer los caminos de maquinaria", 3000, 'rounded')
        }
        Router.go('/login');
      },
      'click #cslhuella'(event, instance) {
        event.preventDefault();
        if(Template.instance().flagControl.get()==5){
            notify("Establecer las areas bloqueadas", 3000, 'rounded')
        }
        Router.go('/login');
      },
      'click #cslcivil'(event, instance) {
        event.preventDefault();
        if(Template.instance().flagControl.get()==6){
            notify("Establecer las areas bloqueadas", 3000, 'rounded')
        }
        Router.go('/login');
      },
      'click #cslgruas'(event, instance) {
        event.preventDefault();
        if(Template.instance().flagControl.get()==7){
            notify("Establecer las areas bloqueadas", 3000, 'rounded')
        }
        Router.go('/login');
      },
      'click #csllibres'(event, instance) {
        event.preventDefault();
        if(Template.instance().flagControl.get()==8){
            notify("Establecer las areas bloqueadas", 3000, 'rounded')
        }
        Router.go('/login');
      },
      //Boton arriba derecha
      'click #cslsavestruct'(event, instance) {
        event.preventDefault();
        Template.instance().flagControl.set(Template.instance().flagControl.get()+1);
        console.log(Template.instance().flagControl.get());
      }
})
Template.CSL.onRendered(
    function() {
        mapboxgl.accessToken = 'pk.eyJ1Ijoiam9zYWx2YXJhZG8iLCJhIjoiY2o2aTM1dmoyMGNuZDJ3cDgxZ2d4eHlqYSJ9.23TgdwGE-zm5-8XUFkz2rQ';
        
        var map = new mapboxgl.Map({
            center: [-84.10563996507328,  9.979042286713366],
            zoom: 5,
            container: 'map',
            style: 'mapbox://styles/josalvarado/cj6nv3ue212172soj1nvlyaia',
            trackResize:true,
            hash: true
        });

        var draw = new MapboxDraw();
        map.addControl(draw);
        
        map.on('load', function () {
            map.addLayer({
                'id': 'maine',
                'type': 'fill',
                'source': {
                    'type': 'geojson',
                    'data': {
                        'type': 'Feature',
                        'geometry': {
                            'type': 'Polygon',
                            'coordinates': [[[-67.13734351262877, 45.137451890638886],
                                [-66.96466, 44.8097],
                                [-68.03252, 44.3252],
                                [-69.06, 43.98],
                                [-70.11617, 43.68405],
                                [-70.64573401557249, 43.090083319667144],
                                [-70.75102474636725, 43.08003225358635],
                                [-70.79761105007827, 43.21973948828747],
                                [-70.98176001655037, 43.36789581966826],
                                [-70.94416541205806, 43.46633942318431],
                                [-71.08482, 45.3052400000002],
                                [-70.6600225491012, 45.46022288673396],
                                [-70.30495378282376, 45.914794623389355],
                                [-70.00014034695016, 46.69317088478567],
                                [-69.23708614772835, 47.44777598732787],
                                [-68.90478084987546, 47.184794623394396],
                                [-68.23430497910454, 47.35462921812177],
                                [-67.79035274928509, 47.066248887716995],
                                [-67.79141211614706, 45.702585354182816],
                                [-67.13734351262877, 45.137451890638886]]]
                        }
                    }
                },
                'layout': {},
                'paint': {
                    'fill-color': '#088',
                    'fill-opacity': 0.1
                }
            });



            // Insert the layer beneath any symbol layer.
            var layers = map.getStyle().layers.reverse();
            var labelLayerIdx = layers.findIndex(function (layer) {
                return layer.type !== 'symbol';
            });
            var labelLayerId = labelLayerIdx !== -1 ? layers[labelLayerIdx].id : undefined;
            map.addLayer({
                'id': '3d-buildings',
                'source': 'composite',
                'source-layer': 'building',
                'filter': ['==', 'extrude', 'true'],
                'type': 'fill-extrusion',
                'minzoom': 15,
                'paint': {
                    'fill-extrusion-color': '#FFF9C4',
                    'fill-extrusion-height': {
                        'type': 'identity',
                        'property': 'height'
                    },
                    'fill-extrusion-base': {
                        'type': 'identity',
                        'property': 'min_height'
                    },
                    'fill-extrusion-opacity': .7
                }
            }, labelLayerId);
        }
    );
         /*
        var calcButton = document.getElementById('calculate');

        calcButton.onclick = function() {
            console.log(draw.getAll());
            console.log(draw.getAll().features[0].id);
            console.log('lgt -> '+draw.getAll().features[0].geometry.coordinates[0][0][0]);
            console.log('lat -> '+draw.getAll().features[0].geometry.coordinates[0][0][1]);
            var data = draw.getAll();
            if (data.features.length > 0) {
                var area = turf.area(data);
                // restrict to area to 2 decimal points
                var rounded_area = Math.round(area*100)/100;
                var answer = document.getElementById('calculated-area');
                answer.innerHTML = '<p><strong>' + rounded_area + '</strong></p><p>square meters</p>';
            } else {
                alert("Use the draw tools to draw a polygon!");
            }
        };*/

        /*
        
        map.on('click', function (e){
            console.log(e.lngLat);
            console.log(e.lngLat.lng);
            console.log(e.lngLat.lat);
            
        });
        var calcButton = document.getElementById('calculate');
        calcButton.onclick = function() {
            var data = draw.getAll();
            if (data.features.length > 0) {
                var area = turf.area(data);
                // restrict to area to 2 decimal points
                var rounded_area = Math.round(area*100)/100;
                var answer = document.getElementById('calculated-area');
                answer.innerHTML = '<p><strong>' + rounded_area + '</strong></p><p>square meters</p>';
            } else {
                alert("Use the draw tools to draw a polygon!");
            }
        };
        
        /* map.on('click', function (e){/*
                console.log(e.lngLat);
                console.log(e.lngLat.lng);
                console.log(e.lngLat.lat);
                
                // Start the animation.
                //map.getSource('points').setData(pointOnCircle(e.lngLat.lng,e.lngLat.lat));
                map.addLayer({
                    'id': 'maine',
                    'type': 'fill',
                    'source': {
                        'type': 'geojson',
                        'data': {
                            'type': 'Feature',
                            'geometry': {
                                'type': 'Polygon',
                                'coordinates': [[[-67.13734351262877, 45.137451890638886],
                                    [-66.96466, 44.8097],
                                    [-68.03252, 44.3252],
                                    [-69.06, 43.98],
                                    [-70.11617, 43.68405],
                                    [-70.64573401557249, 43.090083319667144],
                                    [-70.75102474636725, 43.08003225358635],
                                    [-70.79761105007827, 43.21973948828747],
                                    [-70.98176001655037, 43.36789581966826],
                                    [-70.94416541205806, 43.46633942318431],
                                    [-71.08482, 45.3052400000002],
                                    [-70.6600225491012, 45.46022288673396],
                                    [-70.30495378282376, 45.914794623389355],
                                    [-70.00014034695016, 46.69317088478567],
                                    [-69.23708614772835, 47.44777598732787],
                                    [-68.90478084987546, 47.184794623394396],
                                    [-68.23430497910454, 47.35462921812177],
                                    [-67.79035274928509, 47.066248887716995],
                                    [-67.79141211614706, 45.702585354182816],
                                    [-67.13734351262877, 45.137451890638886]]]
                            }
                        }
                    },
                    'layout': {},
                    'paint': {
                        'fill-color': '#088',
                        'fill-opacity': 0.1
                    }
                });

                //map.getSource('points').setData(pointOnCircle(e.lngLat.lng,e.lngLat.lat));
                console.log(map.getSource('maine').data);

        });

        map.on('mousemove', function (e) {
            document.getElementById('info').innerHTML =
                // e.point is the x, y coordinates of the mousemove event relative
                // to the top-left corner of the map
                JSON.stringify(e.point) + '<br />' +
                // e.lngLat is the longitude, latitude geographical position of the event
                JSON.stringify(e.lngLat);
        });

        map.on('load', function () {
            
            //
            map.addSource('points', {
                "type": "geojson",
                "data": pointOnCircle(0,0)
            });

            map.addLayer({
                "id": "point",
                "source": "points",
                "type": "circle",
                "paint": {
                    "circle-radius": 4,
                    "circle-color": "#B40404"
                }
            });
        });
        */

    }
);