import { Meteor } from 'meteor/meteor';
import {HTTP} from 'meteor/http';
import {state} from './global.state';

const login = 'user/login/';
const signin = 'user/insert/';

if (Meteor.isServer) {
    Meteor.methods({
        login: function (loginRequest) {
            return HTTP.call("POST", state.path + login, { data:loginRequest }).data;
        },
        signin: function (signinRequest) {
            return HTTP.call("POST", state.path + signin, { data:signinRequest }).data;
        }
    });
}


Meteor.startup(() => {
});
