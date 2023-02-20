import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class SocketClientService {
    socket: Socket;
    isConnected: boolean = false;

    isSocketAlive() {
        return this.socket && this.socket.connected;
    }

    connect() {
        if (!this.isConnected) {
            this.socket = io(environment.serverUrlSocket, { transports: ['websocket'], upgrade: false });
            this.isConnected = true;
        } else {
            return;
        }
    }

    disconnect() {
        this.socket.disconnect();
    }

    on<T>(event: string, action: (data: T) => void): void {
        this.socket.on(event, action);
    }

    send<T>(event: string, data?: T): void {
        if (data) {
            this.socket.emit(event, data);
        } else {
            this.socket.emit(event);
        }
    }
}
