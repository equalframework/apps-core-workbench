export interface Policy {
    description: string;
    function: string;
  }

  export interface PolicyResponse {
    [key: string]: Policy;
  }


  export interface PolicyItem {
    key: string;
    value: Policy;
  }

  export class PolicyManager {
      private policies: PolicyResponse = {};
      constructor(actions:PolicyResponse){
      this.policies=actions;
      }

      export():PolicyResponse {
      let ret: PolicyResponse = {}; // Initialize the return object as an empty Actions object.
              for (const key in this.policies) {
                if (this.policies.hasOwnProperty(key)) {
                  // Directly assign the Action object for each key
                  const policyDetails = this.policies[key];
                  ret[key] = {
                    description: policyDetails.description,
                    function: policyDetails.function
                  };
                }
              }
              return ret;
          }
    }