/* eslint-disable @typescript-eslint/no-explicit-any */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ChatBoxComponent } from './chat-box.component';
import { ChatMessage } from '@common/chat-message';

describe('ChatBoxComponent', () => {
    let component: ChatBoxComponent;
    let fixture: ComponentFixture<ChatBoxComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [ChatBoxComponent],
            imports: [FormsModule, ReactiveFormsModule],
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            providers: [FormBuilder, { provide: MatSnackBar, useValue: { open: () => {} } }],
        }).compileComponents();
    });
    beforeEach(() => {
        fixture = TestBed.createComponent(ChatBoxComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });
    it('should create', () => {
        expect(component).toBeTruthy();
    });
    it('should initialize the form group', () => {
        expect(component.frmMessage instanceof FormGroup).toBe(true);
    });
    it('should initialize the messages array', () => {
        expect(component.messages).toEqual([]);
    });
    it('should connect to the server on init', () => {
        const spy = spyOn<any>(component['socketClientService'], 'connect');
        component.ngOnInit();
        expect(spy).toHaveBeenCalled();
    });
    it('should send a message to the server', () => {
        component.frmMessage.get('message')?.setValue('Hello, world!');
        const spy = spyOn<any>(component['socketClientService'], 'send');
        component.sendMessageToServer();

        expect(spy).toHaveBeenCalledWith('chatMessage', {
            username: component.roomService.game.player1.username,
            roomID: component.roomService.roomID,
            text: 'Hello, world!',
        });
    });
    it('should not send an empty message to the server', () => {
        const spy = spyOn<any>(component['socketClientService'], 'send');
        component.sendMessageToServer();
        expect(spy).not.toHaveBeenCalled();
    });
    it('should not send an empty message to the server', () => {
        component.frmMessage = new FormBuilder().group({
            other: undefined,
        });
        const spy = spyOn<any>(component['socketClientService'], 'send');
        component.sendMessageToServer();
        expect(spy).not.toHaveBeenCalled();
    });
    it('should not send an empty message to the server', () => {
        component.frmMessage.get('message')?.setValue('Hello, world!');
        const spy = spyOn<any>(component['socketClientService'], 'send').and.callFake(() => {
            component.frmMessage = new FormBuilder().group({
                other: undefined,
            });
        });
        component.sendMessageToServer();
        expect(spy).toHaveBeenCalled();
    });
    it('should add a chat message to the messages array', () => {
        const chatMessage: ChatMessage = {
            username: 'testuser',
            roomID: 'testroom',
            text: 'This is a test message',
            time: new Date(),
        };
        component.messages = [];
        spyOn(component['socketClientService'], 'on').and.callFake(<ChatMessage>(event: string, action: (data: ChatMessage) => void) => {
            action(chatMessage as unknown as ChatMessage);
        });
        component['initChatSocket']();
        expect(component.messages).toEqual([chatMessage]);
    });
    it('should open a snack bar when receiving a "best score" message', () => {
        const spy = spyOn<any>(component, 'openSnackBar');
        component.roomService.game.player1.username = 'mathieu';
        const chatMessage: ChatMessage = {
            username: component.roomService.game.player1.username,
            roomID: component.roomService.roomID,
            text: component.roomService.game.player1.username + ' obtient un nouveau meilleur score',
            time: new Date(),
        };
        spyOn(component['socketClientService'], 'on').and.callFake(<ChatMessage>(event: string, action: (data: ChatMessage) => void) => {
            action(chatMessage as unknown as ChatMessage);
            return '0';
        });
        component['initChatSocket']();
        expect(spy).toHaveBeenCalledWith("Vous venez d'enregistrer un meilleur score!!", 'OK');
    });
    it('should not open a snack bar for non-"best score" messages', () => {
        const spy = spyOn(component['snackBar'], 'open');
        component['initChatSocket']();
        const chatMessage: ChatMessage = {
            username: 'testuser',
            roomID: 'testroom',
            text: 'This is a test message',
            time: new Date(),
        };
        spyOn(component['socketClientService'], 'on').and.callFake(<ChatMessage>(event: string, action: (data: ChatMessage) => void) => {
            action(chatMessage as unknown as ChatMessage);
            return '0';
        });
        expect(spy).not.toHaveBeenCalled();
    });
    it('should open a snackbar with the specified message and action', () => {
        const spy = spyOn(component['snackBar'], 'open');
        component['openSnackBar']('message', 'action');
        expect(spy).toHaveBeenCalledWith('message', 'action', { duration: 4000 });
    });
});
