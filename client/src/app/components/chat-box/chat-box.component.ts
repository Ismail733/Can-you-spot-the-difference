import { AfterViewChecked, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RoomService } from '@app/services/room-service';
import { SocketClientService } from '@app/services/socket-client.service';
import { ChatMessage } from '@common/chat-message';

@Component({
    selector: 'app-chat-box',
    templateUrl: './chat-box.component.html',
    styleUrls: ['./chat-box.component.scss'],
})
export class ChatBoxComponent implements OnInit, AfterViewChecked {
    @ViewChild('messageContainer') private messagesDiv: ElementRef;
    frmMessage: FormGroup;
    messages: ChatMessage[];
    // eslint-disable-next-line max-params
    constructor(
        private fb: FormBuilder,
        private socketClientService: SocketClientService,
        public roomService: RoomService,
        private snackBar: MatSnackBar,
    ) {}
    ngOnInit() {
        this.connectWithServer();
        this.frmMessage = this.fb.group({
            message: new FormControl(null),
        });
        this.messages = [];
        this.initChatSocket();
    }
    ngAfterViewChecked() {
        this.messagesDiv.nativeElement.scrollTop = this.messagesDiv.nativeElement.scrollHeight;
    }
    sendMessageToServer() {
        const message = this.frmMessage.get('message')?.value;
        if (message) {
            this.socketClientService.send('chatMessage', {
                username: this.roomService.game.player1.username,
                roomID: this.roomService.roomID,
                text: message,
            } as ChatMessage);
            this.frmMessage.get('message')?.setValue('');
        }
    }
    private connectWithServer() {
        this.socketClientService.connect();
    }
    private initChatSocket() {
        this.socketClientService.on('chatMessageResponse', (data: ChatMessage) => {
            this.messages.push(data);
            if (data.text.split(' ')[0] === this.roomService.game.player1.username && data.text.split(' ')[1] === 'obtient') {
                this.openSnackBar("Vous venez d'enregistrer un meilleur score!!", 'OK');
            }
        });
    }
    private openSnackBar(message: string, action: string) {
        this.snackBar.open(message, action, { duration: 4000 });
    }
}
