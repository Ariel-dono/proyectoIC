import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import {notify} from '../toast/toast';
import {GlobalState} from '../global-state';

import * as mapboxgl from 'mapbox-gl';
import  MapboxDraw  from '@mapbox/mapbox-gl-draw';
import turf from '@turf/turf';

import {rxjs} from 'rxjs';

let map;
let draw = new MapboxDraw();

//Buttons Left Panel Control: ----------
let controlLevelNumber=0;//set the functionality on the buttons on system
let controlDrawingId=0;//set the properties on geojson
let controlInputRadius=15;//set radius when it is on the id: cslgruas.

let CONTROL_ID=0;
let CONTROL_MESSAGE=1;
let CONTROL_COLOR=2;

let CONTROL_LIST=[
    ['cslplano','Establecer las area del plano','#FFFFFF'],
    ['cslbloqueo','Establecer las areas bloqueadas','#F08080'],
    ['cslacomet','Establecer las acometidas','#FFA500'],
    ['cslmaq','Establecer los caminos de maquinaria','#8B4513'],
    ['cslhuella','Establecer la huella de la construcción','#ffcc00'],
    ['cslcivil','Establecer los caminos de civiles','#333'],
    ['cslgruas','Establecer las gruas','#1E90FF'],
    ['csllibres','Establecer las areas libres','#90EE90']
];

function showButtonOnMapLayer(pElement){
    list=['.mapbox-gl-draw_polygon','.mapbox-gl-draw_line','.mapbox-gl-draw_point'];
    for(x=0 ;x<list.length;x++)
    {
        console.log(x);
        if(pElement==x) Template.instance().$(list[pElement]).css("display", 'block');
        else Template.instance().$(list[x]).css("display", 'none');
    }
}

function setControlDraw(pControlDrawId){
    controlDrawingId=pControlDrawId;
    showButtonOnMapLayer(pControlDrawId);
}

function setLayer(pName,pData,pColor,pType,pRadio){//funcion tiene un bug visual, repinta los objetos despues e reposicionarlos
    try{
        map.removeSource(pName);
    }
    catch(e){}
    if(pType==0)
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
    else if(pType==1){
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
                "line-width": 3.5
            }
        })
    }
    else if(pType==2){
        map.addLayer({
            "id": pName,
            "type": "circle",
            "source": {
                "type": "geojson",
                "data": pData
            },
            "paint": {
                "circle-radius":  {
                    'base': 1.75,
                    'stops': [[12, 2], [23, 50]]
                },
                "circle-color": "#B42222",
                'circle-opacity': 0.2
            }
        })
    }
}

//-------------------------------------
Template.CSL.onCreated(function homeOnCreated() {
    this.flagControl = new ReactiveVar(1);
    this.projectName = new ReactiveVar('');
});

Template.CSL.helpers({
    flagControl(){
        return Template.instance().flagControl.get();
    },
    namespace(){
        return Template.instance().namespace.get();
    },
    projectName(){
        return Template.instance().namespace.get();
    }
});

Template.CSL.events({
    'click #cslnewproy'(event, instance) {
        event.preventDefault();
        instance.$('#modal1').css("display", "block");
      },
    'click #cslabrirproy'(event, instance) {
        event.preventDefault();
        console.log(GlobalState.namespacing)
        instance.$('#modal1').css("display", "block");
      },
    'click #cslsaveproy'(event, instance) {
        event.preventDefault();
        instance.$('#modal1').css("display", "block");
      },
    'click #closeModal'(event, instance) {
        event.preventDefault();
        instance.$('#modal1').css("display", "none");
        if(GlobalState.namespacing.projects === null)
            GlobalState.namespacing.projects=[]
        Meteor.call("updateProjects",{
            "username": GlobalState.namespacing.username,
            "projects": GlobalState.namespacing.projects.push(Template.instance().namespace.get())
          },
          (error, result) => {
            console.log(result)
          }
        )
      },
    'click #closecsl'(event, instance) {
        event.preventDefault();
        Router.go('/login');
      },
        //Boton izquierda
        'click #cslplano'(event, instance) {
        event.preventDefault();
            controlLevelNumber=0;
            setControlDraw(0);
        },
        'click #cslbloqueo'(event, instance) {
        event.preventDefault();
            controlLevelNumber=1;
            setControlDraw(0);
            controlDrawingId=0;
            showButtonOnMapLayer(controlDrawingId);
        },
        'click #cslacomet'(event, instance) {
        event.preventDefault();
            controlLevelNumber=2;
            setControlDraw(1);
        },
        'click #cslmaq'(event, instance) {
        event.preventDefault();
            controlLevelNumber=3;
            setControlDraw(0);
        },
        'click #cslhuella'(event, instance) {
        event.preventDefault();
            controlLevelNumber=4;
            setControlDraw(0);
        },
        'click #cslcivil'(event, instance) {
        event.preventDefault();
            controlLevelNumber=5;
            setControlDraw(1);
        },
        'click #cslgruas'(event, instance) {
        event.preventDefault();
            controlLevelNumber=6;
            controlInputRadius=20; // esto tiene que ser una entrada.
            setControlDraw(2);
        },
        'click #csllibres'(event, instance) {
        event.preventDefault();
            //Aqui hay que establecer las diferencias entre los poligonos para que queden los sectores libres.
            controlLevelNumber=7;
            setControlDraw(0);
        },
        //Boton arriba derecha
        'click #cslsavestruct'(event, instance) {
        event.preventDefault();
            //establece el layer con source y formato de dibujo, con el id especifico.
            setLayer(
                CONTROL_LIST[controlLevelNumber][CONTROL_ID],
                draw.getAll(),
                CONTROL_LIST[controlLevelNumber][CONTROL_COLOR],
                controlDrawingId
            );
        },
        'change #projectNameField': function(event,instance) {
            instance.projectName.set(event.target.value);
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
                line_string:true,
                point:true,
                polygon: true,
                trash: true
            }
        });
        
        map.addControl(draw);
        setControlDraw(0);

        map.on('load', function () {
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