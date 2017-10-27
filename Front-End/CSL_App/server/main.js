import { Meteor } from 'meteor/meteor';
import {HTTP} from 'meteor/http';
import {state} from './global.state';

const login = 'user/login/'
const signin = 'user/insert/'
const createNamespace = 'namespace/create/'
const getNamespace = 'namespace/get/'
const addProject = 'namespace/update/projects/'
const projectSave = 'project/save/'
const projectGet = 'project/get/'
const projectDelete = 'project/delete/'
const materialSupplySave = 'materialsspace/save/'
const materialSupplyGet = 'materialsspace/get/'
const materialSupplyDelete = 'materialsspace/delete/'

if (Meteor.isServer) {
    Meteor.methods({
        login: function (loginRequest) {
            return HTTP.call("POST", state.path + state.users + login, { data:loginRequest }).data;
        },
        signin: function (signinRequest) {
            return HTTP.call("POST", state.path + state.users + signin, { data:signinRequest }).data;
        },
        createNamespace: function(username){
            return HTTP.call("POST", state.path + state.namespace + createNamespace, { data:username,projects:[]}).data;
        },
        getNamespace:function(username){
            return HTTP.call("POST", state.path + state.namespace + getNamespace, { data:username }).data;
        },
        updateProjects:function(namespace){
            return HTTP.call("POST", state.path + state.namespace + addProject, { data:namespace }).data;
        },
        saveProject:function(project){
            return HTTP.call("POST",state.path + state.projects + projectSave,{data: project}).data;
        },
        getProject:function(project){
            return HTTP.call("POST",state.path + state.projects + projectGet,{data: project}).data;
        },
        deleteProject:function(project){
            return HTTP.call("POST",state.path + state.projects + projectDelete,{data: project}).data;
        },
        saveMaterials:function(materials){
            return HTTP.call("POST",state.path + state.materials + materialSupplySave,{data: materials}).data;
        },
        getMaterials:function(materials){
            return HTTP.call("POST",state.path + state.materials + materialSupplyGet,{data: materials}).data;
        },
        deleteMaterials:function(materials){
            return HTTP.call("POST",state.path + state.materials + materialSupplyDelete,{data: materials}).data;
        }
    });
}


Meteor.startup(() => {
});
