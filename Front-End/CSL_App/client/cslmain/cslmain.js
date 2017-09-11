import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

import * as mapboxgl from 'mapbox-gl';
import  MapboxDraw  from '@mapbox/mapbox-gl-draw';
import turf from '@turf/turf';

import {rxjs} from 'rxjs';

import {notify} from '../toast/toast';
import { GlobalState } from '../global-state';

var map;
var draw;


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

function setLayer(pName,pData,pColor,pType,pRadio){
    try{
        map.removeSource(pName);
    }
    catch(e){}
    if(pType==1)
    {
        map.addLayer({
            'id': pName,
            'type': 'fill',
            'source': {
                'type': 'geojson',
                'data': pData
            },
            'layout': {},
            'paint': {
                'fill-color': pColor,
                'fill-opacity': 0.45
            }
        });
    }
    else if(pType==2){
        map.addLayer({
            "id": pName,
            "type": "line",
            "source": {
                "type": "geojson",
                "data": pData
            },
            "layout": {
                "line-join": "round",
                "line-cap": "round"
            },
            "paint": {
                "line-color": pColor,
                "line-width": 5
            }
        })
    }
    else if(pType==3){
        map.addLayer({
            "id": pName,
            "type": "circle",
            "source": {
                "type": "geojson",
                "data": pData
            },
            "paint": {
                "circle-radius": pRadio,
                "circle-color": "#B42222",
                'circle-opacity': 0.8
            }
        })
    }
    
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
    },
    projectName(){
        return Template.instance().projectName.get();
    }
});

Template.CSL.events({
    'click #cslmanproy'(event, instance) {
        event.preventDefault();
        instance.$('#modalCreate').css("display", "block");
        console.log(GlobalState.namespacing)
    },
    'click #closecsl'(event, instance) {
        event.preventDefault();
        Router.go('/login');
    },
    //Boton izquierda
    'click #cslplano'(event, instance) {
        event.preventDefault();
        
        notify("Establecer las area del plano", 3000, 'rounded');
        setLayer('cslplano',draw.getAll(),'#FFFFFF',1,0);
    },
    'click #cslbloqueo'(event, instance) {
        event.preventDefault();
        notify("Establecer las areas bloqueadas", 3000, 'rounded');
        setLayer('cslbloqueo',draw.getAll(),'#F08080',1,0);
    
    },
    'click #cslacomet'(event, instance) {
        event.preventDefault();
        notify("Establecer las acometidas", 3000, 'rounded');
        setLayer('cslacomet',draw.getAll(),'#FFA500',2,0);
    
    },
    'click #cslmaq'(event, instance) {
        event.preventDefault();
        notify("Establecer los caminos de maquinaria", 3000, 'rounded');
        setLayer('cslmaq',draw.getAll(),'#8B4513',1,0);
    
    },
    'click #cslhuella'(event, instance) {
        event.preventDefault();
        notify("Establecer la huella de la construcción", 3000, 'rounded');
        setLayer('cslhuella',draw.getAll(),'#ffcc00',1,0);
    },
    'click #cslcivil'(event, instance) {
        event.preventDefault();
        notify("Establecer los caminos de civiles", 3000, 'rounded');
        setLayer('cslcivil',draw.getAll(),'#333',2,0);
    },
    'click #cslgruas'(event, instance) {
        event.preventDefault();
        notify("Establecer las gruas", 3000, 'rounded');
        setLayer('cslgruas',draw.getAll(),'#1E90FF',3,100);
    },
    'click #csllibres'(event, instance) {
        event.preventDefault();
        notify("Establecer las areas libres", 3000, 'rounded');
        setLayer('csllibres',draw.getAll(),'#90EE90',1,0);
    },
    //Boton arriba derecha
    'click #cslsavestruct'(event, instance) {
        event.preventDefault();
        notify('Insertar elemento');
        console.log(Template.instance().flagControl.get());
    }
})
Template.CSL.onRendered(
    function() {
        mapboxgl.accessToken = 'pk.eyJ1Ijoiam9zYWx2YXJhZG8iLCJhIjoiY2o2aTM1dmoyMGNuZDJ3cDgxZ2d4eHlqYSJ9.23TgdwGE-zm5-8XUFkz2rQ';
        map = new mapboxgl.Map({
            center: [-84.10563996507328,  9.979042286713366],
            zoom: 5,
            container: 'map',
            style: 'mapbox://styles/josalvarado/cj6nv3ue212172soj1nvlyaia',
            trackResize:true,
            hash: true
        });

        draw = new MapboxDraw({
            displayControlsDefault: false,
            controls: {
                polygon: true,
                trash: true
            }
        });
        draw = new MapboxDraw();
        map.addControl(draw);

        map.on('load', function () {
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

        });

    }
);