import { Template } from 'meteor/templating';
import { ReactiveVar, Session } from 'meteor/reactive-var';
import {Meteor} from 'meteor/meteor';
import {notify} from '../toast/toast';

import './login.html';

import * as mapboxgl from 'mapbox-gl';
import * as rxjs from 'rxjs'; 

Template.login.onCreated(function homeOnCreated() {
  this.accessToken = new ReactiveVar("pk.eyJ1Ijoiam9zYWx2YXJhZG8iLCJhIjoiY2o2aTM1dmoyMGNuZDJ3cDgxZ2d4eHlqYSJ9.23TgdwGE-zm5-8XUFkz2rQ");
  this.mapStyle = new ReactiveVar("josalvarado/cj6nv3ue212172soj1nvlyaia");
  this.username = new ReactiveVar("");
  this.password = new ReactiveVar("");
});

Template.login.helpers({
  mapStyle(){
    return Template.instance().mapStyle.get();
  },
  accessToken(){
    return Template.instance().accessToken.get();
  },
  username(){
    return Template.instance().username.get();
  },
  password(){
    return Template.instance().password.get();
  }
});

Template.login.events({
  'click #signinBtn'(event, instance) {
    event.preventDefault();
    Router.go('/signin');
  },
  'click #loginBtn'(event, instance) {
    event.preventDefault();
    try {      
      Meteor.call("login",{
          "name": instance.username.get(),
          "pass": instance.password.get()
        },
        (error, result) => {
          console.log(result)
          if(result !== undefined){
            if(result.code > 0){
              notify("User: " + result.state.message, 3000, 'rounded')
              Meteor.call("getNamespace",instance.username.get(),
              (error, result) => {
                console.log(result)
                if(result !== undefined){
                  Router.go('/CSL')
                  notify("Welcome " + result.username + "!!", 3000, 'rounded')
                }
                else{
                  notify("Error creando el namespace", 3000, 'rounded')        
                }
              }
            );
            }
            else{
              notify("User: " + result.state.message, 3000, 'rounded')
            }
          }
          else{
            notify('Connection Failure', 3000, 'rounded')
          }
        }
      );
    }
    catch (exception) {
      console.log(exception);
    }
  },
  'change #usernameField': function(event,instance) {
    instance.username.set(event.target.value);
  },
  'change #passField': function(event,instance) {
    instance.password.set(event.target.value);
  }
});
