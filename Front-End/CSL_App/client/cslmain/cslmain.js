import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

import * as mapboxgl from 'mapbox-gl';
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

let CONTROL_TYPE = 0;
let CONTROL_ID = 1;
let CONTROL_MESSAGE = 2;
let CONTROL_COLOR = 3;
let CONTROL_LAST_ID = 4;

let CONTROL_FILLTYPE = 0;
let CONTROL_LINETYPE = 1;
let CONTROL_CIRCLETYPE = 2;

let CSLG='cslg'

let opacity = 0.6;

let shiftControl=false;
let cleanMode=false;

//agregar al arreglo
let CONTROL_LIST = [
/*0  F */[CONTROL_FILLTYPE, 'cslplano', 'Establecer las area del plano', '#FFFFFF', ''],
/*1  F */[CONTROL_FILLTYPE, 'cslbloqueo', 'Establecer las areas bloqueadas', '#F08080', ''],
/*2  F */[CONTROL_LINETYPE, 'cslacomet', 'Establecer las acometidas', '#FFA500', ''],
/*3  F */[CONTROL_FILLTYPE, 'cslmaq', 'Establecer los caminos de maquinaria', '#8B4513', ''],
/*4  F */[CONTROL_FILLTYPE, 'cslconstrucc', 'Establecer la huella de la construcción', '#ffcc00', ''],
/*5  F */[CONTROL_FILLTYPE, 'csltemp', 'Establecer la construccion temporal', '#42a5f5', ''],
/*6  L */[CONTROL_LINETYPE, 'cslcivil', 'Establecer los caminos de civiles', '#333', ''],
/*7  C */[CONTROL_FILLTYPE, 'cslgruas', 'Establecer las gruas', '#1E90FF', ''],
/*8  F */[CONTROL_FILLTYPE, 'csllibres', 'Establecer las areas libres', '#90EE90', '']
]

//=================================================Estructura de geojason=========================================================

function initLayer(pControlLevel){
    var pId=CONTROL_LIST[pControlLevel][CONTROL_ID]
    var newLayer={
        'id': pId,
        'source': {
            'type': 'geojson',
            'data': turf.featureCollection([])
        }
    }
    if (CONTROL_LIST[pControlLevel][CONTROL_TYPE] == CONTROL_FILLTYPE) {
        newLayer.type = 'fill'
        newLayer.paint =
        {
            'fill-color': CONTROL_LIST[pControlLevel][CONTROL_COLOR],
            'fill-opacity': opacity
        }
    }
    else if (CONTROL_LIST[pControlLevel][CONTROL_TYPE] == CONTROL_LINETYPE) {
        newLayer.type = 'line'
        newLayer.paint =
        {
            "line-color": CONTROL_LIST[pControlLevel][CONTROL_COLOR],
            "line-width": 2
        };
        newLayer.layout =
        {
            "line-join": "round",
            "line-cap": "round"
        };
    }
    return newLayer;
}


function drawCircle(parID,pData,pRadius,pColor,pOpacity){
    var center = pData;
    var radius = pRadius;
    var circle = turf.circle(center, radius, 10,'kilometers',{});
    var fCollection = turf.featureCollection([circle]);
    var gJson={
        'id': parID,
        'type':'fill',
        'source': {
            'type': 'geojson',
            'data': fCollection
        },
        'paint': {
            'fill-color': pColor,
            'fill-opacity': pOpacity
        }
    }
    return gJson
}


function initAllLevels(){
    initCrane()
    for(counter=0;counter<CONTROL_LIST.length;counter++){
        controlLevelNumber=counter
        setDataOnLayer({
            type:"FeatureCollection",
            features: []
        });
    }
    controlLevelNumber=0
}

function initCrane(){
    RadiusOnMeters=0.0001/1000 
    deleteCrane()
    var circ=drawCircle(CSLG,[0,0],RadiusOnMeters,'#000000',0.5)
    GlobalAppState.map.addLayer(circ);
    
}

//======================TURF: Validaciones de Colisiones de los Stages========================================================================

