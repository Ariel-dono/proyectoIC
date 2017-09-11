import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { notify } from '../toast/toast';

import { GlobalState } from '../global-state';

Template.projects_management.onCreated(function homeOnCreated() {
    this.projectName = new ReactiveVar('')
    this.namespace = new ReactiveVar(GlobalState.namespacing);
})

Template.projects_management.helpers({
    projectName() {
        return Template.instance().projectName.get()
    },
    namespace(){
        return Template.instance().namespace.get()
    }
})

Template.projects_management.events({
    'click #saveModal'(event, instance) {
        event.preventDefault()
        if (GlobalState.namespacing.projects === null)
            GlobalState.namespacing.projects = []
        GlobalState.namespacing.projects.push(instance.projectName.get())
        let toUpdateNamespace = {
            "username": GlobalState.namespacing.username,
            "projects": GlobalState.namespacing.projects
        }
        Meteor.call("updateProjects", toUpdateNamespace,
            (error, result) => {
                console.log(result)
                Meteor.call("getNamespace",GlobalState.namespacing.username,
                (error, result) => {
                  if(result !== undefined){
                    GlobalState.namespacing = result;
                    instance.namespace.set(result);
                    notify("Proyecto creado, usuario: " + result.username + "!!", 3000, 'rounded')
                  }
                  else{
                    notify("Error creando el proyecto", 3000, 'rounded')        
                  }
                })
            }
        )
    },
    'click #closeModal'(event, instance) {
        event.preventDefault()
        instance.$('#modalCreate').css("display", "none");
    },
    'change #projectNameField': function (event, instance) {
        instance.projectName.set(event.target.value)
    },
    'click .collapsible':function(event,instance){
        let selected = event.target.dataset;
        instance.$('.collapsible').collapsible(selected.value);
    }
})
