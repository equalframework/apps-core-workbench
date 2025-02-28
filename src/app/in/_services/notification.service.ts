import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  constructor(private snackBar: MatSnackBar) { }

    /**
     * Displays a success notification.
     * @param message - The message to display.
     * @param action - The action button text (default: 'Close').
     * @param duration - The duration in milliseconds (default: 3000).
     */
    showSuccess(message: string, action: string = 'Close', duration: number = 3000): void {
        this.showMessage(message, action, 'success', duration);
    }

    /**
     * Displays an error notification.
     * @param message - The message to display.
     * @param action - The action button text (default: 'Close').
     * @param duration - The duration in milliseconds (default: 5000).
     */
    showError(message: string, action: string = 'Close', duration: number = 5000): void {
        this.showMessage(message, action, 'error', duration);
    }

    /**
     * Displays an info notification.
     * @param message - The message to display.
     * @param action - The action button text (default: 'Close').
     * @param duration - The duration in milliseconds (default: 3000).
     */
    showInfo(message: string, action: string = 'Close', duration: number = 3000): void {
        this.showMessage(message, action, 'info', duration);
    }

    /**
     * Displays a notification with the specified type.
     * @param message - The message to display.
     * @param action - The action button text.
     * @param type - The type of the notification ('success', 'error', 'info').
     * @param duration - The duration in milliseconds.
     */
    private showMessage(message: string, action: string, type: string, duration: number): void {
        let panelClass = '';
        switch (type) {
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
