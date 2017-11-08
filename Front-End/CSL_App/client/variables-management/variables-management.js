import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { notify } from '../toast/toast';
import 'materialize-css';

import * as mapboxgl from 'mapbox-gl';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import turf from '@turf/turf';

import { GlobalAppState } from '../global-state';
import {loadProject} from '../cslmain/cslmain';

Template.var_management.onCreated(function homeOnCreated() {
    this.varName = new ReactiveVar('')
    this.varContent = new ReactiveVar('')
    this.varType = new ReactiveVar(false)
    this.varSpace = new ReactiveVar([])
    this.selectedItem = new ReactiveVar(-1)
    this.addComponentVisible = new ReactiveVar(false)
    this.IsStageSelected = new ReactiveVar(true)
    this.materialAssignable = new ReactiveVar(true)
    this.materials = new ReactiveVar([])
    this.selectedMaterial = new ReactiveVar(-1)
    GlobalAppState.templateContext.set("var_management", this) 
})

Template.var_management.helpers({
    varName() {
        return Template.instance().varName.get()
    },
    varContent() {
        return Template.instance().varContent.get()
    },
    varSpace(){
        return Template.instance().varSpace.get()
    },
    addComponentVisible(){
        return Template.instance().addComponentVisible.get()
    },
    IsStageSelected(){
        return Template.instance().IsStageSelected.get()
    },
    materials(){
        return Template.instance().materials.get()
    },
    materialAssignable(){
        return Template.instance().materialAssignable.get()
    },
    varType(){
        return Template.instance().varType.get()
    }
})


Template.var_management.events({
    'click #saveModalVar'(event, instance) {
        event.preventDefault()
        let variables = instance.varSpace.get()
        if (!variables)
            variables = []
        let variable = {}
        variable.name = instance.varName.get()
        variable.type = instance.varType.get()
        if (instance.varType.get()){
            let myMaterials = instance.materials.get().materials
            console.log(myMaterials)
            variable.content = myMaterials[instance.selectedMaterial.get()].id
        }
        else
            variable.content = instance.varContent.get()
        variables.push(variable)
        console.log(variables)
        instance.varSpace.set(variables)
        instance.addComponentVisible.set(false)
        instance.varName.set('')
        instance.varContent.set('')
        instance.$('#stateTypeCheck').removeAttr('Checked','Checked')
    },
    'click #closeModalVar':function(event, instance) {
        event.preventDefault()
        instance.$('#modalVariables').css("display", "none")
    },
    'click #showAddNewVar':function(event, instance){
        if(instance.addComponentVisible.get() === false)
            instance.addComponentVisible.set(true)
    },
    'click .remove':function(event,instance){
        let toRemoveIndex = instance.selectedItem.get()
        let variables = instance.varSpace.get()
        var head = variables.slice(0, toRemoveIndex)
        var tail = variables.slice(toRemoveIndex+1, variables.legth)
        var newVarSpaceState = head.concat(tail)
        instance.varSpace.set(newVarSpaceState)
        instance.addComponentVisible.set(false)
        instance.varName.set('')
        instance.varContent.set('')
        instance.$('#stateTypeCheck').removeAttr('Checked','Checked')
    },

    'click .collapsible':function(event,instance){
        if (event.target.dataset.value !== undefined)
            instance.selectedItem.set(event.target.dataset.value);
    },
    'click .material-collapsible':function(event,instance){
        if (event.target.dataset.value !== undefined){
            let materialSelected = instance.$('#material-selected-'+instance.selectedMaterial.get())
            materialSelected.removeAttr('Checked','Checked')
            instance.selectedMaterial.set(event.target.dataset.value);
            materialSelected = instance.$('#material-selected-'+instance.selectedMaterial.get())
            materialSelected.attr('Checked','Checked')
            console.log(instance.selectedMaterial.get())
        }
    },
    'click .material-selected':function(event,instance){
        Meteor.setTimeout(function() {
            let materialSelected = instance.$('#material-selected-'+instance.selectedMaterial.get())
            materialSelected.removeAttr('Checked','Checked')
            instance.selectedMaterial.set(event.target.parentNode.dataset.value);
            materialSelected = instance.$('#material-selected-'+instance.selectedMaterial.get())
            materialSelected.attr('Checked','Checked')
            console.log(instance.selectedMaterial.get())
        }, 50);
    },
    'change #varNameField': function (event, instance) {
        instance.varName.set(event.target.value)
    },
    'change #varContentField': function (event, instance) {
        instance.varContent.set(event.target.value)
    },
    'change #varTypeField': function (event, instance) {
        instance.varType.set(event.target.value)
    },
    'click #varTypeCheck': function (event, instance){
        if (instance.$('#stateTypeCheck').attr('Checked'))
            instance.$('#stateTypeCheck').removeAttr('Checked','Checked')
        else
            instance.$('#stateTypeCheck').attr('Checked','Checked')
        instance.varType.set(!instance.varType.get())
    }
})

Template.var_management.onRendered(function(){
    Template.instance().$('.collapsible').collapsible()
})
