import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { RouterTestingModule } from '@angular/router/testing';
import { FooterComponent } from '@app/components/footer/footer.component';
import { MainPageComponent } from '@app/pages/main-page/main-page.component';

describe('MainPageComponent', () => {
    let component: MainPageComponent;
    let fixture: ComponentFixture<MainPageComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [RouterTestingModule, HttpClientModule, MatDialogModule],
            declarations: [MainPageComponent, FooterComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(MainPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it("should have as title 'Jeu des Différences'", () => {
        expect(component.title).toEqual('Jeu des Différences');
    });

    it('openLimitedTimeSelection() should open a dialog', () => {
        const openDialogSpy = spyOn(component.dialog, 'open');
        component.openLimitedTimeSelection();
        expect(openDialogSpy).toHaveBeenCalled();
    });
});
