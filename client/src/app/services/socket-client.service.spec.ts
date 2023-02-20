import { TestBed } from '@angular/core/testing';
import { io } from 'socket.io-client';
import { environment } from 'src/environments/environment';
import { SocketClientService } from './socket-client.service';

describe('SocketClientService', () => {
    let service: SocketClientService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(SocketClientService);
        service.socket = io(environment.serverUrlSocket, { transports: ['websocket'], upgrade: false });
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should disconnect', () => {
        const spy = spyOn(service.socket, 'disconnect');
        service.disconnect();
        expect(spy).toHaveBeenCalled();
    });

    it('isSocketAlive should return true if the socket is connected', () => {
        service.socket.connected = true;
        const aliveSocket = service.isSocketAlive();
        expect(aliveSocket).toBeTruthy();
    });

    it('should call emit from the service when no data is given', () => {
        const event = 'test';
        const data = undefined;
        const spy = spyOn(service.socket, 'emit');
        service.send(event, data);
        expect(spy).toHaveBeenCalled();
        expect(spy).toHaveBeenCalledWith(event);
    });
});
