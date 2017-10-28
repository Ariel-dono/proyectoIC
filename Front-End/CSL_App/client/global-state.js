import { notify } from './toast/toast';

export class GlobalAppState {
    static templateContext = new Map()
    username = ''
    namespacing = {}
    project = {}
    projectSelectedEvent = {}
    map={}
    draw={}
    materials = {}
    static getRequest(name, data, message, changingValueCallback){
        Meteor.call(name,data,
        (error, result) => {
            console.log(result)
            if(result !== undefined){
                changingValueCallback(result);
                notify(`${message}!!`, 3000, 'rounded')
            }
            else{
                notify(`Error: ${message}`, 3000, 'rounded')        
            }
        });
    }

    static updateFeature(setOperation, setData, getOperation, getData, message, changingValueCallback){
        Meteor.call(setOperation, setData,
        (error, result) => {
            console.log(error)
            console.log(result)
            notify(`${message}: ${result.state.message}`, 3000, 'rounded')
            GlobalAppState.getRequest(getOperation, getData, message, changingValueCallback)
        })
    }
};