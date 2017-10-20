import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

import * as mapboxgl from 'mapbox-gl';
import * as MapboxGeocoder from 'mapbox-gl-geocoder';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import turf from '@turf/turf';

import { rxjs } from 'rxjs';
import { notify } from '../toast/toast';
import { GlobalAppState } from '../global-state';

GlobalAppState.map;
GlobalAppState.draw = new MapboxDraw();

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

let CONTROL_SITE_POSITION=0;

//agregar al arreglo
let CONTROL_LIST = [
    [CONTROL_FILLTYPE, 'cslplano', 'Establecer las area del plano', '#FFFFFF', ''],
    [CONTROL_FILLTYPE, 'cslbloqueo', 'Establecer las areas bloqueadas', '#F08080', ''],
    [CONTROL_LINETYPE, 'cslacomet', 'Establecer las acometidas', '#FFA500', ''],
    [CONTROL_FILLTYPE, 'cslmaq', 'Establecer los caminos de maquinaria', '#8B4513', ''],
    [CONTROL_FILLTYPE, 'csllibres', 'Establecer las areas libres', '#90EE90', ''],
    [CONTROL_LINETYPE, 'cslcivil', 'Establecer los caminos de civiles', '#333', ''],
    [CONTROL_CIRCLETYPE, 'cslgruas', 'Establecer las gruas', '#1E90FF', ''],
    [CONTROL_FILLTYPE, 'cslconstrucc', 'Establecer la huella de la construcción', '#ffcc00', '']
]


//=================================================Estructura de geojason=========================================================


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

