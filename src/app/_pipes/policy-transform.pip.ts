import { Pipe, PipeTransform } from '@angular/core';
import { PolicyResponse, PolicyItem } from 'src/app/in/_models/policy.model';

@Pipe({
  name: 'policyTransform'
})
export class PolicyTransformPipe implements PipeTransform {
  transform(value: PolicyResponse): PolicyItem[] {
    if (!value) return [];

    return Object.keys(value).map(key => ({
      key: key,
      value: value[key]
    }));
  }
}
