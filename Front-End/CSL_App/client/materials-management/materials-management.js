import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { notify } from '../toast/toast';

import * as mapboxgl from 'mapbox-gl';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import turf from '@turf/turf';

import { GlobalAppState } from '../global-state';
import {loadProject} from '../cslmain/cslmain';

Template.materials_management.onCreated(function homeOnCreated() {
    this.matName = new ReactiveVar('')
    this.matPriority = new ReactiveVar('')
    this.matType = new ReactiveVar('')
    this.matTraffic = new ReactiveVar('')
    this.matspace = new ReactiveVar(GlobalAppState.materials)
    this.selectedMaterial = new ReactiveVar({})
    this.addComponentVisible = new ReactiveVar(false)
    this.editComponentVisible = new ReactiveVar(false)
    this.asignable = new ReactiveVar(false)
    GlobalAppState.templateContext.set("materials_management", this) 
})

Template.materials_management.helpers({
    matName() {
        return Template.instance().matName.get()
    },
    matPriority() {
        return Template.instance().matPriority.get()
    },
    matType() {
        return Template.instance().matType.get()
    },
    matTraffic() {
        return Template.instance().matTraffic.get()
    },
    matspace(){
        return Template.instance().matspace.get()
    },
    addComponentVisible(){
        return Template.instance().addComponentVisible.get()
    },
    editComponentVisible(){
        return Template.instance().editComponentVisible.get()
    }
})

Template.materials_management.events({
    'click #saveModalMaterials'(event, instance) {
        event.preventDefault()
        let materialId = instance.matName.get().toLowerCase().replace(new RegExp('[^A-Za-z0-9]', 'g'), "_")
        let material = {
            name: instance.matName.get(),
            id: `${GlobalAppState.project.key}:${materialId}`,
            priority: parseInt(instance.matPriority.get()),
            material_type: instance.matType.get(),
            worker_traffic: parseInt(instance.matTraffic.get()),
        }
        GlobalAppState.materials.materials.push(material)
        console.log(GlobalAppState.materials)
        GlobalAppState.updateFeature("saveMaterials", GlobalAppState.materials, "getMaterials", 
        {key:GlobalAppState.project.key}, "Creating material supplies space",
        (result) =>
        {
            GlobalAppState.materials=result
            instance.matspace.set(result)
            instance.addComponentVisible.set(false)
        })
    },
    'click #editModalMaterials':function(event, instance){
        event.preventDefault()
        let toUpdateIndex = instance.selectedMaterial.get().selectedIndex
        GlobalAppState.materials.materials[toUpdateIndex].name = instance.matName.get()
        GlobalAppState.materials.materials[toUpdateIndex].priority = parseInt(instance.matPriority.get())
        GlobalAppState.materials.materials[toUpdateIndex].material_type = instance.matType.get()
        GlobalAppState.materials.materials[toUpdateIndex].worker_traffic = parseInt(instance.matTraffic.get())
        console.log(GlobalAppState.materials)
        GlobalAppState.updateFeature("saveMaterials", GlobalAppState.materials, "getMaterials", 
        {key:GlobalAppState.project.key}, "Creating material supplies space",
        (result) =>
        {
            GlobalAppState.materials=result
            instance.matspace.set(result)
            instance.editComponentVisible.set(false)
        })
    },
    'click #closeModalMat':function(event, instance) {
        event.preventDefault()
        instance.$('#modalMaterials').css("display", "none")
        instance.addComponentVisible.set(false)
        instance.editComponentVisible.set(false)
    },

    'change #matNameField': function (event, instance) {
        instance.matName.set(event.target.value)
    },
    'change #matPriorityField': function (event, instance) {
        instance.matPriority.set(event.target.value)
    },
    'change #matTypeField': function (event, instance) {
        instance.matType.set(event.target.value)
    },
    'change #matTrafficField': function (event, instance) {
        instance.matTraffic.set(event.target.value)
    },

    'click .edit':function(event,instance){
        let toEditMaterial = instance.selectedMaterial.get()
        console.log(toEditMaterial)
        instance.matName.set(toEditMaterial.name)
        instance.matPriority.set(toEditMaterial.priority)
        instance.matType.set(toEditMaterial.material_type)
        instance.matTraffic.set(toEditMaterial.worker_traffic)

        instance.addComponentVisible.set(false)
        if(instance.editComponentVisible.get() === false)
            instance.editComponentVisible.set(true)

        
        instance.$(document).ready(function() {
            Materialize.updateTextFields();
        });
    },

    'click .remove':function(event,instance){
        let toRemoveIndex = instance.selectedMaterial.get().selectedIndex
        var head = instance.matspace.get().materials.slice(0, toRemoveIndex)
        var tail = instance.matspace.get().materials.slice(toRemoveIndex+1, instance.matspace.get().materials.legth)
        var newMaterialsState = head.concat(tail)
        GlobalAppState.materials.materials = newMaterialsState
        console.log(GlobalAppState.materials)
        GlobalAppState.updateFeature("saveMaterials", GlobalAppState.materials, "getMaterials", 
        {key:GlobalAppState.project.key}, "Creating material supplies space",
        (result) =>
        {
            GlobalAppState.materials=result
            instance.matspace.set(result)
            instance.editComponentVisible.set(false)
            instance.addComponentVisible.set(false)
        })
    },

    'click .collapsible':function(event,instance){
        if (event.target.dataset.value !== undefined){
            let selectedItem = GlobalAppState.materials.materials[event.target.dataset.value]
            selectedItem.selectedIndex = event.target.dataset.value
            instance.selectedMaterial.set(selectedItem);
            console.log(instance.selectedMaterial.get())
        }
    },

    'click #showAddNewMaterial':function(event, instance){
        instance.editComponentVisible.set(false)
        if(instance.addComponentVisible.get() === false)
            instance.addComponentVisible.set(true)
    }
})

Template.materials_management.onRendered(function(){
    Template.instance().$('.collapsible').collapsible()
})