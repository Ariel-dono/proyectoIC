import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { notify } from '../toast/toast';

import * as mapboxgl from 'mapbox-gl';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import turf from '@turf/turf';

import { GlobalAppState } from '../global-state';

Template.projects_management.onCreated(function homeOnCreated() {
    this.projectName = new ReactiveVar('')
    this.namespace = new ReactiveVar(GlobalAppState.namespacing);
    this.selectedItem = new ReactiveVar(-1);
    this.addComponentVisible = new ReactiveVar(false);
    this.editComponentVisible = new ReactiveVar(false);
})

Template.projects_management.helpers({
    projectName() {
        return Template.instance().projectName.get()
    },
    namespace(){
        return Template.instance().namespace.get()
    },
    addComponentVisible(){
        return Template.instance().addComponentVisible.get()
    },
    editComponentVisible(){
        return Template.instance().editComponentVisible.get()
    }
})

Template.projects_management.events({
    'click #saveModal'(event, instance) {
        event.preventDefault()
        if (GlobalAppState.namespacing.projects === null)
            GlobalAppState.namespacing.projects = []
        let projectName = instance.projectName.get()
        if(projectName){
            let projectId = projectName.toLowerCase().replace(" ", "_");
            GlobalAppState.namespacing.projects.push({id:GlobalAppState.namespacing.username + ":" + projectId, name:projectName})
            let toUpdateNamespace = {
                "username": GlobalAppState.namespacing.username,
                "projects": GlobalAppState.namespacing.projects
            }
            Meteor.call("updateProjects", toUpdateNamespace,
                (error, result) => {
                    console.log(result)
                    Meteor.call("getNamespace",GlobalAppState.namespacing.username,
                        (error, result) => {
                            console.log(result)
                            if(result !== undefined){
                                GlobalAppState.namespacing = result;
                                instance.namespace.set(result);
                                instance.projectName.set('')
                                instance.addComponentVisible.get(false)
                                notify("Proyecto creado, usuario: " + result.username + "!!", 3000, 'rounded')
                            }
                            else{
                                notify("Error creando el proyecto", 3000, 'rounded')        
                            }
                        }
                    )
                }
            )
            GlobalAppState.project.key = GlobalAppState.namespacing.username + ":" + projectId
            GlobalAppState.project.project_instance.name = projectName
            Meteor.call("saveProject", GlobalAppState.project,
                (error, result) => {
                    console.log(result)
                    if(result.code > 0){
                        Meteor.call("getProject", {key:GlobalAppState.project.key},
                            (error, result) => {
                                console.log(result)
                                if(result !== undefined){
                                    GlobalAppState.project.key = GlobalAppState.namespacing.projects[instance.selectedItem.get()].id;
                                    GlobalAppState.project.project_instance = result;                        
                                    notify("Proyecto creado: " + result.name + "!!", 3000, 'rounded')
                                }
                                else{
                                    notify("Error creando el proyecto", 3000, 'rounded')        
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
        else{
            notify("Error creando el proyecto", 3000, 'rounded')
        }
    },
    'click #editModal':function(event, instance){
        event.preventDefault()
        let newName = instance.projectName.get()
        if(newName){
            GlobalAppState.namespacing.projects[instance.selectedItem.get()].name = newName
            let toUpdateNamespace = {
                "username": GlobalAppState.namespacing.username,
                "projects": GlobalAppState.namespacing.projects
            }
            Meteor.call("updateProjects", toUpdateNamespace,
                (error, result) => {
                    console.log(result)
                    Meteor.call("getNamespace",GlobalAppState.namespacing.username,
                        (error, result) => {
                            console.log(result)
                            if(result !== undefined){
                                GlobalAppState.namespacing = result;
                                instance.namespace.set(result);
                                instance.projectName.set('')
                                instance.editComponentVisible.get(false)
                                notify("Proyecto editado, usuario: " + result.username + "!!", 3000, 'rounded')
                            }
                            else{
                                notify("Error editando el proyecto", 3000, 'rounded')        
                            }
                        }
                    )
                }
            )
            GlobalAppState.project.project_instance.name = newName
            Meteor.call("saveProject", GlobalAppState.project,
                (error, result) => {
                    console.log(result)
                    if(result.code > 0){
                        Meteor.call("getProject", {key:GlobalAppState.namespacing.projects[instance.selectedItem.get()].id},
                            (error, result) => {
                                console.log(result)
                                if(result !== undefined){
                                    GlobalAppState.project.key = GlobalAppState.namespacing.projects[instance.selectedItem.get()].id;
                                    GlobalAppState.project.project_instance = result;                        
                                    notify("Proyecto editado: " + result.name + "!!", 3000, 'rounded')
                                }
                                else{
                                    notify("Error editando el proyecto", 3000, 'rounded')        
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
        else{
            notify("Error editando el proyecto", 3000, 'rounded') 
        }
    },
    'click #closeModal':function(event, instance) {
        event.preventDefault()
        instance.$('#modalCreate').css("display", "none")
        instance.addComponentVisible.set(false)
        instance.editComponentVisible.set(false)
    },
    'change #projectNameField': function (event, instance) {
        instance.projectName.set(event.target.value)
    },
    'click .edit':function(event,instance){
        instance.projectName.set(GlobalAppState.namespacing.projects[instance.selectedItem.get()].name)

        
        instance.addComponentVisible.set(false)
        if(instance.editComponentVisible.get() === false)
            instance.editComponentVisible.set(true)
    },
    'click .remove':function(event,instance){
        var head = instance.namespace.get().projects.slice(0, Template.instance().selectedItem.get())
        var tail = instance.namespace.get().projects.slice(Template.instance().selectedItem.get()+1, instance.namespace.get().projects.legth)
        var newProjectsState = head.concat(tail)
        let toUpdateNamespace = {
            "username": GlobalAppState.namespacing.username,
            "projects": newProjectsState
        }
        Meteor.call("updateProjects", toUpdateNamespace,
            (error, result) => {
                console.log(result)
                Meteor.call("getNamespace",GlobalAppState.namespacing.username,
                    (error, result) => {
                        console.log(result)
                        if(result !== undefined){
                            GlobalAppState.namespacing = result;
                            instance.namespace.set(result);
                            notify("Proyecto eliminando, usuario: " + result.username + "!!", 3000, 'rounded')
                        }
                        else{
                            notify("Error eliminando el proyecto", 3000, 'rounded')        
                        }
                    }
                )
            }
        )
        Meteor.call("deleteProject", {key:GlobalAppState.namespacing.projects[instance.selectedItem.get()].id},
            (error, result) => {
                console.log(result)
                GlobalAppState.project = {
                    key:"",
                    project_instance:{
                        layers:[],
                        name:"",
                        zoom:0,
                        reference:{
                            x:-1,
                            y:-1
                        }
                    }
                }
                if(result.code > 0){
                    notify("Project: " + result.state.message, 3000, 'rounded')
                }
                else{
                    notify("Project: " + result.state.message, 3000, 'rounded')        
                }
            }
        )   
    },
    'click .collapsible':function(event,instance){
        if (event.target.dataset.value !== undefined){
            instance.selectedItem.set(event.target.dataset.value);
            Meteor.call("getProject", {key:GlobalAppState.namespacing.projects[instance.selectedItem.get()].id},
                (error, result) => {
                    if(result !== undefined){
                        GlobalAppState.project.key = GlobalAppState.namespacing.projects[instance.selectedItem.get()].id;
                        GlobalAppState.project.project_instance = result;
                        console.log(GlobalAppState.project)                        
                    }
                    else{
                        notify("Error creando el proyecto", 3000, 'rounded')        
                    }
                }
            )
        }

    },
    'click #showAddNewProject':function(event, instance){
        instance.projectName.set('')
        instance.editComponentVisible.set(false)
        if(instance.addComponentVisible.get() === false)
            instance.addComponentVisible.set(true)
    },
    'click .load': function(event, instance){
        GlobalAppState.projectSelectedEvent.set(true)
        notify("Proyecto en edición", 3000, 'rounded')
        Meteor.call("projectGet", {key: GlobalAppState.project.key},
        (error, result) => {
            console.log("Cargando elemento:")
            console.log(result.project_instance.layers[0])
            console.log(result.project_instance.layers[0].stages)
            
        }
    )


    }
})

Template.projects_management.onRendered(function(){
    Template.instance().$('.collapsible').collapsible()
    console.log(GlobalAppState)
})  