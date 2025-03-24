export interface Policy {
    description: string;
    function: string;
  }

  export interface PolicyResponse {
    [key: string]: Policy;
  }
