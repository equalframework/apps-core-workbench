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