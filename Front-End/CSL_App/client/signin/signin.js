import { Template } from 'meteor/templating';
import { ReactiveVar, Session } from 'meteor/reactive-var';
import {Meteor} from 'meteor/meteor';
import {notify} from '../toast/toast';

import './signin.html';

Template.signin.onCreated(function homeOnCreated() {
  this.accessToken = new ReactiveVar("pk.eyJ1Ijoiam9zYWx2YXJhZG8iLCJhIjoiY2o2aTM1dmoyMGNuZDJ3cDgxZ2d4eHlqYSJ9.23TgdwGE-zm5-8XUFkz2rQ");
  this.mapStyle = new ReactiveVar("josalvarado/cj6nv3ue212172soj1nvlyaia");
  this.username = new ReactiveVar("");
  this.password = new ReactiveVar("");
  this.repitedPassword = new ReactiveVar("");
  this.email = new ReactiveVar("");
});

Template.signin.helpers({
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
  },
  repitedPassword(){
    return Template.instance().repitedPassword.get();
  },
  email(){
    return Template.instance().email.get();
  }
});

Template.signin.events({
  'click #back'(event, instance) {
    event.preventDefault();
    Router.go('/login')
  },
  'click #saveUser'(event, instance) {
    event.preventDefault();
    if(instance.repitedPassword.get()===instance.password.get()){
      try {      
        Meteor.call("signin",{
            "username": instance.username.get(),
            "pass": instance.password.get(),
            "email":instance.email.get()
          },
          (error, result) => {
            console.log(result)
            if(result !== undefined){
              if(result.code > 0){
                notify("User: " + result.state.message, 3000, 'rounded')
                Meteor.call("createNamespace",instance.username.get(),
                  (error, result) => {
                    console.log(result)
                    if(result !== undefined){
                      if(result.code > 0){
                        Router.go('/login')
                        notify("Namespace: " + result.state.message, 3000, 'rounded')
                      }
                      else{
                        notify("Namespace: " + result.state.message, 3000, 'rounded')        
                      }
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
    }
    else{
      console.log("Las contraseñas no coinciden")
    }
  },
  'change #usernameField': function(event,instance) {
    instance.username.set(event.target.value);
  },
  'change #passField': function(event,instance) {
    instance.password.set(event.target.value);
  },
  'change #rePassField': function(event,instance) {
    instance.repitedPassword.set(event.target.value);
  },
  'change #emailField': function(event,instance) {
    instance.email.set(event.target.value);
  }
});
