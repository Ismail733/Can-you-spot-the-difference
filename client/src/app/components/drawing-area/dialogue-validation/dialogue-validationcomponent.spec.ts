import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { DialogueValidationComponent } from './dialogue-validation.component';

describe('DialogueValidationComponent', () => {
    let component: DialogueValidationComponent;
    let fixture: ComponentFixture<DialogueValidationComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [DialogueValidationComponent],
            imports: [MatDialogModule, MatFormFieldModule, MatInputModule, BrowserAnimationsModule, FormsModule],
            providers: [
                { provide: MAT_DIALOG_DATA, useValue: {} },
                { provide: MatDialogRef, useValue: {} },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(DialogueValidationComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