function isContainedOnSite(pData,pControlLevelNumber,pLevelNumber){
    var site=turf.polygon(GlobalAppState.map.getSource(CONTROL_LIST[pLevelNumber][CONTROL_ID])._data.features[0].geometry.coordinates);
    for(counter=0;counter<pData.features.length;counter++){
        var inputElement= turf.polygon(pData.features[counter].geometry.coordinates);
        var difference = turf.difference(inputElement, site);
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
    var difference = turf.difference(pFirst, pSecond);
    if(!featureEqualFeature(pFirst,difference)){//Tienen interseccion dif vacio: false / Tienen interseccion igual vacio: true
        return true;
    }
    return false;
}

function existCollision(pData,pControlLevelNumber){
    var retorno=false;
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
            if(
                controlLevelNumber!=counterLayer &&
                CONTROL_FILLTYPE==CONTROL_LIST[counterLayer][CONTROL_TYPE] &&
                GlobalAppState.map.getSource(CONTROL_LIST[counterLayer][CONTROL_ID])!=undefined &&
                counterLayer!=4
                
            ){
                for(counterStage=0;counterStage<GlobalAppState.map.getSource(CONTROL_LIST[counterLayer][CONTROL_ID])._data.features.length;counterStage++){
                    var auxiliar=turf.polygon(GlobalAppState.map.getSource(CONTROL_LIST[counterLayer][CONTROL_ID])._data.features[counterStage].geometry.coordinates)
                    if(colissionOn2Poly(inputElement,auxiliar)){
                        retorno=(retorno || true)
                    }
                }
            }
        }
    }
    return retorno;
}

