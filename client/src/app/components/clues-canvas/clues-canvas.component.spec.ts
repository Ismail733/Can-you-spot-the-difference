import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { CluesCanvasComponent } from './clues-canvas.component';

describe('IndicesCanvasComponent', () => {
    let component: CluesCanvasComponent;
    let fixture: ComponentFixture<CluesCanvasComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [CluesCanvasComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(CluesCanvasComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
    it('isModeSolo should return true', () => {
        expect(component['isModeSolo']('hello-solo')).toBeTruthy();
    });
    it('isModeSolo should return false', () => {
        expect(component['isModeSolo']('hello')).toBeFalsy();
    });
    it('onMouseClick should call isModeSolo', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const spySolo = spyOn<any>(component, 'isModeSolo').and.returnValue(of(true));
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const spyAsk = spyOn<any>(component.roomService, 'askClueFromServer');
        component['onMouseClick']();
        expect(spySolo).toHaveBeenCalled();
        expect(spyAsk).toHaveBeenCalled();
    });
    it('onKeyPress should call onMouseClick', () => {
        const event: KeyboardEvent = new KeyboardEvent('keyup', { key: 'i' });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const spy = spyOn<any>(component, 'onMouseClick').and.returnValue(of(true));
        component.onKeyPress(event);
        expect(spy).toHaveBeenCalled();
    });
});
