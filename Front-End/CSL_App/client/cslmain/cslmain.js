import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

import * as mapboxgl from 'mapbox-gl';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import turf from '@turf/turf';

import { rxjs } from 'rxjs';

import { notify } from '../toast/toast';
import { GlobalAppState } from '../global-state';

let map;
let draw = new MapboxDraw();

//Buttons Left Panel Control: ----------
let controlLevelNumber = 0;//set the functionality on the buttons on system
let controlDrawingId = 0;//set the properties on geojson
let controlInputRadius = 15;//set radius when it is on the id: cslgruas.

let CONTROL_TYPE = 0;
let CONTROL_ID = 1;
let CONTROL_MESSAGE = 2;
let CONTROL_COLOR = 3;
let CONTROL_LAST_ID = 4;

let CONTROL_FILLTYPE = 0;
let CONTROL_LINETYPE = 1;
let CONTROL_CIRCLETYPE = 2;

let opacity = 0.6;

let CONTROL_LIST = [
    [CONTROL_FILLTYPE, 'cslplano', 'Establecer las area del plano', '#FFFFFF', ''],
    [CONTROL_FILLTYPE, 'cslbloqueo', 'Establecer las areas bloqueadas', '#F08080', ''],
    [CONTROL_LINETYPE, 'cslacomet', 'Establecer las acometidas', '#FFA500', ''],
    [CONTROL_FILLTYPE, 'cslmaq', 'Establecer los caminos de maquinaria', '#8B4513', ''],
    [CONTROL_FILLTYPE, 'cslconstrucc', 'Establecer la huella de la construcción', '#ffcc00', ''],
    [CONTROL_LINETYPE, 'cslcivil', 'Establecer los caminos de civiles', '#333', ''],
    [CONTROL_CIRCLETYPE, 'cslgruas', 'Establecer las gruas', '#1E90FF', ''],
    [CONTROL_FILLTYPE, 'csllibres', 'Establecer las areas libres', '#90EE90', '']
];

function showButtonOnMapLayer(pElement) {
    list = ['.mapbox-gl-draw_polygon', '.mapbox-gl-draw_line', '.mapbox-gl-draw_point'];
    for (x = 0; x < list.length; x++) {
        if (pElement == x) Template.instance().$(list[pElement]).css("display", 'block');
        else Template.instance().$(list[x]).css("display", 'none');
    }
}

function setControlDraw(pControlDrawId) {
    controlDrawingId = pControlDrawId;
    showButtonOnMapLayer(pControlDrawId);
}

function setNameLayer(pName, pType) {
    layer = {
        "id": pName,
        "type": pType,
        "source": {
            "type": "geojson"
        }
    };
    return layer;
}

function createLayerElement(position) // position from CONTROL_LIST, the function generates a structures that is needed for create a mapbox-layer.
{
    newLayer = {};
    if (CONTROL_LIST[position][CONTROL_TYPE] == CONTROL_FILLTYPE) {
        newLayer = setNameLayer(CONTROL_LIST[position][CONTROL_ID], 'fill');
        CONTROL_LIST[position][CONTROL_LAST_ID] = CONTROL_LIST[position][CONTROL_ID];
        newLayer.paint =
            {
                'fill-color': CONTROL_LIST[position][CONTROL_COLOR],
                'fill-opacity': opacity
            };
    }
    else if (CONTROL_LIST[position][CONTROL_TYPE] == CONTROL_LINETYPE) {
        newLayer = setNameLayer(CONTROL_LIST[position][CONTROL_ID], 'line');
        CONTROL_LIST[position][CONTROL_LAST_ID] = CONTROL_LIST[position][CONTROL_ID];
        newLayer.paint =
            {
                "line-color": CONTROL_LIST[position][CONTROL_COLOR],
                "line-width": 3.5
            };
        newLayer.layout =
            {
                "line-join": "round",
                "line-cap": "round"
            };
    }
    else if (CONTROL_LIST[position][CONTROL_TYPE] == CONTROL_CIRCLETYPE) {
        newLayer = setNameLayer(CONTROL_LIST[position][CONTROL_ID], 'circle');
        CONTROL_LIST[position][CONTROL_LAST_ID] = CONTROL_LIST[position][CONTROL_ID];
        newLayer.paint =
            {
                "circle-radius": {
                    'base': 1.75,
                    'stops': [[12, 2], [23, 50]]
                },
                "circle-color": CONTROL_LIST[position][CONTROL_COLOR],
                'circle-opacity': opacity
            };
    }
    return newLayer;
}

function setDataOnLayer(pData) {
    if (map.getLayer(CONTROL_LIST[controlLevelNumber][CONTROL_ID]) != undefined) {
        map.removeLayer(CONTROL_LIST[controlLevelNumber][CONTROL_ID]);
        map.removeSource(CONTROL_LIST[controlLevelNumber][CONTROL_ID]);
    }
    newLayer = createLayerElement(controlLevelNumber);
    newLayer.source.data = pData;
    map.addLayer(newLayer);

}

