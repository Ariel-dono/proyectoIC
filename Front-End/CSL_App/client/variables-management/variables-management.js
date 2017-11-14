import { Template } from 'meteor/templating'
import { ReactiveVar } from 'meteor/reactive-var'
import { notify } from '../toast/toast'
import 'materialize-css'

import * as mapboxgl from 'mapbox-gl'
import MapboxDraw from '@mapbox/mapbox-gl-draw'
import turf from '@turf/turf'

import { GlobalAppState } from '../global-state'
import {loadProject, parsingMapJSON} from '../cslmain/cslmain'

Template.var_management.onCreated(function homeOnCreated() {
    this.varName = new ReactiveVar('')
    this.varContent = new ReactiveVar('')
    this.varType = new ReactiveVar(false)
    this.varSpace = new ReactiveVar([])
    this.selectedItem = new ReactiveVar(-1)
    this.addComponentVisible = new ReactiveVar(false)
    this.IsStageSelected = new ReactiveVar(false)
    this.materialAssignable = new ReactiveVar(false)
    this.materials = new ReactiveVar([])
    this.selectedMaterial = new ReactiveVar(-1)
    this.selectedStage = new ReactiveVar({
        layer: -1,
        stage: -1
    })
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
        let isMaterial = instance.varType.get()
        variable.var_type = isMaterial
        if (instance.varType.get()){
            let myMaterials = instance.materials.get().materials
            variable.content = myMaterials[instance.selectedMaterial.get()].id
        }
        else
            variable.content = instance.varContent.get()
        variables.push(variable)
        instance.varSpace.set(variables)
        let stageSelected = instance.selectedStage.get()
        let key = `${stageSelected.stage}:${stageSelected.layer}`
        GlobalAppState.varMapping.set(key, variables)
        instance.addComponentVisible.set(false)
        instance.varName.set('')
        instance.varContent.set('')
        instance.$('#stateTypeCheck').removeAttr('Checked','Checked')
        GlobalAppState.project.project_instance.layers = parsingMapJSON(stageSelected.layer).layers;
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
        console.log(GlobalAppState.varMapping)
    },
    'click #closeModalVar':function(event, instance) {
        event.preventDefault()
        instance.$('#modalVariables').css("display", "none")
        instance.varType.set(false)
        instance.$('#stateTypeCheck').removeAttr('Checked','Checked')
        instance.materialAssignable.set(false)
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
        let stageSelected = instance.selectedStage.get()
        let key = `${stageSelected.stage}:${stageSelected.layer}`
        GlobalAppState.varMapping.set(key, newVarSpaceState)
        instance.varSpace.set(newVarSpaceState)
        instance.addComponentVisible.set(false)
        instance.varName.set('')
        instance.varContent.set('')
        instance.$('#stateTypeCheck').removeAttr('Checked','Checked')
        console.log(GlobalAppState.varMapping)
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
