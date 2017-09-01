import { Template } from 'meteor/templating';
import { ReactiveVar, Session } from 'meteor/reactive-var';
import {Meteor} from 'meteor/meteor';
import {Materialize} from 'materialize-css';
import {notify} from '../toast/toast';

import './login.html';

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
