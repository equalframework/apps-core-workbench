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

  it('should show success notification', () => {
    spyOn(service, 'showSuccess');
    service.showSuccess('Success message');
    expect(service.showSuccess).toHaveBeenCalledWith('Success message');
  });

  it('should show error notification', () => {
    spyOn(service, 'showError');
    service.showError('Error message');
    expect(service.showError).toHaveBeenCalledWith('Error message');
  });

  it('should show info notification', () => {
    spyOn(service, 'showInfo');
    service.showInfo('Info message', 'Close', 3000);
    expect(service.showInfo).toHaveBeenCalledWith('Info message', 'Close', 3000);
  });

  
});
