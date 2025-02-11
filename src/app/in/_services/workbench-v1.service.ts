import { Injectable } from '@angular/core';
import { BehaviorSubject, from, Observable, of } from 'rxjs';
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


  public deleteNode(node: { package: string; name: string; type: string; item?: any }): Observable<any> {
    switch (node.type) {
        case 'package':
            // Si c'est un package, on appelle la méthode deletePackage
            return this.deletePackage(node.package).pipe(
              tap(() => {
                console.log(`Package ${node.package} supprimé avec succès`);
              }),
              map(() => {
                return { message: `Package ${node.package} supprimé avec succès` };  // Renvoi d'un message
              }),
              catchError(error => {
                console.error(`Erreur lors de la suppression du package ${node.package}:`, error);
                // Retourner un Observable avec un message d'erreur
                return of({ message: `Erreur lors de la suppression du package ${node.package}: ${error}` });
              })
            );
  
      // Cas pour d'autres types de node à supprimer
      case 'class':
        console.log(`Suppression de la classe ${node.name} non implémentée`);
        return from([null]); // Gère ou retourne un Observable vide pour d'autres types
  
      case 'get':
        console.log(`Suppression du GET ${node.name} non implémentée`);
        return from([null]); // Retourne un Observable vide ou un comportement personnalisé pour ce type
  
      // Cas où le type n'est pas reconnu ou pris en charge
      default:
        console.error(`Suppression d'un node de type inconnu ou non pris en charge: ${node.type}`);
        return from([null]); // Retourne un Observable vide pour les types non pris en charge
    }
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
