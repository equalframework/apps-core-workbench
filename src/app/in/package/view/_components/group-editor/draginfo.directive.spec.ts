import { DragInfoDirective } from './draginfo.directive';

describe('DragInfoDirective', () => {
  it('should create an instance', () => {
    const directive = new DragInfoDirective();
    expect(directive).toBeTruthy();
  });

  it('should emit appDragInfo event on stopDrag', () => {
    const directive = new DragInfoDirective();
    spyOn(directive.appDragInfo, 'emit');
    directive.StopDrag();
    expect(directive.appDragInfo.emit).toHaveBeenCalled();
  });
});
