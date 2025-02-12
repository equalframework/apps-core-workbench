import { Injectable } from '@angular/core';
import { BehaviorSubject, from, Observable, of, pipe } from 'rxjs';
import { EqualComponentDescriptor } from '../_models/equal-component-descriptor.class';
import { catchError, map, tap } from 'rxjs/operators';
import { ApiService } from 'sb-shared-lib';

@Injectable({
  providedIn: 'root'
})
export class WorkbenchV1Service {

    private packagesSubject = new BehaviorSubject<EqualComponentDescriptor[]>([]);
    public packages$ = this.packagesSubject.asObservable();

  constructor(private api: ApiService) { }


  public createNode(node: EqualComponentDescriptor): Observable<any>{
    const createActions: Record<string, () => Observable<any>> ={
        package: () => this.createPackage(node.name).pipe(
            this.handleSuccess(`Package ${node.name} ajouté avec succès`),
            this.handleError(`Erreur lors de l'ajout du package ${node.name}`)
        ),
        class: () => this.notImplemented(`Ajout de la classe ${node.name} non implémentée`),
        get: () => this.notImplemented(`Ajout du controller ${node.name} non implémentée`),
    }
    return createActions[node.type]?.() || of("erreur");
  }

  public deleteNode(node: EqualComponentDescriptor): Observable<any> {
    const deleteActions: Record<string, () => Observable<any>> ={
        package: () => this.deletePackage(node.name).pipe(
            this.handleSuccess(`Package ${node.name} supprimé avec succès`),
            this.handleError(`Erreur lors de la suppression du package ${node.name}`)
        ),
        class: () => this.notImplemented(`Suppression de la classe ${node.name} non implémentée`),
        get: () => this.notImplemented(`Suppression du controller ${node.name} non implémentée`),
    }
    return deleteActions[node.type]?.() || of("erreur");
  }


  private handleError(errorMessage: string) {
    return catchError(error => {
        console.error(`${errorMessage}:`, error);
        return of({ message: `${errorMessage}: ${error}` });
    });
}

  private handleSuccess(message: string) {
    return pipe(
        tap(() => console.log(message)),
        map(() => ({ message }))
    );
}

  private notImplemented(message: string): Observable<any> {
    console.warn(message);
    return of({ message });
}


  public createPackage(package_name: string): Observable<any> {
    const url = `?do=core_config_create-package&package=${package_name}`;
    return from(this.api.fetch(url)).pipe(
      catchError(error => {
        console.error('Erreur lors de la création du package:', error);
        // Retourne un Observable vide ou une valeur par défaut en cas d'erreur
        return of(null); // Ou return of(error) si tu veux propager l'erreur d'une manière plus personnalisée
      })
    );
  }

  public deletePackage(package_name: string): Observable<any> {
    const url = `?do=core_config_delete-package&package=${package_name}`;
  
    return from(this.api.fetch(url)).pipe(
      catchError(error => {
        console.error('Erreur lors de la suppression du package:', error);
        // Retourne un Observable vide ou une valeur par défaut en cas d'erreur
        return of(null); // Ou return of(error) si tu veux propager l'erreur d'une manière plus personnalisée
      })
    );
  }



}
