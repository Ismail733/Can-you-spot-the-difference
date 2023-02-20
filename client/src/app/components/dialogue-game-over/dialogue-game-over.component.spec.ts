import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DEFEAT, DRAW, MSG_DEFEAT, MSG_DRAW, MSG_VICTORY, VICTORY } from '@common/constants';
import { DialogueGameOverComponent } from './dialogue-game-over.component';

describe('DialogueGameOverComponent', () => {
    let component: DialogueGameOverComponent;
    let fixture: ComponentFixture<DialogueGameOverComponent>;

    it('should create', async () => {
        await TestBed.configureTestingModule({
            declarations: [DialogueGameOverComponent],
            imports: [MatDialogModule],
            providers: [
                { provide: MAT_DIALOG_DATA, useValue: {} },
                { provide: MatDialogRef, useValue: {} },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(DialogueGameOverComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        expect(component).toBeTruthy();
    });
    it('should send a victory message if the player won', async () => {
        await TestBed.configureTestingModule({
            declarations: [DialogueGameOverComponent],
            imports: [MatDialogModule],
            providers: [
                { provide: MAT_DIALOG_DATA, useValue: { result: VICTORY, username: 'test' } },
                { provide: MatDialogRef, useValue: {} },
            ],
        }).compileComponents();
        fixture = TestBed.createComponent(DialogueGameOverComponent);
        component = fixture.componentInstance;
        expect(component.data.result).toBe(VICTORY);
        expect(component.message).toBe(MSG_VICTORY);
    });
    it('should send a draw message if the players have the same score', async () => {
        await TestBed.configureTestingModule({
            declarations: [DialogueGameOverComponent],
            imports: [MatDialogModule],
            providers: [
                { provide: MAT_DIALOG_DATA, useValue: { result: DRAW, username: 'test' } },
                { provide: MatDialogRef, useValue: {} },
            ],
        }).compileComponents();
        fixture = TestBed.createComponent(DialogueGameOverComponent);
        component = fixture.componentInstance;
        expect(component.data.result).toBe(DRAW);
        expect(component.message).toBe(MSG_DRAW);
    });
    it('should send a defeat message if the player lost', async () => {
        await TestBed.configureTestingModule({
            declarations: [DialogueGameOverComponent],
            imports: [MatDialogModule],
            providers: [
                { provide: MAT_DIALOG_DATA, useValue: { result: DEFEAT, username: 'test' } },
                { provide: MatDialogRef, useValue: {} },
            ],
        }).compileComponents();
        fixture = TestBed.createComponent(DialogueGameOverComponent);
        component = fixture.componentInstance;
        expect(component.data.result).toBe(DEFEAT);
        expect(component.message).toBe(MSG_DEFEAT);
    });
});
