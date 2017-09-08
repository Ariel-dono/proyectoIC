import { Meteor } from 'meteor/meteor';
import {HTTP} from 'meteor/http';
import {state} from './global.state';

const login = 'user/login/';
const signin = 'user/insert/';
const createNamespace = 'namespace/create/';
const getNamespace = 'namespace/get/';
const addProject = 'namespace/update/projects/';

if (Meteor.isServer) {
    Meteor.methods({
        login: function (loginRequest) {
            return HTTP.call("POST", state.path + state.users + login, { data:loginRequest }).data;
        },
        signin: function (signinRequest) {
            return HTTP.call("POST", state.path + state.users + signin, { data:signinRequest }).data;
        },
        createNamespace: function(username){
            return HTTP.call("POST", state.path + state.namespace + createNamespace, { data:{username:username,projects:[]} }).data;
        },
        getNamespace:function(username){
            return HTTP.call("POST", state.path + state.namespace + getNamespace, { data:{username:username} }).data;
        },
        updateProjects:function(namespace){
            return HTTP.call("POST", state.path + state.namespace + addProject, { data:namespace }).data;
        }
    });
}


Meteor.startup(() => {
});
