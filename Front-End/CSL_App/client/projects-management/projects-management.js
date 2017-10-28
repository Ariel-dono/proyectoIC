import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { notify } from '../toast/toast';

import * as mapboxgl from 'mapbox-gl';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import turf from '@turf/turf';

import { GlobalAppState } from '../global-state';
import {loadProject,cleanProject} from '../cslmain/cslmain';

Template.projects_management.onCreated(function homeOnCreated() {
    this.projectName = new ReactiveVar('')
    this.namespace = new ReactiveVar(GlobalAppState.namespacing)
    this.selectedProject = new ReactiveVar({})
    this.addComponentVisible = new ReactiveVar(false)
    this.editComponentVisible = new ReactiveVar(false)
    GlobalAppState.templateContext.set("projects_management", this)
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
        let projectId = projectName.toLowerCase().replace(new RegExp(' ', 'g'), "_")
        projectId = GlobalAppState.namespacing.username + ":" + projectId
        if(projectName){
            GlobalAppState.namespacing.projects.push({id:projectId, name:projectName})
            let toUpdateNamespace = {
                "username": GlobalAppState.namespacing.username,
                "projects": GlobalAppState.namespacing.projects
            }
            GlobalAppState.updateFeature("updateProjects", toUpdateNamespace, "getNamespace", 
            {username:GlobalAppState.namespacing.username}, "Updating namespace",
            (result) =>
            {
                GlobalAppState.namespacing=result
                instance.namespace.set(result)
            })
            GlobalAppState.project.key = projectId
            GlobalAppState.project.project_instance.name = projectName
            GlobalAppState.updateFeature("saveProject", GlobalAppState.project, "getProject", 
            {key:GlobalAppState.project.key}, "Creating project",
            (result) =>
            {
                GlobalAppState.project.project_instance=result
                instance.projectName.set('')
                instance.addComponentVisible.set(false)
                GlobalAppState.materials.project_id = GlobalAppState.project.key
                GlobalAppState.updateFeature("saveMaterials", GlobalAppState.materials, "getMaterials", 
                {key:GlobalAppState.project.key}, "Creating material supplies space",
                (result) =>
                {
                    GlobalAppState.materials=result
                })
            })
        }
        else{
            notify("Error creando el proyecto", 3000, 'rounded')
        }
    },
    'click #editModal':function(event, instance){
        event.preventDefault()
        let newName = instance.projectName.get()
        if(newName){
            GlobalAppState.namespacing.projects[instance.selectedProject.get().selectedIndex].name = newName
            GlobalAppState.updateFeature("updateProjects", GlobalAppState.namespacing, "getNamespace", 
            {username:GlobalAppState.namespacing.username}, "Updating namespace",
            (result) =>
            {
                GlobalAppState.namespacing=result
                instance.namespace.set(result);
            })
            GlobalAppState.project.key = instance.selectedProject.get().id
            GlobalAppState.project.project_instance.name = newName
            GlobalAppState.updateFeature("saveProject", GlobalAppState.project, "getProject", 
            {key:GlobalAppState.project.key}, "Creating project",
            (result) =>
            {
                GlobalAppState.project.project_instance=result
                instance.projectName.set('')
                instance.editComponentVisible.set(false)
            })
        }
        else{
            notify("Error editando el proyecto", 3000, 'rounded') 
        }
    },
    'click #closeModalProj':function(event, instance) {
        event.preventDefault()
        instance.$('#modalProjects').css("display", "none")
        instance.addComponentVisible.set(false)
        instance.editComponentVisible.set(false)
    },
    'change #projectNameField': function (event, instance) {
        instance.projectName.set(event.target.value)
    },

    'click .edit':function(event,instance){
        instance.projectName.set(instance.selectedProject.get().name)

        instance.addComponentVisible.set(false)
        if(instance.editComponentVisible.get() === false)
            instance.editComponentVisible.set(true)

        
        instance.$(document).ready(function() {
            Materialize.updateTextFields();
        });
    },

    'click .remove':function(event,instance){
        let toRemoveIndex = instance.selectedProject.get().selectedIndex;
        var head = instance.namespace.get().projects.slice(0, toRemoveIndex)
        var tail = instance.namespace.get().projects.slice(toRemoveIndex+1, instance.namespace.get().projects.legth)
        var newProjectsState = head.concat(tail)
        let toUpdateNamespace = {
            "username": GlobalAppState.namespacing.username,
            "projects": newProjectsState
        }
        GlobalAppState.updateFeature("updateProjects", toUpdateNamespace, "getNamespace", 
        {username:GlobalAppState.namespacing.username}, "Deleting namespace",
        (result) =>
        {
            GlobalAppState.namespacing=result
            instance.namespace.set(result);
        })
        Meteor.call("deleteProject", {key:instance.selectedProject.get().id},
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

                Meteor.call("deleteMaterials", {key:instance.selectedProject.get().id},
                (error, result) => {
                                
                    if(result.code > 0){
                        GlobalAppState.materials = {
                            project_id: "",
                            materials: [],
                            active_materials:[]
                        }
                        
                        GlobalAppState.templateContext.get('CSL').selectedProject.set(false)
                        instance.editComponentVisible.set(false)
                        instance.addComponentVisible.set(false)        
                        cleanProject();
                        notify("Materials space: " + result.state.message, 3000, 'rounded')
                    }
                    else{
                        notify("Materials space: " + result.state.message, 3000, 'rounded')        
                    }
                })
                
                if(result.code > 0){
                    notify("Project: " + result.state.message, 3000, 'rounded')
                }
                else{
                    notify("Project: " + result.state.message, 3000, 'rounded')        
                }
            })
    },

    'click .collapsible':function(event,instance){
        if (event.target.dataset.value !== undefined){
            let selectedItem = GlobalAppState.namespacing.projects[event.target.dataset.value]
            selectedItem.selectedIndex = event.target.dataset.value
            instance.selectedProject.set(selectedItem);
            console.log(instance.selectedProject.get())
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
        GlobalAppState.getRequest("getProject", {key: instance.selectedProject.get().id},"Loading Project", 
        (result)=>{
            GlobalAppState.project.key = instance.selectedProject.get().id
            GlobalAppState.project.project_instance = result
            instance.projectName.set('')
            instance.editComponentVisible.set(false)
            instance.addComponentVisible.set(false)
            loadProject(GlobalAppState.project)
            GlobalAppState.getRequest("getMaterials",  {key:GlobalAppState.project.key}, 
            "Getting material supplies",
            (result) =>
            {
                if (result)
                    GlobalAppState.materials=result
            })
            GlobalAppState.templateContext.get('CSL').selectedProject.set(true)
        })
    }
})

Template.projects_management.onRendered(function(){
    Template.instance().$('.collapsible').collapsible()
})