function parsingMapJSON() {
    jsonInfo={};
    currResult={};
    jsonInfo.layers = GlobalAppState.project.project_instance.layers ? GlobalAppState.project.project_instance.layers : [];
    layer = {}
    layer.stages = [];
    layer.level = controlLevelNumber;
    for (counter = 0; counter < CONTROL_LIST.length; counter++) {
        currSource= map.getSource(CONTROL_LIST[counter][CONTROL_ID]);
        //console.log(currSource);
        if(currSource!=undefined)
        {
            //console.log(currSource);
            for(counter2=0 ; counter2 < currSource._data.features.length ; counter2++){//viaja atraves de los layers en source
                currResult.description="";
                currResult.variables=[];
                currResult.vectors_sequence=[];
                for(counter3=0; counter3<currSource._data.features[counter2].geometry.coordinates[0].length;counter3++)
                {
                    //console.log(currSource._data.features[counter2].geometry.coordinates[0][counter3]);
                    currResult.vectors_sequence.push({
                        x: currSource._data.features[counter2].geometry.coordinates[0][counter3][0],
                        y: currSource._data.features[counter2].geometry.coordinates[0][counter3][1]
                    });
                }
                layer.stages.push(currResult);
                currResult={};
            }
        }
    }
    if (jsonInfo.layers[layer.level])
        jsonInfo.layers[layer.level] = layer
    else
        jsonInfo.layers.push(layer)
    console.log(jsonInfo);
    return jsonInfo;
}

//-------------------------------------
Template.CSL.onCreated(function homeOnCreated() {
    this.flagControl = new ReactiveVar(false); 
});

Template.CSL.helpers({
    flagControl() {
        return Template.instance().flagControl.get();
    }
});

Template.CSL.events({
    'click #cslmanproy'(event, instance) {
        event.preventDefault();
        instance.$('#modalCreate').css("display", "block");
        console.log(GlobalAppState.project)
        console.log(instance.flagControl.get())
    },
    'click #closecsl'(event, instance) {
        event.preventDefault();
        GlobalAppState.isProjectSelected = false;
        instance.flagControl.set(false)
        Router.go('/login');
    },
    //Boton izquierda
    'click #cslplano'(event, instance) {
        event.preventDefault();
        controlLevelNumber = 0;
        setControlDraw(0);
    },
    'click #cslbloqueo'(event, instance) {
        event.preventDefault();
        controlLevelNumber = 1;
        setControlDraw(0);
    },
    'click #cslacomet'(event, instance) {
        event.preventDefault();
        controlLevelNumber = 2;
        setControlDraw(1);
    },
    'click #cslmaq'(event, instance) {
        event.preventDefault();
        controlLevelNumber = 3;
        setControlDraw(0);
    },
    'click #cslconstrucc'(event, instance) {
        event.preventDefault();
        controlLevelNumber = 4;
        setControlDraw(0);
    },
    'click #cslcivil'(event, instance) {
        event.preventDefault();
        controlLevelNumber = 5;
        setControlDraw(1);
    },
    'click #cslgruas'(event, instance) {
        event.preventDefault();
        controlLevelNumber = 6;
        controlInputRadius = 20; // esto tiene que ser una entrada.
        setControlDraw(2);
    },
    'click #csllibres'(event, instance) {
        event.preventDefault();
        //Aqui hay que establecer las diferencias entre los poligonos para que queden los sectores libres.
        controlLevelNumber = 7;
        setControlDraw(0);
    },
    //Boton arriba derecha
    'click #cslsavestruct'(event, instance) {
        event.preventDefault();
        setDataOnLayer(draw.getAll());
        GlobalAppState.project.project_instance.layers = parsingMapJSON().layers;
        console.log(GlobalAppState.project.project_instance.layers)
        console.log(GlobalAppState.project)
        Meteor.call("saveProject", GlobalAppState.project,
            (error, result) => {
                console.log(result)
                if(result.code > 0){
                    Meteor.call("getProject", {key:GlobalAppState.project.key},
                        (error, result) => {
                            console.log(result)
                            if(result !== undefined){
                                GlobalAppState.project.project_instance = result;                     
                                notify("Proyecto guardado", 3000, 'rounded')
                            }
                            else{
                                notify("Error guardando el proyecto", 3000, 'rounded')        
                            }
                        }
                    )
                    notify("Project: " + result.state.message, 3000, 'rounded')
                }
                else{
                    notify("Project: " + result.state.message, 3000, 'rounded')        
                }
            }
        )
    }
})

Template.CSL.onRendered(
    function () {
        $('.button-collapse').sideNav('show')
        mapboxgl.accessToken = 'pk.eyJ1Ijoiam9zYWx2YXJhZG8iLCJhIjoiY2o2aTM1dmoyMGNuZDJ3cDgxZ2d4eHlqYSJ9.23TgdwGE-zm5-8XUFkz2rQ';
        map = new mapboxgl.Map({
            center: [-84.10563996507328, 9.979042286713366],
            zoom: 5,
            container: 'map',
            style: 'mapbox://styles/josalvarado/cj6nv3ue212172soj1nvlyaia',
            trackResize: true,
            hash: true
        });

        draw = new MapboxDraw({
            displayControlsDefault: false,
            controls: {
                line_string: true,
                point: true,
                polygon: true,
                trash: true
            }
        });

        map.addControl(draw);//add controls on mapbox, set the draw tool
        setControlDraw(0);//Set the button of the first level

        map.on('load', function () {
            var layers = map.getStyle().layers.reverse();
            var labelLayerIdx = layers.findIndex(function (layer) {
                return layer.type !== 'symbol';
            });

            map.on('click', 'cslplano', function (e) {
                console.log(e);
                new mapboxgl.Popup()
                    .setLngLat(e.features[0].geometry.coordinates[0][0])
                    .setHTML("<h1>Here is a ne element</h1>")
                    .addTo(map);
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
        GlobalAppState.project = {
            key: "",
            project_instance: {
                layers: [],
                name: "",
                zoom: 0,
                reference: {
                    x: -1,
                    y: -1
                }
            }
        }
        GlobalAppState.projectSelectedEvent = Template.instance().flagControl
    }
);