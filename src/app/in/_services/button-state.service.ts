import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ButtonStateService {
  private buttonsStateSubject = new BehaviorSubject<{ save: boolean, cancel: boolean }>({
    save: false,
    cancel: false
  });

  buttonsState$ = this.buttonsStateSubject.asObservable();

  disableButtons(): void {
    this.buttonsStateSubject.next({ save: true, cancel: true });
  }

  enableButtons(): void {
    this.buttonsStateSubject.next({ save: false, cancel: false });
  }
}
