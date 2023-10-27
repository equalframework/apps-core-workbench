import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Usage } from '../controllers/_components/params-editor/_objects/Params';
import { TypeUsageService } from 'src/app/_services/type-usage.service';

@Component({
  selector: 'app-usages',
  templateUrl: './usages.component.html',
  styleUrls: ['./usages.component.scss']
})
export class UsagesComponent implements OnInit {

  @Input() usage:Usage
  @Input() name:string
  @Input() type:string
  @Output() CRUD = new EventEmitter<string>()

  constructor(
    private typeUsage: TypeUsageService
  ) { }

  ngOnInit(): void {
    console.log(this.typeUsage.usages)
  }

  public changeUsage(value: string) {
    console.log("USAGE CHANGED")
    this.usage.setUsage(this.usageForCurrentType?.includes(value) ? value : "")
    this.CRUD.emit(this.usage.usage ? "Changed usage of "+this.name+" to "+this.usage.usage : "removed usage of "+this.name)
  }

  public changeSubUsage(value: string) {
    console.log("SUBUSAGE CHANGED")
    this.usage.setSubUsage(this.possibleSubUsage?.includes(value) ? value : "")
    this.CRUD.emit(this.usage.subusage ? "Changed subusage of "+this.name+" to "+this.usage.subusage : "removed subusage of "+this.name)
  }

  public changeVariation(value: string) {
    console.log("VARIATION CHANGED")
    this.usage.setVariation(this.possibleVariations?.includes(value) ? value : "")
    this.CRUD.emit(this.usage.variation ? "Changed variation of "+this.name+" to "+this.usage.variation : "removed variation of "+this.name)
  }

  public changeLength(value: string) {
    console.log("LENGTH CHANGED")
    console.log(this.lengthDim)
    // toString() is needed because js is sometime giving a number regardless the ts typing
    console.log(value.toString().split(".",this.lengthDim).join("."))
    this.usage.setLength(value.toString().split(".",this.lengthDim).join("."))
    this.CRUD.emit(this.usage.length ? "Changed length of "+this.name+" to "+this.usage.length : "removed length of "+this.name)
  }

  public changeMin(value: string) {
    console.log("MIN CHANGED")
    this.usage.setMin(value)
    this.CRUD.emit(this.usage.min ? "Changed min value of "+this.name+" to "+this.usage.min : "Removed min value of "+this.name)
  }


  public changeMax(value: string) {
    console.log("Max CHANGED")
    this.usage.setMax(value)
    this.CRUD.emit(this.usage.max ? "Changed max value of "+this.name+" to "+this.usage.max : "Removed max value of "+this.name)
  }

  get usageForCurrentType(): string[] | undefined {
    if (this.typeUsage.usages[this.type]) {
      return ["", ...(Object.keys(this.typeUsage.usages[this.type]).filter(item => item !== "length_free" && item !== "length_dim" && item !== "boundary"))]
    }
    return undefined
  }

  get possibleSubUsage(): string[] | undefined {
    if (this.usage.usage && this.typeUsage.usages[this.type] && this.typeUsage.usages[this.type][this.usage.usage] && this.typeUsage.usages[this.type][this.usage.usage].subusages) {
      return ["", ...Object.keys(this.typeUsage.usages[this.type][this.usage.usage].subusages)]
    }
    return undefined
  }

  get possibleVariations(): string[] | undefined {
    if ( this.usage.usage
      && this.typeUsage.usages[this.type]
      && this.typeUsage.usages[this.type][this.usage.usage]
      && this.typeUsage.usages[this.type][this.usage.usage].subusages
      && this.typeUsage.usages[this.type][this.usage.usage].subusages[this.usage.subusage]
      && this.typeUsage.usages[this.type][this.usage.usage].subusages[this.usage.subusage].variations
    ) {
      return ["", ...Object.keys(this.typeUsage.usages[this.type][this.usage.usage].subusages[this.usage.subusage].variations)]
    }
    return undefined
  }

  get possibleLength(): string[] | undefined {
    if (
      this.usage.usage
      && this.typeUsage.usages[this.type]
      && this.typeUsage.usages[this.type][this.usage.usage]
    ) {
      if (!this.usage.subusage && this.typeUsage.usages[this.type][this.usage.usage].length) {
        return ["", ...this.typeUsage.usages[this.type][this.usage.usage].length]
      }
      if (
        this.typeUsage.usages[this.type][this.usage.usage].subusages
        && this.typeUsage.usages[this.type][this.usage.usage].subusages[this.usage.subusage]
      ) {
        if (!this.usage.variation && this.typeUsage.usages[this.type][this.usage.usage].subusages[this.usage.subusage].length) {
          return ["", ...this.typeUsage.usages[this.type][this.usage.usage].subusages[this.usage.subusage].length]
        }
        if (
          this.typeUsage.usages[this.type][this.usage.usage].subusages[this.usage.subusage].variations
          && this.typeUsage.usages[this.type][this.usage.usage].subusages[this.usage.subusage].variations[this.usage.variation]
          && this.typeUsage.usages[this.type][this.usage.usage].subusages[this.usage.subusage].variations[this.usage.variation].length
        ) {
          return ["", ...Object.keys(this.typeUsage.usages[this.type][this.usage.usage].subusages[this.usage.subusage].variations[this.usage.variation].length)]
        }
      }
    }
    return undefined
  }