//por ahora no se esta usando esta funcion.
function typeLineOnSite(pData,pControlLevelSitePosition){
    var site=turf.polygon(GlobalAppState.map.getSource(CONTROL_LIST[pControlLevelSitePosition][CONTROL_ID])._data.features[0].geometry.coordinates);    
    result=true;
    for(counterStage=0; counterStage< pData.features.length; counterStage++){
        for(counter=0; counter < pData.features[counterStage].geometry.coordinates.length; counter++){
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
    else if (pControlLevelNumber<=CONTROL_LIST.length && pControlLevelNumber>0){
        if(pData.features.length>0){//Haya al menos una figura de entrada.
            if(CONTROL_FILLTYPE==CONTROL_LIST[pControlLevelNumber][CONTROL_TYPE]){
                //no existe niguna collision y se encuentra contenido en el nivel del sitio(nivel 0).
                if(isContainedOnSite(pData,pControlLevelNumber,0)){
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
                if(typeLineOnSite(pData,0)){
                    return true;
                }
                else{
                    notify("Elemento debe estar contenido en el area del sitio", 3000, 'rounded')
                }
            }
        }
        else{return true}   
    }
    else {
        //el area 8 es igual al nivel [0] menos la interseccion de los niveles [1,6]
        //hace un llamado al mapa para pintar el area libre del mapa.
    }
    return false;
}

function setFreeArea(){
    var result=turf.polygon(GlobalAppState.map.getSource(CONTROL_LIST[0][CONTROL_ID])._data.features[0].geometry.coordinates);    
    var currentArea=null;
    for(counterLayer=1;counterLayer<CONTROL_LIST.length;counterLayer++){
        if(
            CONTROL_FILLTYPE==CONTROL_LIST[counterLayer][CONTROL_TYPE] &&
            GlobalAppState.map.getSource(CONTROL_LIST[counterLayer][CONTROL_ID])!=undefined
        ){
            for(counterStage=0;counterStage<GlobalAppState.map.getSource(CONTROL_LIST[counterLayer][CONTROL_ID])._data.features.length;counterStage++){
                currentArea=turf.polygon(GlobalAppState.map.getSource(CONTROL_LIST[counterLayer][CONTROL_ID])._data.features[counterStage].geometry.coordinates)
                result=turf.difference(result,currentArea);
            }
        }
    }
    return result;
}

//======================Sistema de Control para elementos en MapBox========================================================================
function layerExists(pControlNumb){
    if(GlobalAppState.map.getLayer(CONTROL_LIST[pControlNumb][CONTROL_ID]) != undefined)
        return true;
    return false;
}

function sourceExists(pControlNumb){
    if(GlobalAppState.map.getSource(CONTROL_LIST[pControlNumb][CONTROL_ID]) != undefined)
        return true;
    return false;
}

function deleteLayer(pControlNumb){
    GlobalAppState.map.removeLayer(CONTROL_LIST[controlLevelNumber][CONTROL_ID]);
}

function deleteSource(pControlNumb){
    GlobalAppState.map.removeSource(CONTROL_LIST[controlLevelNumber][CONTROL_ID]);
}

function initLayers(){
    for(counter=0;counter<CONTROL_LIST.length;counter++){
        createLayer(counter)
    }
}

function createLayer(pControlNumb){
    newLayer = initLayer(pControlNumb);
    GlobalAppState.map.addLayer(newLayer);
}

function setSourceOnLayer(pControlLevelNumber,pData){
    //Delete G if is it showed
    if(layerExists(pControlLevelNumber)){
        deleteLayer(pControlLevelNumber)
    }
    if(sourceExists(pControlLevelNumber)){
        deleteSource(pControlLevelNumber)
    }
    var newLayer = initLayer(pControlLevelNumber);
    newLayer.source.data=pData
    GlobalAppState.map.addLayer(newLayer)
}

function setDataOnLayer(pData){
    if (isValidatedLevel(pData,controlLevelNumber) || cleanMode){
        setSourceOnLayer(controlLevelNumber,pData);
        cleanMode=false;
        return true;
    }
    return false;
}   

function findIdOnList(pList, pId){
    if(pList)
        for(counter = 0 ; counter< pList.length ; counter++)
        {
            if(pId === pList[counter].name)
            { 
                return counter;
            }
        }
    return undefined;
}

function deleteCrane(){
    if (GlobalAppState.map.getLayer(CSLG)) 
        GlobalAppState.map.removeLayer(CSLG)
    if (GlobalAppState.map.getSource(CSLG)) 
        GlobalAppState.map.removeSource(CSLG)
}

function setControlOnLayer(pControlNumb){
    if(pControlNumb != 0){
        if(pControlNumb==7){
            GlobalAppState.map.on('dblclick', CONTROL_LIST[pControlNumb][CONTROL_ID], function (e) {
                lat=e.lngLat.lat;
                lng=e.lngLat.lng;
                layerId= e.features[0].layer.id;
                cStage=getStageFromMap(lat,lng,layerId);
                idStage=cStage.id;
                stagecoordinates = cStage.geometry.coordinates
                let controlLevelLayer = getControlLevelById(layerId)
                var list = GlobalAppState.varMapping.get(`${idStage}:${controlLevelLayer}`)
                position = findIdOnList(list,'mts')
                polygonStage= turf.polygon(stagecoordinates)
                centroidP= turf.centroid(polygonStage)
                if(position!=undefined && centroidP!=undefined)
                {
                    if(position>=0){
                        RadiusOnMeters=parseFloat(list[position].content)/1000
                        if(RadiusOnMeters)
                            if(RadiusOnMeters>0){
                                deleteCrane()
                                var circ=drawCircle(CSLG,[centroidP.geometry.coordinates[0],centroidP.geometry.coordinates[1]],RadiusOnMeters,'#000000',0.5)
                                GlobalAppState.map.addLayer(circ);
                            }
                    }
                }
                else{
                    RadiusOnMeters=0.0001/1000 
                    deleteCrane()
                    var circ=drawCircle(CSLG,[centroidP.geometry.coordinates[0],centroidP.geometry.coordinates[1]],RadiusOnMeters,'#000000',0.5)
                    GlobalAppState.map.addLayer(circ);
                }
            });
        }
        GlobalAppState.map.on('click', CONTROL_LIST[pControlNumb][CONTROL_ID], function (e) {
            lat=e.lngLat.lat;
            lng=e.lngLat.lng;
            layerId= e.features[0].layer.id;
            idStage=getStageFromMap(lat,lng,layerId).id;
            if(shiftControl){
                let controlLevelLayer = getControlLevelById(layerId)
                GlobalAppState.templateContext.get('var_management').materials.set(GlobalAppState.materials)
                let templateContext = GlobalAppState.templateContext.get('CSL')
                templateContext.$('#modalMaterials').css("display", "none")
                templateContext.$('#modalProjects').css("display", "none")
                templateContext.$('#modalVariables').css("display", "block")
                let varControlContext = GlobalAppState.templateContext.get('var_management')
                if (controlLevelLayer === 8)
                    varControlContext.materialAssignable.set(true)
                varControlContext.selectedStage.set({
                    layer: controlLevelLayer,
                    stage: idStage
                })
                let varControl = GlobalAppState.varMapping.get(`${idStage}:${controlLevelLayer}`)
                varControl = varControl ? varControl : []
                varControlContext.varSpace.set(varControl)
            }
        });
    }
}

function getStageFromMap(pLat,pLng,pLayerId){
    try{
        mapSource=GlobalAppState.map.getSource(pLayerId); 
        stageList=mapSource._data.features;
        point = turf.point([pLng, pLat]);        
        for(counter=0;counter<stageList.length;counter++){
            geo = stageList[counter].geometry;
            id = stageList[counter].id;
            poly=turf.polygon(geo.coordinates);
            if(turf.inside(point,poly)){
                return stageList[counter];
            }
        }
    }
    catch(e){
        console.log("source do no exist:");
        console.log(e)
    }
    return undefined;
}

function setLevelController(){
    if(controlLevelNumber<CONTROL_LIST.length)
        controlLevelNumber++;
}

function getControlLevelById(pId){
    result=-1
    for(counter=0;counter<CONTROL_LIST.length;counter++){
        if(CONTROL_LIST[counter][CONTROL_ID]==pId) return counter;
    }
    return result;
}


//======================Save - Load Project========================================================================
export function parsingMapJSON(pControl) {
    jsonInfo={};
    jsonInfo.layers = GlobalAppState.project.project_instance.layers ? GlobalAppState.project.project_instance.layers : []
    layer = {}
    layer.level=pControl
    currSource= GlobalAppState.map.getSource(CONTROL_LIST[layer.level][CONTROL_ID]);
    if(currSource!=undefined)
    {
        layer.stages=[]
        for(counter2=0 ; counter2 < currSource._data.features.length ; counter2++){//viaja atraves de los stages en source
            currResult={}
            currResult.vectors_sequence=[]
            currResult.id=currSource._data.features[counter2].id
            let varSpace = GlobalAppState.varMapping.get(`${currResult.id}:${pControl}`)
            currResult.variables = varSpace ? varSpace : []
            if(CONTROL_LIST[layer.level][CONTROL_TYPE]==CONTROL_FILLTYPE){
                for(counter3=0; counter3<currSource._data.features[counter2].geometry.coordinates[0].length;counter3++)
                {   
                    currResult.vectors_sequence.push({
                        x: currSource._data.features[counter2].geometry.coordinates[0][counter3][0],
                        y: currSource._data.features[counter2].geometry.coordinates[0][counter3][1]
                    })
                }
            }
            else if(CONTROL_LIST[layer.level][CONTROL_TYPE]==CONTROL_LINETYPE){
                for(counter3=0; counter3<currSource._data.features[counter2].geometry.coordinates.length;counter3++)
                {   
                    currResult.vectors_sequence.push({
                        x: currSource._data.features[counter2].geometry.coordinates[counter3][0],
                        y: currSource._data.features[counter2].geometry.coordinates[counter3][1]
                    })
                }
            }
            layer.stages.push(currResult)
        }
        let indexInEdition = jsonInfo.layers.findIndex((savedlayer)=>{
            return savedlayer.level === layer.level
        })
        if (jsonInfo.layers[indexInEdition])
            jsonInfo.layers[indexInEdition] = layer
        else
            jsonInfo.layers.push(layer)
    }
    return jsonInfo;
}

export function cleanProject(){
    GlobalAppState.draw.deleteAll();//delete trash from draw tool
    cleanMode=true
    initAllLevels()
    cleanMode=false
}

export function loadProject(pProject){
    levelList=new Array();
    for(counter=0;counter<CONTROL_LIST.length;counter++){
        levelList.push({
            type:"FeatureCollection",
            features:[]
        });
    }
    let currLevel=0;
    for(var counter=0;counter<pProject.project_instance.layers.length;counter++){
        for(var counter2=0;counter2<pProject.project_instance.layers[counter].stages.length;counter2++){
            var feature=new Object();
            feature.properties=new Object();
            feature.type="Feature";
            var geometry=new Object();
            var Clevel=pProject.project_instance.layers[counter].level
            geometry.coordinates=new Array();
            if(CONTROL_LIST[Clevel][CONTROL_TYPE]==CONTROL_FILLTYPE){
                geometry.type="Polygon";
                geometry.coordinates.push([]);
                for(var counter3=0;counter3<pProject.project_instance.layers[counter].stages[counter2].vectors_sequence.length;counter3++){
                    x=pProject.project_instance.layers[counter].stages[counter2].vectors_sequence[counter3].x;
                    y=pProject.project_instance.layers[counter].stages[counter2].vectors_sequence[counter3].y;
                    geometry.coordinates[0].push([x,y]);
                }
            }
            else if(CONTROL_LIST[Clevel][CONTROL_TYPE]==CONTROL_LINETYPE){
                geometry.type="LineString";
                for(var counter3=0;counter3<pProject.project_instance.layers[counter].stages[counter2].vectors_sequence.length;counter3++){
                    x=pProject.project_instance.layers[counter].stages[counter2].vectors_sequence[counter3].x;
                    y=pProject.project_instance.layers[counter].stages[counter2].vectors_sequence[counter3].y;
                    geometry.coordinates.push([x,y]);
                }
            }
            feature.id=pProject.project_instance.layers[counter].stages[counter2].id;
            feature.geometry=geometry;

            let key = `${feature.id}:${pProject.project_instance.layers[counter].level}`
            GlobalAppState.varMapping.set(key, pProject.project_instance.layers[counter].stages[counter2].variables)
            levelList[pProject.project_instance.layers[counter].level].features.push(feature);
        }
    }
    //Pintar los niveles
    for(counter=0;counter<CONTROL_LIST.length;counter++){
        controlLevelNumber=counter;
        if(levelList[counter].features.length>0){
            setDataOnLayer(levelList[counter]);
        }
    }
    controlLevelNumber=currLevel;
    updateUIControlLevel(controlLevelNumber);
    setControlDraw(controlLevelNumber);
}

//======================Sistema de control - UI========================================================================

function updateUIControlLevel(pControlLevel){
    
    for (counter = 0; counter < CONTROL_LIST.length; counter++) {
        if (pControlLevel == counter) GlobalAppState.templateContext.get('CSL').$('#'+CONTROL_LIST[counter][CONTROL_ID]).addClass('selectedLevelActive');
        else GlobalAppState.templateContext.get('CSL').$('#'+CONTROL_LIST[counter][CONTROL_ID]).removeClass('selectedLevelActive');
    }
}

function showButtonOnMapLayer(pElement){
    list = ['.mapbox-gl-draw_polygon', '.mapbox-gl-draw_line', '.mapbox-gl-draw_point'];
    for (counter = 0; counter < list.length; counter++) {
        if (pElement == counter) GlobalAppState.templateContext.get('CSL').$(list[pElement]).css("display", 'block');
        else GlobalAppState.templateContext.get('CSL').$(list[counter]).css("display", 'none');
    }
}

function setControlDraw(pControlLevel){
    if(pControlLevel==CONTROL_LIST.length){
        control=CONTROL_LIST[CONTROL_LIST.length-1][CONTROL_TYPE];
        showButtonOnMapLayer(control);
        return;
    }
    control=CONTROL_LIST[pControlLevel][CONTROL_TYPE];
    showButtonOnMapLayer(control);
}

function initQueryElements(){
    let templateContext = GlobalAppState.templateContext.get('CSL')    
    templateContext.$('.button-collapse').sideNav('show')
    templateContext.$('#cslplano').addClass('selectedLevelActive');

    templateContext.$("#map").keydown(function (e) {
        shiftControl=true;
    });
    templateContext.$("#map").keyup(function (e) {
        shiftControl=false;
    });
}

//==============================Meteor========================================================================

Template.CSL.onCreated(function homeOnCreated() {
    this.flagControl = new ReactiveVar(false)
    this.selectedProject = new ReactiveVar(false)
    GlobalAppState.templateContext.set("CSL", this)
});

Template.CSL.helpers({
    flagControl() {
        return Template.instance().flagControl.get()
    },
    selectedProject(){
        return Template.instance().selectedProject.get()
    }
});

//Crear funcion de control generica que funcione para los eventos
Template.CSL.events({
    'click #cslmanproy'(event, instance) {
        event.preventDefault();
        GlobalAppState.templateContext.get('projects_management').namespace.set(GlobalAppState.namespacing)
        instance.$('#modalMaterials').css("display", "none")
        instance.$('#modalProjects').css("display", "block")
        instance.$('#modalVariables').css("display", "none")
    },
    'click #cslmanmat'(event, instance) {
        event.preventDefault();
        GlobalAppState.templateContext.get('materials_management').matspace.set(GlobalAppState.materials)
        instance.$('#modalProjects').css("display", "none")
        instance.$('#modalMaterials').css("display", "block")
        instance.$('#modalVariables').css("display", "none")
    },
    'click #closecsl'(event, instance) {
        event.preventDefault();
        GlobalAppState.isProjectSelected = false;
        instance.flagControl.set(false)
        Router.go('/login');
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
    },
    //Boton izquierda
    'click #cslplano'(event, instance) {
        event.preventDefault();
        controlLevelNumber = 0;
        setControlDraw(controlLevelNumber);
        if(GlobalAppState.map.getSource(CONTROL_LIST[controlLevelNumber][CONTROL_ID])!=undefined)
        ids = GlobalAppState.draw.set(GlobalAppState.map.getSource(CONTROL_LIST[controlLevelNumber][CONTROL_ID])._data);
        updateUIControlLevel(controlLevelNumber);
    },
    'click #cslbloqueo'(event, instance) {
        event.preventDefault();
        controlLevelNumber = 1;
        setControlDraw(controlLevelNumber);
        if(GlobalAppState.map.getSource(CONTROL_LIST[controlLevelNumber][CONTROL_ID])!=undefined)
        ids = GlobalAppState.draw.set(GlobalAppState.map.getSource(CONTROL_LIST[controlLevelNumber][CONTROL_ID])._data);
        updateUIControlLevel(controlLevelNumber);
    },
    'click #cslacomet'(event, instance) {
        event.preventDefault();
        controlLevelNumber = 2;
        setControlDraw(controlLevelNumber);
        if(GlobalAppState.map.getSource(CONTROL_LIST[controlLevelNumber][CONTROL_ID])!=undefined)
        ids = GlobalAppState.draw.set(GlobalAppState.map.getSource(CONTROL_LIST[controlLevelNumber][CONTROL_ID])._data);
        updateUIControlLevel(controlLevelNumber);
    },
    'click #cslmaq'(event, instance) {
        event.preventDefault();
        controlLevelNumber = 3;
        setControlDraw(controlLevelNumber);
        if(GlobalAppState.map.getSource(CONTROL_LIST[controlLevelNumber][CONTROL_ID])!=undefined)
        ids = GlobalAppState.draw.set(GlobalAppState.map.getSource(CONTROL_LIST[controlLevelNumber][CONTROL_ID])._data);
        updateUIControlLevel(controlLevelNumber);
    },
    'click #cslconstrucc'(event, instance) {
        event.preventDefault();
        controlLevelNumber = 4;
        setControlDraw(controlLevelNumber);
        if(GlobalAppState.map.getSource(CONTROL_LIST[controlLevelNumber][CONTROL_ID])!=undefined)
        ids = GlobalAppState.draw.set(GlobalAppState.map.getSource(CONTROL_LIST[controlLevelNumber][CONTROL_ID])._data);
        updateUIControlLevel(controlLevelNumber);
    },
    'click #csltemp'(event, instance) {
        event.preventDefault();
        controlLevelNumber = 5;
        setControlDraw(controlLevelNumber);
        if(GlobalAppState.map.getSource(CONTROL_LIST[controlLevelNumber][CONTROL_ID])!=undefined)
        ids = GlobalAppState.draw.set(GlobalAppState.map.getSource(CONTROL_LIST[controlLevelNumber][CONTROL_ID])._data);
        updateUIControlLevel(controlLevelNumber);
    },
    'click #cslcivil'(event, instance) {
        event.preventDefault();
        controlLevelNumber = 6;
        setControlDraw(controlLevelNumber);
        if(GlobalAppState.map.getSource(CONTROL_LIST[controlLevelNumber][CONTROL_ID])!=undefined)
        ids = GlobalAppState.draw.set(GlobalAppState.map.getSource(CONTROL_LIST[controlLevelNumber][CONTROL_ID])._data);
        updateUIControlLevel(controlLevelNumber);
    },
    'click #cslgruas'(event, instance) {
        event.preventDefault();
        controlLevelNumber = 7;
        setControlDraw(controlLevelNumber);
        if(GlobalAppState.map.getSource(CONTROL_LIST[controlLevelNumber][CONTROL_ID])!=undefined)
        ids = GlobalAppState.draw.set(GlobalAppState.map.getSource(CONTROL_LIST[controlLevelNumber][CONTROL_ID])._data);
        updateUIControlLevel(controlLevelNumber);
    },
    'click #csllibres'(event, instance) {
        event.preventDefault();
        //Aqui hay que establecer las diferencias entre los poligonos para que queden los sectores libres.
        controlLevelNumber = 8;
        setControlDraw(controlLevelNumber);
        if(GlobalAppState.map.getSource(CONTROL_LIST[controlLevelNumber][CONTROL_ID])!=undefined)
        ids = GlobalAppState.draw.set(GlobalAppState.map.getSource(CONTROL_LIST[controlLevelNumber][CONTROL_ID])._data);
        updateUIControlLevel(controlLevelNumber);
    },
    //Boton arriba derecha
    'click #cslsavestruct'(event, instance) {
        event.preventDefault();
        if(CONTROL_LIST.length>controlLevelNumber){
            isDataSet=setDataOnLayer(GlobalAppState.draw.getAll());//establece los datos en el layer
            if(isDataSet){
                GlobalAppState.project.project_instance.layers = parsingMapJSON(controlLevelNumber).layers;
                Meteor.call("saveProject", GlobalAppState.project,
                    (error, result) => {
                        if(result.code > 0){
                            Meteor.call("getProject", {key:GlobalAppState.project.key},
                                (error, result) => {
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
                )
                setControlDraw(controlLevelNumber);
                updateUIControlLevel(controlLevelNumber);//Muestra en ui nivel actual
                GlobalAppState.draw.deleteAll();
            }
        }
    }
})

//Establecer funciones de inicializacion del sistema
Template.CSL.onRendered(
    function () {
        //Llave proveída a los usuarios de la herramienta de mapbox.
        mapboxgl.accessToken = 'pk.eyJ1Ijoiam9zYWx2YXJhZG8iLCJhIjoiY2o2aTM1dmoyMGNuZDJ3cDgxZ2d4eHlqYSJ9.23TgdwGE-zm5-8XUFkz2rQ';
        GlobalAppState.map = new mapboxgl.Map({
            center: [-84.10563996507328, 9.979042286713366],
            zoom: 5,
            container: 'map',
            style: 'mapbox://styles/josalvarado/cj6nv3ue212172soj1nvlyaia',
            trackResize: true,
            hash: true
        });
        
        GlobalAppState.map.on('load', function () {
            initLayers()
            GlobalAppState.draw = new MapboxDraw({
                displayControlsDefault: false,
                controls: {
                    line_string: true,
                    point: true,
                    polygon: true,
                    trash: true
                }
            })

            GlobalAppState.map.addControl(GlobalAppState.draw)//add controls on mapbox, set the draw tool
            setControlDraw(controlLevelNumber)//Set the button of the first level

            initAllLevels(); //initialize all the layers on the map.

            var layers = GlobalAppState.map.getStyle().layers.reverse()
            var labelLayerIdx = layers.findIndex(function (layer) {
                return layer.type !== 'symbol';
            });
            
            var labelLayerId = labelLayerIdx !== -1 ? layers[labelLayerIdx].id : undefined
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
        GlobalAppState.materials = {
            project_id: "",
            materials: [],
            active_materials:[]
        }
        GlobalAppState.projectSelectedEvent = Template.instance().flagControl
        if (GlobalAppState.username)
            GlobalAppState.getRequest("getNamespace",  {username:GlobalAppState.username}, 
            "Getting namespace",
            (result) =>
            {
                if (result){
                    GlobalAppState.namespacing=result
                }
            })


        initQueryElements()
        let i = 0
        for (var index = 0; index < CONTROL_LIST.length; index++) {
            if (index !== 2 && index !== 6)
                setControlOnLayer(index)
        }
    }
);