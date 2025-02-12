import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Inject } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  constructor(private snackBar: MatSnackBar) { }

  // Méthode pour afficher une notification de succès
  showSuccess(message: string, action: string = 'Close', duration: number = 3000): void {
    this.showMessage(message, action, 'success', duration);
  }

  // Méthode pour afficher une notification d'erreur
  showError(message: string, action: string = 'Close', duration: number = 3000): void {
    this.showMessage(message, action, 'error', duration);
  }

  // Méthode pour afficher une notification d'information
  showInfo(message: string, action: string = 'Close', duration: number = 3000): void {
    this.showMessage(message, action, 'info', duration);
  }

  // Méthode générique pour afficher une notification
  private showMessage(message: string, action: string, type: string, duration: number): void {
    let panelClass = '';
    switch(type) {
      case 'success':
        panelClass = 'snackbar-success';
        break;
      case 'error':
        panelClass = 'snackbar-error';
        break;
      case 'info':
        panelClass = 'snackbar-info';
        break;
      default:
        panelClass = '';
        break;
    }

    this.snackBar.open(message, action, {
      duration: duration,
      panelClass: [panelClass]
    });
  }
}
