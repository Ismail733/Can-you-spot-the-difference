import { NO_ERRORS_SCHEMA, SimpleChange } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InfosGameComponent } from '@app/components/infos-game/infos-game.component';
import { HeaderGamePageComponent } from './header-game-page.component';

describe('HeaderGamePageComponent', () => {
    let component: HeaderGamePageComponent;
    let fixture: ComponentFixture<HeaderGamePageComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [HeaderGamePageComponent, InfosGameComponent],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();
        fixture = TestBed.createComponent(HeaderGamePageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should change gameName', () => {
        component.gameName = 'nouveau';
        component.ngOnChanges({
            gameName: new SimpleChange(null, component.gameName, false),
        });
        fixture.detectChanges();
        expect(component.name).toBe(component.gameName);
    });
});