function createLayerElement(position) {// position from CONTROL_LIST, the function generates a structures that is needed for create a mapbox-layer.
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

function temporal(data){
    GlobalAppState.map.addLayer({
        'id': 'maine',
        'type': 'fill',
        'source': {
            'type': 'geojson',
            'data': data
        },
        'layout': {},
        'paint': {
            'fill-color': '#088',
            'fill-opacity': 0.8
        }
    });
}

function initAllLevels(){
    for(counter=0;counter<CONTROL_LIST.length;counter++){
        setDataOnLayer({
            type:"FeatureCollection",
            features: []
        });
    }
}

//======================Validaciones de Colisiones de los Stages========================================================================

function isContainedOnSite(pData,pControlLevelNumber,pLevelNumber){
    var site=turf.polygon(GlobalAppState.map.getSource(CONTROL_LIST[pLevelNumber][CONTROL_ID])._data.features[0].geometry.coordinates);
    for(counter=0;counter<pData.features.length;counter++){
        var inputElement= turf.polygon(pData.features[counter].geometry.coordinates);
        var difference = turf.difference(inputElement, site);//opuesto me da el area restante de inputElement
        if(difference!=undefined)
            return false;
    }
    return true;
}

function featureEqualFeature(firstPolygon,secondPolygon){
    if(firstPolygon.geometry.coordinates[0].length == secondPolygon.geometry.coordinates[0].length)
    {
        for(counter=0; counter < firstPolygon.geometry.coordinates[0].length;counter++){
            x1=firstPolygon.geometry.coordinates[0][counter][0];
            y1=firstPolygon.geometry.coordinates[0][counter][1];
            isWithin=false;
            for(counter2=0;counter2<secondPolygon.geometry.coordinates[0].length;counter2++){
                x2=secondPolygon.geometry.coordinates[0][counter2][0];
                y2=secondPolygon.geometry.coordinates[0][counter2][1];
                isWithin = (isWithin || (x1==x2 && y1==y2));
            }
            if(!isWithin) 
                return false;
        }
        return true;
    }
    return false;
}

function colissionOn2Poly(pFirst,pSecond){
    var difference = turf.difference(pFirst, pSecond);//opuesto me da el area restante de inputElement
    if(!featureEqualFeature(pFirst,difference)){//Tienen interseccion dif vacio: false / Tienen interseccion igual vacio: true
        return true;
    }
    return false;
}

function existCollision(pData,pControlLevelNumber){
    var retorno=false;
    //console.log("length stages: "+pData.features.length)
    var counter,counter2;
    for(counter=0; counter < pData.features.length;counter++){
        var inputElement= turf.polygon(pData.features[counter].geometry.coordinates);
        //validar que no choque con los stages traidos.
        for(counter2=counter+1; counter2 < pData.features.length;counter2++){
            if(counter==counter2) {continue;} 
            var auxiliar=turf.polygon(pData.features[counter2].geometry.coordinates);
            if(colissionOn2Poly(inputElement,auxiliar)){
                retorno=(retorno || true)
            }
        } 
        //validar que no choque con algun stage de algun nivel
        for(counterLayer=1;counterLayer<CONTROL_LIST.length;counterLayer++){
            //filtrar los unicos
            if(controlLevelNumber!=counterLayer){
                if(counterLayer == 3 || counterLayer == 1 || counterLayer == 7){
                    if(GlobalAppState.map.getSource(CONTROL_LIST[counterLayer][CONTROL_ID])!=undefined){
                        for(counterStage=0;counterStage<GlobalAppState.map.getSource(CONTROL_LIST[counterLayer][CONTROL_ID])._data.features.length;counterStage++){
                            var auxiliar=turf.polygon(GlobalAppState.map.getSource(CONTROL_LIST[counterLayer][CONTROL_ID])._data.features[counterStage].geometry.coordinates)
                            if(colissionOn2Poly(inputElement,auxiliar)){
                                retorno=(retorno || true)
                            }
                        }
                    }
                }
            }
        }
    }
    //console.log("WTF3 "+counter )
    return retorno;
}

//por ahora no se esta usando esta funcion.
function typeLineOnSite(pData,pControlLevelSitePosition){
    var site=turf.polygon(GlobalAppState.map.getSource(CONTROL_LIST[pControlLevelSitePosition][CONTROL_ID])._data.features[0].geometry.coordinates);    
    result=true;
    for(counterStage=0; counterStage< pData.features.length; counterStage++){
        console.log("dat:")
        console.log(pData.features[counterStage].geometry.coordinates.length);
        for(counter=0; counter < pData.features[counterStage].geometry.coordinates.length; counter++){
            console.log("InnerCounter: "+counter);
            console.log(pData.features[counterStage].geometry.coordinates[counter]);
            var point = turf.point(pData.features[counterStage].geometry.coordinates[counter]);
            if(!turf.inside(point, site)){
                result=false;
            }
        }
    }
    return result;
}

//Tema de diseno es necesario bloquear el area del sitio para que el resto de elementos se puedan establecer.
function isValidatedLevel(pData, pControlLevelNumber){
    if (pControlLevelNumber==0){//Si se encuentra en el area del sitio.
        if(pData.features.length>0){//Haya al menos una figura de entrada.
            return true;//A futuro si se desea modificar el area del sitio, se debera validar que esta area contiene a todos los demas.
        }
    }
    else if (pControlLevelNumber<=CONTROL_LIST.length && pControlLevelNumber>=1){
        if(pData.features.length>0){//Haya al menos una figura de entrada.
            if(CONTROL_FILLTYPE==CONTROL_LIST[pControlLevelNumber][CONTROL_TYPE]){
                //no existe niguna collision y se encuentra contenido en el nivel del sitio(nivel 0).
                if(isContainedOnSite(pData,pControlLevelNumber,CONTROL_SITE_POSITION)){
                        //valida si no hay alguna colision
                        if(!existCollision(pData,pControlLevelNumber)){
                            return true;
                        }
                        else{
                            notify("Existe una collision con otro elemento", 3000, 'rounded')
                        }
                }
                else{
                    notify("Elemento debe estar contenido en el area del sitio", 3000, 'rounded')
                }
            }
            else if(CONTROL_LINETYPE==CONTROL_LIST[pControlLevelNumber][CONTROL_TYPE])
            {
                if(typeLineOnSite(pData,CONTROL_SITE_POSITION)){
                    return true;
                }
                else{
                    notify("Elemento debe estar contenido en el area del sitio", 3000, 'rounded')
                }
            }
            else{
                return true;
            }
        }   
    }
    else {
        //el area 8 es igual al nivel [0] menos la interseccion de los niveles [1,6]
        //hace un llamado al mapa para pintar el area libre del mapa.
    }
    return false;
}


//======================Control de layers en Map========================================================================

function layerExists(pControlNumb){
    if(GlobalAppState.map.getLayer(CONTROL_LIST[pControlNumb][CONTROL_ID]) != undefined)
        return true;
    return false;
}

function deleteLayer(pControlNumb){
    GlobalAppState.map.removeLayer(CONTROL_LIST[controlLevelNumber][CONTROL_ID]);
    GlobalAppState.map.removeSource(CONTROL_LIST[controlLevelNumber][CONTROL_ID]);
}

function createLayer(pControlNumb,pData){
    newLayer = createLayerElement(controlLevelNumber);
    newLayer.source.data = pData;
    GlobalAppState.map.addLayer(newLayer);
}

function setDataOnLayer(pData) {
    if (layerExists(controlLevelNumber)){
        if (isValidatedLevel(pData,controlLevelNumber)){
            deleteLayer(controlLevelNumber);
            createLayer(controlLevelNumber,pData);
        }
    }
    else{
        if (isValidatedLevel(pData,controlLevelNumber)){
            createLayer(controlLevelNumber,pData);
        }
    }
}


//======================Parser GEOJSON========================================================================


function parsingMapJSON() {
    jsonInfo={};
    jsonInfo.layers = GlobalAppState.project.project_instance.layers ? GlobalAppState.project.project_instance.layers : []
    layer = {}
    layer.level=controlLevelNumber
    currSource= GlobalAppState.map.getSource(CONTROL_LIST[layer.level][CONTROL_ID]);
    if(currSource!=undefined)
    {
        layer.stages=[]
        for(counter2=0 ; counter2 < currSource._data.features.length ; counter2++){//viaja atraves de los layers en source
            currResult={}
            currResult.description=""
            currResult.variables=[]
            currResult.vectors_sequence=[]
            for(counter3=0; counter3<currSource._data.features[counter2].geometry.coordinates[0].length;counter3++)
            {
                //console.log(currSource._data.features[counter2].geometry.coordinates[0][counter3]);
                currResult.vectors_sequence.push({
                    x: currSource._data.features[counter2].geometry.coordinates[0][counter3][0],
                    y: currSource._data.features[counter2].geometry.coordinates[0][counter3][1]
                })
            }
            layer.stages.push(currResult)
        }
        if (jsonInfo.layers[layer.level])
            jsonInfo.layers[layer.level] = layer
        else
            jsonInfo.layers.push(layer)
    }

    //console.log("Resultado de parseo:" +jsonInfo);
    return jsonInfo;
}


export function loadProject(pProject){
    //console.log("Traido de la BD:"+pProject);
    levelList=new Array();
    //inicializar una lista de collections
    //console.log("F1:"+CONTROL_LIST.length);
    for(counter=0;counter<CONTROL_LIST.length;counter++){
        levelList.push({
            type:"FeatureCollection",
            features:[]
        });
    }
    //por cada poligono
    /*
    console.log("------ENTRADA------------");
    console.log(pProject);
    console.log("---------------------------");
    */
    //console.log("Cantidad LAYERS:"+pProject.project_instance.layers.length);
    for(var counter=0;counter<pProject.project_instance.layers.length;counter++){
        //console.log("Cantidad stages por layer:"+pProject.project_instance.layers[counter].stages.length);
        for(var counter2=0;counter2<pProject.project_instance.layers[counter].stages.length;counter2++){
            var feature=new Object();
            feature.properties=new Object();
            feature.type="Feature";
            feature.id="c"+counter+"cc"+counter2+"level"+pProject.project_instance.layers[counter].level;
            var geometry=new Object();
            geometry.type="Polygon";
            geometry.coordinates=new Array();
            //nivel de description y variables
            geometry.coordinates.push([]);
            for(var counter3=0;counter3<pProject.project_instance.layers[counter].stages[counter2].vectors_sequence.length;counter3++){
                x=pProject.project_instance.layers[counter].stages[counter2].vectors_sequence[counter3].x;
                y=pProject.project_instance.layers[counter].stages[counter2].vectors_sequence[counter3].y;
                geometry.coordinates[0].push([x,y]);
            }
            feature.geometry=geometry;
            levelList[pProject.project_instance.layers[counter].level].features.push(feature);
        }
    }
    /*console.log("------RESULTADO------------");
    console.log(levelList);
    console.log("---------------------------");*/
    //Pintar los niveles
    for(counter=0;counter<CONTROL_LIST.length;counter++){
        controlLevelNumber=counter;
        if(levelList[counter].features.length>0){
            setDataOnLayer(levelList[counter]);
            //console.log(levelList[counter])
        }
    }
}


//======================Sistema de control========================================================================


function setLevelController()
{
    if(controlLevelNumber==7){
        controlLevelNumber = 5;
    }
    else if(controlLevelNumber == 3){
        controlLevelNumber = 7;
    }
    else if(controlLevelNumber ==6){
        console.log("Ya termino de settear")
    }
    else{
        controlLevelNumber++;
    }
    
}

function updateUIControlLevel(pControlLevel){
    for (counter = 0; counter < CONTROL_LIST.length; counter++) {
        if (pControlLevel == counter) Template.instance().$('#'+CONTROL_LIST[counter][CONTROL_ID]).addClass('selectedLevelActive');
        else Template.instance().$('#'+CONTROL_LIST[counter][CONTROL_ID]).removeClass('selectedLevelActive');
    }
    //$('#cslplano').removeClass('selectedLevelActive');
}

function showButtonOnMapLayer(pElement){
    list = ['.mapbox-gl-draw_polygon', '.mapbox-gl-draw_line', '.mapbox-gl-draw_point'];
    for (counter = 0; counter < list.length; counter++) {
        if (pElement == counter) Template.instance().$(list[pElement]).css("display", 'block');
        else Template.instance().$(list[counter]).css("display", 'none');
    }
}

function setControlDraw(pControlDrawId){
    controlDrawingId = pControlDrawId;
    showButtonOnMapLayer(pControlDrawId);
}


//==============================Meteor========================================================================


Template.CSL.onCreated(function homeOnCreated() {
    this.flagControl = new ReactiveVar(false); 
});

Template.CSL.helpers({
    flagControl() {
        return Template.instance().flagControl.get();
    }
});

//Crear funcion de control generica que funcione para los eventos

Template.CSL.events({
    'click #cslmanproy'(event, instance) {
        event.preventDefault();
        instance.$('#modalCreate').css("display", "block");
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
        if(GlobalAppState.map.getSource(CONTROL_LIST[controlLevelNumber][CONTROL_ID])!=undefined)
        ids = GlobalAppState.draw.set(GlobalAppState.map.getSource(CONTROL_LIST[controlLevelNumber][CONTROL_ID])._data);
        updateUIControlLevel(controlLevelNumber);
    },
    'click #cslbloqueo'(event, instance) {
        event.preventDefault();
        controlLevelNumber = 1;
        setControlDraw(0);
        if(GlobalAppState.map.getSource(CONTROL_LIST[controlLevelNumber][CONTROL_ID])!=undefined)
        ids = GlobalAppState.draw.set(GlobalAppState.map.getSource(CONTROL_LIST[controlLevelNumber][CONTROL_ID])._data);
        updateUIControlLevel(controlLevelNumber);
    },
    'click #cslacomet'(event, instance) {
        event.preventDefault();
        controlLevelNumber = 2;
        setControlDraw(1);
        if(GlobalAppState.map.getSource(CONTROL_LIST[controlLevelNumber][CONTROL_ID])!=undefined)
        ids = GlobalAppState.draw.set(GlobalAppState.map.getSource(CONTROL_LIST[controlLevelNumber][CONTROL_ID])._data);
        updateUIControlLevel(controlLevelNumber);
    },
    'click #cslmaq'(event, instance) {
        event.preventDefault();
        controlLevelNumber = 3;
        setControlDraw(0);
        if(GlobalAppState.map.getSource(CONTROL_LIST[controlLevelNumber][CONTROL_ID])!=undefined)
        ids = GlobalAppState.draw.set(GlobalAppState.map.getSource(CONTROL_LIST[controlLevelNumber][CONTROL_ID])._data);
        updateUIControlLevel(controlLevelNumber);
    },
    'click #cslconstrucc'(event, instance) {
        event.preventDefault();
        controlLevelNumber = 7;
        setControlDraw(0);
        if(GlobalAppState.map.getSource(CONTROL_LIST[controlLevelNumber][CONTROL_ID])!=undefined)
        ids = GlobalAppState.draw.set(GlobalAppState.map.getSource(CONTROL_LIST[controlLevelNumber][CONTROL_ID])._data);
        updateUIControlLevel(controlLevelNumber);
    },
    'click #cslcivil'(event, instance) {
        event.preventDefault();
        controlLevelNumber = 5;
        setControlDraw(1);
        if(GlobalAppState.map.getSource(CONTROL_LIST[controlLevelNumber][CONTROL_ID])!=undefined)
        ids = GlobalAppState.draw.set(GlobalAppState.map.getSource(CONTROL_LIST[controlLevelNumber][CONTROL_ID])._data);
        updateUIControlLevel(controlLevelNumber);
    },
    'click #cslgruas'(event, instance) {
        event.preventDefault();
        controlLevelNumber = 6;
        controlInputRadius = 20; // esto tiene que ser una entrada.
        setControlDraw(2);
        if(GlobalAppState.map.getSource(CONTROL_LIST[controlLevelNumber][CONTROL_ID])!=undefined)
        ids = GlobalAppState.draw.set(GlobalAppState.map.getSource(CONTROL_LIST[controlLevelNumber][CONTROL_ID])._data);
        updateUIControlLevel(controlLevelNumber);
    },
    'click #csllibres'(event, instance) {
        event.preventDefault();
        //Aqui hay que establecer las diferencias entre los poligonos para que queden los sectores libres.
        controlLevelNumber = 4;
        setControlDraw(0);
        if(GlobalAppState.map.getSource(CONTROL_LIST[controlLevelNumber][CONTROL_ID])!=undefined)
        ids = GlobalAppState.draw.set(GlobalAppState.map.getSource(CONTROL_LIST[controlLevelNumber][CONTROL_ID])._data);
        updateUIControlLevel(controlLevelNumber);
    },
    //Boton arriba derecha
    'click #cslsavestruct'(event, instance) {
        event.preventDefault();
        /*console.log("Estructura Orig:");
        console.log(GlobalAppState.draw.getAll());
        console.log("=======================");*/
        setDataOnLayer(GlobalAppState.draw.getAll());//establece los datos en el layer
        console.log(controlLevelNumber)
        setLevelController();//establece nuevo nivel
        console.log(controlLevelNumber)
        updateUIControlLevel(controlLevelNumber);//Muestra en ui nivel actual
        /*
        GlobalAppState.project.project_instance.layers = parsingMapJSON().layers;
        Meteor.call("saveProject", GlobalAppState.project,
            (error, result) => {
                //console.log(result)
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
                    //notify("Project: " + result.state.message, 3000, 'rounded')
                }
                else{
                    //notify("Project: " + result.state.message, 3000, 'rounded')        
                }
            }
        )*/
    }
})

//Establecer funciones de inicializacion del sistema
Template.CSL.onRendered(
    function () {
        $('.button-collapse').sideNav('show')
        $('#cslplano').addClass('selectedLevelActive');
        //$('#cslplano').removeClass('selectedLevelActive');

        mapboxgl.accessToken = 'pk.eyJ1Ijoiam9zYWx2YXJhZG8iLCJhIjoiY2o2aTM1dmoyMGNuZDJ3cDgxZ2d4eHlqYSJ9.23TgdwGE-zm5-8XUFkz2rQ';
        GlobalAppState.map = new mapboxgl.Map({
            center: [-84.10563996507328, 9.979042286713366],
            zoom: 5,
            container: 'map',
            style: 'mapbox://styles/josalvarado/cj6nv3ue212172soj1nvlyaia',
            trackResize: true,
            hash: true
        });

        GlobalAppState.draw = new MapboxDraw({
            displayControlsDefault: false,
            controls: {
                line_string: true,
                point: true,
                polygon: true,
                trash: true
            }
        });
       

        GlobalAppState.map.addControl(GlobalAppState.draw);//add controls on mapbox, set the draw tool
        setControlDraw(0);//Set the button of the first level

        /*console.log("Sistema de geolocalizador 1")
        MapboxGeocoder.query('Montreal Quebec');
        
        console.log("Sistema de geolocalizador 2 ")
        MapboxGeocoder.on('results', function(e) {
            console.log('results: ', e.features);
        });
        
        geocoder.on('error', function(e) {
            console.log('Error is', e.error);
        });
        */

        GlobalAppState.map.on('load', function () {
        initAllLevels(); //initialize all the layers on the map.

            var layers = GlobalAppState.map.getStyle().layers.reverse();
            var labelLayerIdx = layers.findIndex(function (layer) {
                return layer.type !== 'symbol';
            });
            
            GlobalAppState.map.on('dblclick', 'cslplano', function (e) {
                polygon = turf.polygon(e.features[0].geometry.coordinates);
                center = turf.centerOfMass(polygon);
                var area = turf.area(polygon);
                //console.log("CENTER:"+center.geometry.coordinates);
                notify("Area: "+area+" m2", 3000, 'rounded')
                /*new mapboxgl.Popup()
                    .setLngLat(center.geometry.coordinates)
                    .setHTML("<h4>Here is a ne element</h4>")
                    .addTo(map);*/
            });
            /*      map.on('mouseenter', 'cslplano', function () {
                    map.getCanvas().style.cursor = 'pointer';
                });
            
                // Change it back to a pointer when it leaves.
                map.on('mouseleave', 'cslplano', function () {
                    map.getCanvas().style.cursor = '';
                });
            */
            var labelLayerId = labelLayerIdx !== -1 ? layers[labelLayerIdx].id : undefined;
            GlobalAppState.map.addLayer({
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