  get hasFreeLength(): boolean {
    let res = false
    if(
      this.typeUsage.usages[this.type]
    ){
      if (this.typeUsage.usages[this.type].length_free !== undefined) {
        res = this.typeUsage.usages[this.type].length_free
      }

      if (
        this.typeUsage.usages[this.type][this.usage.usage]
      ) {
        if (this.typeUsage.usages[this.type][this.usage.usage].length_free !== undefined) {
          res = this.typeUsage.usages[this.type][this.usage.usage].length_free
        }

        if (
          this.typeUsage.usages[this.type][this.usage.usage].subusages
          && this.typeUsage.usages[this.type][this.usage.usage].subusages[this.usage.subusage]
        ) {
          if (this.typeUsage.usages[this.type][this.usage.usage].subusages[this.usage.subusage].length_free !== undefined) {
            res = this.typeUsage.usages[this.type][this.usage.usage].subusages[this.usage.subusage].length_free
          }

          if (
            this.typeUsage.usages[this.type][this.usage.usage].subusages[this.usage.subusage].variations
            && this.typeUsage.usages[this.type][this.usage.usage].subusages[this.usage.subusage].variations[this.usage.variation]
            && this.typeUsage.usages[this.type][this.usage.usage].subusages[this.usage.subusage].variations[this.usage.variation].length_free !== undefined
          ) {
            res = this.typeUsage.usages[this.type][this.usage.usage].subusages[this.usage.subusage].length_free
          }
        }
      }
    }
    return res
  }

  get lengthDim(): number {
    let res = 1
    if(
      this.typeUsage.usages[this.type]
    ){
      if (this.typeUsage.usages[this.type].length_dim !== undefined) {
        res = this.typeUsage.usages[this.type].length_dim
      }

      if (
        this.typeUsage.usages[this.type][this.usage.usage]
      ) {
        if (this.typeUsage.usages[this.type][this.usage.usage].length_dim !== undefined) {
          res = this.typeUsage.usages[this.type][this.usage.usage].length_dim
        }

        if (
          this.typeUsage.usages[this.type][this.usage.usage].subusages
          && this.typeUsage.usages[this.type][this.usage.usage].subusages[this.usage.subusage]
        ) {
          if (this.typeUsage.usages[this.type][this.usage.usage].subusages[this.usage.subusage].length_dim !== undefined) {
            res = this.typeUsage.usages[this.type][this.usage.usage].subusages[this.usage.subusage].length_dim
          }

          if (
            this.typeUsage.usages[this.type][this.usage.usage].subusages[this.usage.subusage].variations
            && this.typeUsage.usages[this.type][this.usage.usage].subusages[this.usage.subusage].variations[this.usage.variation]
            && this.typeUsage.usages[this.type][this.usage.usage].subusages[this.usage.subusage].variations[this.usage.variation].length_dim !== undefined
          ) {
            res = this.typeUsage.usages[this.type][this.usage.usage].subusages[this.usage.subusage].length_dim
          }
        }
      }
    }
    return res
  }

  get canHaveBoundaries(): boolean {
    let res = false
    if(
      this.typeUsage.usages[this.type]
    ){
      if (this.typeUsage.usages[this.type].boundary !== undefined) {
        res = this.typeUsage.usages[this.type].boundary
      }

      if (
        this.typeUsage.usages[this.type][this.usage.usage]
      ) {
        if (this.typeUsage.usages[this.type][this.usage.usage].boundary !== undefined) {
          res = this.typeUsage.usages[this.type][this.usage.usage].boundary
        }

        if (
          this.typeUsage.usages[this.type][this.usage.usage].subusages
          && this.typeUsage.usages[this.type][this.usage.usage].subusages[this.usage.subusage]
        ) {
          if (this.typeUsage.usages[this.type][this.usage.usage].subusages[this.usage.subusage].boundary !== undefined) {
            res = this.typeUsage.usages[this.type][this.usage.usage].subusages[this.usage.subusage].boundary
          }

          if (
            this.typeUsage.usages[this.type][this.usage.usage].subusages[this.usage.subusage].variations
            && this.typeUsage.usages[this.type][this.usage.usage].subusages[this.usage.subusage].variations[this.usage.variation]
            && this.typeUsage.usages[this.type][this.usage.usage].subusages[this.usage.subusage].variations[this.usage.variation].boundary !== undefined
          ) {
            res = this.typeUsage.usages[this.type][this.usage.usage].subusages[this.usage.subusage].boundary
          }
        }
      }
    }
    return res
  }

  noCancel(event: KeyboardEvent) {
    console.log(event)
    if( event.key === "z" && event.ctrlKey) {
      event.preventDefault()
    }
    if( event.key === "y" && event.ctrlKey) {
      event.preventDefault()
    }
  } 
}
