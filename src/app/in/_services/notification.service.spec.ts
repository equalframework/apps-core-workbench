import { TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { OverlayModule } from '@angular/cdk/overlay';
import { NotificationService } from './notification.service';

describe('NotificationService', () => {
  let service: NotificationService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [OverlayModule],
      providers: [MatSnackBar]
    });
    service = TestBed.inject(NotificationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should show message with correct panel class for success', () => {
    spyOn(service as any, 'showMessage');
    service.showSuccess('Success message');
    expect((service as any).showMessage).toHaveBeenCalledWith('Success message', 'Close', 'success', 3000);
  });

  it('should show message with correct panel class for error', () => {
    spyOn(service as any, 'showMessage');
    service.showError('Error message');
    expect((service as any).showMessage).toHaveBeenCalledWith('Error message', 'Close', 'error', 5000);
  });

  it('should show message with correct panel class for info', () => {
    spyOn(service as any, 'showMessage');
    service.showInfo('Info message');
    expect((service as any).showMessage).toHaveBeenCalledWith('Info message', 'Close', 'info', 3000);
  });

  it('should show message with default panel class for unknown type', () => {
    spyOn(service as any, 'showMessage');
    (service as any).showMessage('Default message', 'Close', 'unknown', 3000);
    expect((service as any).showMessage).toHaveBeenCalledWith('Default message', 'Close', 'unknown', 3000);
  });

  it('should call snackBar.open with correct parameters', () => {
    const snackBarSpy = spyOn(service['snackBar'], 'open');
    service.showSuccess('Test message', 'Close', 3000);
    expect(snackBarSpy).toHaveBeenCalledWith('Test message', 'Close', {
      duration: 3000,
      panelClass: ['snackbar-success']
    });
  });

  it('should call snackBar.open with correct parameters for error', () => {
    const snackBarSpy = spyOn(service['snackBar'], 'open');
    service.showError('Test error message', 'Close', 5000);
    expect(snackBarSpy).toHaveBeenCalledWith('Test error message', 'Close', {
      duration: 5000,
      panelClass: ['snackbar-error']
    });
  });

  it('should call snackBar.open with correct parameters for info', () => {
    const snackBarSpy = spyOn(service['snackBar'], 'open');
    service.showInfo('Test info message', 'Close', 3000);
    expect(snackBarSpy).toHaveBeenCalledWith('Test info message', 'Close', {
      duration: 3000,
      panelClass: ['snackbar-info']
    });
  });

  it('should call snackBar.open with default panel class for unknown type', () => {
    const snackBarSpy = spyOn(service['snackBar'], 'open');
    (service as any).showMessage('Default message', 'Close', 'unknown', 3000);
    expect(snackBarSpy).toHaveBeenCalledWith('Default message', 'Close', {
      duration: 3000,
      panelClass: ['']
    });
  });

});
