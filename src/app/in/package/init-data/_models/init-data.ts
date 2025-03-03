import { cloneDeep } from "lodash";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { WorkbenchService } from "src/app/in/_services/workbench.service";

export class UnparsableError extends Error {

}

export class InitDataFile {
    public name:string = "new_file.json"
    public entities:{[entity:string]:InitDataEntitySection} = {}

    constructor(private workbenchService:WorkbenchService, name?:string, schema:any = [] ) {
        if(name) {
            this.name = name
        }
        for(let entity of schema) {
            console.log(entity)
            if(entity.name) {
                if(!this.entities[entity.name]) {
                    try {
                        this.entities[entity.name] = new InitDataEntitySection(workbenchService,entity)
                    } catch(e) {
                        throw e
                    }
                } else {
                    this.entities[entity.name].addItems(entity.lang, entity.data)
                }
            }
        }
    }

    export():any[] {
        let result:any[] = []
        for(let entity_k in this.entities) {
            result.push(...this.entities[entity_k].export())
        }
        return result
    }
}

export class InitDataEntitySection {
    private num:number = 1
    private entity:string
    private fields:{name:string,type:string, multilang:boolean, required:boolean}[] = []
    public items : InitDataEntityInstance[] = []
    allUsedLangs:string[] =  ['en']
    public get AllField() {
        return cloneDeep(this.fields)
    }
    public get MultilangField() {
        return cloneDeep(this.fields).filter(item => item.multilang)
    }
    public get name() {
        return this.entity
    }
    public getInstanceById(id:number):InitDataEntityInstance {
        for(let instance of this.items) {
            if(instance.id === id) {
                return instance
            }
        }
        this.items.push(new InitDataEntityInstance(id,this.allUsedLangs))
        return this.items[this.items.length - 1]
    }

    public isIdTaken(id:number):boolean  {
        for(let instance of this.items) {
            if(instance.id === id) {
                return true
            }
        }
        return false
    }

    constructor(
        private workbenchService:WorkbenchService,
        scheme:any
    ) {
        if(!scheme.name) {
            throw new UnparsableError()
        }
        this.entity = scheme.name
        this.loadSchema(scheme).subscribe({
                   next: () => {
                       this.addItems(scheme.lang, scheme.data);
                   },
                   error: (err) => {
                       console.error('Schema loading failed:', err);
                   }
               });
           }
       
           ok = false
       
           // Load and process the schema
           loadSchema(scheme: any): Observable<void> {
               return this.workbenchService.getSchema(this.entity).pipe(
                   map((schemaResponse) => {
                       // If the schema doesn't contain fields
                       const fields = schemaResponse['fields'];
                       if (!fields) {
                           throw new UnparsableError(); // Throw an error if fields are missing
                       }
       
                       // Transform the schema into a usable format
                       for (const [k, field] of Object.entries(fields)) {
                           // Assert that field is of type 'Field'
                           this.fields.push({
                               name: k,
                               type: (field as { type: string }).type,  // Type assertion for 'field'
                               multilang: !!(field as { multilang: boolean }).multilang,
                               required: !!(field as { required: boolean }).required,
                           });
                       }

                       // Ensure that the language is defined
                       if (!scheme.lang) {
                           throw new UnparsableError(); // Throw an error if the language is missing
                       }

                       // The schema is successfully loaded
                       this.ok = true;
                   })
               );
           }

    addLang(lang:string) {
        if(this.allUsedLangs.includes(lang)) return
        this.allUsedLangs.push(lang)
        for(let item of this.items) {
            item.addLang(lang)
        }
    }

    removeLang(lang:string) {
        if(lang === 'en') return
        this.allUsedLangs.splice(this.allUsedLangs.indexOf(lang),1)
        for(let item of this.items) {
           item.deleteLang(lang)
        }
    }

    RenameLang(from:string,to:string) {
        if(from === 'en' || to === 'en' || from == to || this.allUsedLangs.includes(to)) return
        this.allUsedLangs[this.allUsedLangs.indexOf(from)] = to
        for(let item of this.items) {
            item.renameLang(from,to)
        }
    }

    async addItems(lang:string,data:any) {
        const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
        while(!this.ok) {
            await sleep(10)
        }
        this.addLang(lang)
        for(let item of data) {
            let strict = true
            if(!item.id) {
                for(;this.isIdTaken(this.num);this.num++);
                item.id = this.num++
                strict = false
            }
            this.getInstanceById(item.id).updateLang(lang,item,this.fields,strict)
        }
    }

    export():any[] {
        let result:any[] = []
        for(let lang of this.allUsedLangs) {
            result.push({
                name : this.name,
                lang : lang,
                data : []
            })
            for(let instance of this.items) {
                const data = instance.export(lang)
                if(data) {
                    result[result.length - 1].data.push(data)
                }
            }
            if(result[result.length - 1].data.length === 0) {
                result.splice(result.length - 1,1)
            }
        }
        return result
    }
}

export class InitDataEntityInstance {
    public id:number;
    public id_strict:boolean;
    public otherfield:{[lang:string]:any} = {"en" : {}};
    public selected:boolean = false

    constructor(id:number,langs:string[]) {
        this.id = id
        for(let lang of langs) {
            this.otherfield[lang] = {}
        }
    }

    static ImportFromRealData(data:any = {},fields:any):InitDataEntityInstance {
        let f:{name:string,type:string, multilang:boolean, required:boolean}[] = []
        for (const [k, field] of Object.entries(fields)) {
            const cast:any = field
            f.push({name:k, type:cast.type, multilang:!!cast.multilang, required:!!cast.required})
        }
        let ret = new InitDataEntityInstance(0,['en'])
        ret.id = data.id
        ret.updateLang("en",data,f,true)
        return ret
    }

    public renameLang(from:string, to:string) {
        if(from === 'en') return
        if(Object.keys(this.otherfield).includes(to)) return 
        this.otherfield[to] = cloneDeep(this.otherfield[from])
        delete this.otherfield[from]
    }

    public addLang(lang:string) {
        if(Object.keys(this.otherfield).includes(lang)) return 
        this.otherfield[lang] = {}
    }

    public deleteLang(lang:string) {
        if(lang === 'en') return 
        delete this.otherfield[lang]
    }


    updateLang(lang:string,data:any,fields:{name:string,type:string, multilang:boolean, required:boolean}[], id_strict:boolean) {
        if(!this.id_strict){
            this.id_strict = id_strict
        }
        //console.log("======== "+lang+" ==========")
        //console.log(fields)
        if(!this.otherfield[lang]) {
            this.otherfield[lang] = {}
        }
        for(let field of fields) {
            if(field.name === 'id') {
                continue
            }
            //console.log(field.name+"  =>  "+field.multilang+" "+data[field.name])
            if((lang === 'en' || field.multilang) && !['computed','alias'].includes(field.type) && data[field.name]) {
                this.otherfield[lang][field.name] = data[field.name]
            }
        }
    }

    export(lang:string) {
        let res:any = {  }
        if(this.id_strict) {
            res.id = this.id
        }
        for(let field_k in this.otherfield[lang]) {
            if(this.otherfield[lang][field_k]) {
                res[field_k] = this.otherfield[lang][field_k]
            }
        }
        if(lang === 'en') {
            return res
        }
        return Object.keys(res).length <= (this.id_strict ? 1 : 0) ? undefined : res
    }
}