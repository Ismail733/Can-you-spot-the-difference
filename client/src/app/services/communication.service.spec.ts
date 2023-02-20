import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Game } from '@app/interfaces/game.interface';
import { CommunicationService } from '@app/services/communication.service';

describe('CommunicationService', () => {
    let httpMock: HttpTestingController;
    let service: CommunicationService;
    let baseUrl: string;
    const game1: Game = { _id: '0', name: 'Game1', image1: '', image2: '', nbDifferences: 5, bestDuo: [], bestSolo: [] };
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
        });
        service = TestBed.inject(CommunicationService);
        httpMock = TestBed.inject(HttpTestingController);
        // eslint-disable-next-line dot-notation -- baseUrl is private and we need access for the test
        baseUrl = service['baseUrl'];
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should return all the games', () => {
        service.getAllGames().subscribe({
            next: (response) => {
                expect(response).toBeDefined();
            },
            error: fail,
        });

        const req = httpMock.expectOne(`${baseUrl}/game`);
        expect(req.request.method).toBe('GET');
        req.flush(game1);
    });

    it('should return the selected game', () => {
        service.getGame('0').subscribe({
            next: (response) => {
                expect(response).toBeDefined();
            },
            error: fail,
        });
        // eslint-disable-next-line no-underscore-dangle
        const req = httpMock.expectOne(`${baseUrl}/game/${game1._id}`);
        expect(req.request.method).toBe('GET');
        req.flush(game1);
    });

    it('deleteGame should handle an error', () => {
        const ID = '0';
        service.deleteGame(ID).subscribe({
            next: (response) => {
                expect(response).toBeUndefined();
            },
            error: fail,
        });
        const req = httpMock.expectOne(`${baseUrl}/game/${ID}`);
        expect(req.request.method).toBe('DELETE');
        req.error(new ProgressEvent('Error occurred'));
    });

    it('validateGame() should use the post method', () => {
        const formImage = new FormData();
        service.validateGame(formImage).subscribe({
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            next: () => {},
            error: fail,
        });
        const req = httpMock.expectOne(`${baseUrl}/game/validateGame`);
        expect(req.request.method).toBe('POST');
        req.flush(formImage);
    });

    it('validateGame() should handle http error safely', () => {
        const formImage = new FormData();
        service.validateGame(formImage).subscribe({
            next: (response) => {
                expect(response).toBeUndefined();
            },
            error: fail,
        });
        const req = httpMock.expectOne(`${baseUrl}/game/validateGame`);
        expect(req.request.method).toBe('POST');
        req.error(new ProgressEvent('Error'));
    });

    it('resetBestScore() should use the patch method', () => {
        service.resetBestScore(game1).subscribe({
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            next: () => {},
            error: fail,
        });
        const req = httpMock.expectOne(`${baseUrl}/game`);
        expect(req.request.method).toBe('PATCH');
        req.flush(game1);
    });

    it('resetBestScores should use the put method', () => {
        service.resetBestScores().subscribe({
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            next: () => {},
            error: fail,
        });
        const req = httpMock.expectOne(`${baseUrl}/game`);
        expect(req.request.method).toBe('PUT');
    });

    it('createGame() should use the post method', () => {
        const formImage = new FormData();
        service.createGame(formImage).subscribe({
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            next: () => {},
            error: fail,
        });
        const req = httpMock.expectOne(`${baseUrl}/game/createGame`);
        expect(req.request.method).toBe('POST');
        req.flush(formImage);
    });

    it('deleteAllGames() should use the delete method', () => {
        service.deleteAllGames().subscribe({
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            next: () => {},
            error: fail,
        });
        const req = httpMock.expectOne(`${baseUrl}/game/`);
        expect(req.request.method).toBe('DELETE');
    });

    it('deleteGame should handle an error', () => {
        service.deleteAllGames().subscribe({
            next: (response) => {
                expect(response).toBeUndefined();
            },
            error: fail,
        });
        const req = httpMock.expectOne(`${baseUrl}/game/`);
        expect(req.request.method).toBe('DELETE');
        req.error(new ProgressEvent('Error occurred'));
    });

    it('sendImage() should handle http error safely', () => {
        const file = new Blob();
        const name = 'name';
        service.sendImage(file, name).subscribe({
            next: (response) => {
                expect(response).toBeUndefined();
            },
            error: fail,
        });
        const req = httpMock.expectOne(`${baseUrl}/file/upload`);
        expect(req.request.method).toBe('POST');
        req.error(new ProgressEvent('Error'));
    });
});
