import { Injectable } from '@angular/core';
import { BehaviorSubject, from, Observable, of } from 'rxjs';
import { EqualComponentDescriptor } from '../_models/equal-component-descriptor.class';
import { catchError, map, switchMap } from 'rxjs/operators';
import { ApiService } from 'sb-shared-lib';

@Injectable({
  providedIn: 'root'
})
export class EqualComponentsProviderService {
    private equalComponentsSubject = new BehaviorSubject<EqualComponentDescriptor[]>([]);
    public equalComponents$ = this.equalComponentsSubject.asObservable();
    constructor(private api: ApiService) { 
        this.loadComponents();
    }

  // Méthode pour récupérer toutes les classes
  private fetchClasses(): Observable<any> {
    return from(this.api.fetch('?get=core_config_classes')).pipe(
      catchError(error => {
        console.error('Erreur lors de la récupération des classes:', error);
        return of([]); // Retourner un tableau vide en cas d'erreur
      })
    );
  }

      
      
     private fetchPackages() {
        return from(this.api.fetch('?get=config_packages')).pipe(
            map((packages: any) => 
            packages.map((package_name: any) => ({
            name: package_name,
            type: 'package',
            file: package_name,
            item: 'package'
            }))
        ),
        catchError(error => {
            console.error('Erreur lors de la récupération des packages:', error);
            return of([]); // Retourner un tableau vide en cas d'erreur
        })
        );
    }

// Méthode pour associer les classes aux packages
private associateClassesToPackages(packages: EqualComponentDescriptor[], classes: any): EqualComponentDescriptor[] {
    const updatedComponents: EqualComponentDescriptor[] = [];

    packages.forEach((packageDescriptor) => {
      updatedComponents.push(packageDescriptor);

      if (classes.hasOwnProperty(packageDescriptor.name)) {
        updatedComponents.push(...this.mapClassesToDescriptors(packageDescriptor, classes[packageDescriptor.name]));
      }
    });

    return updatedComponents;
  }

  // Méthode pour transformer les noms de classes en des objets descriptors
  private mapClassesToDescriptors(packageDescriptor: EqualComponentDescriptor, classNames: string[]): EqualComponentDescriptor[] {
    return classNames.map((class_name: string) => ({
      package_name: packageDescriptor.name,
      name: class_name,
      type: 'class',
      file: `${packageDescriptor.name}/classes/${class_name.replace(/\\/g, '/')}.class.php`,
      item: 'class'
    }));
  }

  // Méthode pour charger les composants
  loadComponents(): void {
    this.fetchPackages().pipe(
      switchMap((packages: EqualComponentDescriptor[]) => {
        return this.fetchClasses().pipe(
          map((classes: any) => this.associateClassesToPackages(packages, classes))
        );
      })
    ).subscribe({
      next: (components: EqualComponentDescriptor[]) => {
        // Mettre à jour le BehaviorSubject avec les composants récupérés
        this.equalComponentsSubject.next(components);
      },
      error: (error) => {
        console.error('Erreur lors du chargement des composants:', error);
      }
    });
  }
}



