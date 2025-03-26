export interface Action {
    description:string;
    policies:string[];
    function:string;
}

export interface Actions {
    [key:string]:Action;
}

export interface ActionItem {
    key:string,
    value:Action
}

export class ActionManager {
    private actions: Actions = {};
    constructor(actions:Actions){
    this.actions=actions;
    }

    export():Actions {
    let ret: Actions = {}; // Initialize the return object as an empty Actions object.
            for (const key in this.actions) {
              if (this.actions.hasOwnProperty(key)) {
                // Directly assign the Action object for each key
                const actionDetails = this.actions[key];
                ret[key] = {
                  description: actionDetails.description,
                  policies: actionDetails.policies,
                  function: actionDetails.function
                };
              }
            }
            return ret;
        }
  }

