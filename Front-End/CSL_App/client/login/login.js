import { Template } from 'meteor/templating';
import { ReactiveVar, Session } from 'meteor/reactive-var';
import {Meteor} from 'meteor/meteor';
import {Materialize} from 'materialize-css';
import {notify} from '../toast/toast';

import './login.html';

import * as mapboxgl from 'mapbox-gl';
import * as rxjs from 'rxjs'; 

Template.login.onRendered(
  function() {
      mapboxgl.accessToken = 'pk.eyJ1Ijoiam9zYWx2YXJhZG8iLCJhIjoiY2o2aTM1dmoyMGNuZDJ3cDgxZ2d4eHlqYSJ9.23TgdwGE-zm5-8XUFkz2rQ';
      var map = new mapboxgl.Map({
          center: [-68.13734351262877, 45.137451890638886],
          zoom: 5,
          container: 'map',
          style: 'mapbox://styles/josalvarado/cj6nv3ue212172soj1nvlyaia'
      });
  }
);

Template.login.onCreated(function homeOnCreated() {
  this.username = new ReactiveVar("");
  this.password = new ReactiveVar("");
});

Template.login.helpers({
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
              Router.go('/CSL')
              notify(result.state.message, 3000, 'rounded')
            }
            else{
              notify(result.state.message, 3000, 'rounded')
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
