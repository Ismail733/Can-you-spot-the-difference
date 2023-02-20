import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Game } from '@app/interfaces/game.interface';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class CommunicationService {
    private readonly baseUrl: string = environment.serverUrl;

    constructor(private readonly http: HttpClient) {}

    sendImage(file: Blob, name: string): Observable<string> {
        const formImage = new FormData();
        formImage.append('file', file);
        formImage.append('name', name);
        return this.http.post<string>(`${this.baseUrl}/file/upload`, formImage).pipe(catchError(this.handleError<string>('sendImage')));
    }
    validateGame(formData: FormData): Observable<{ name: string; nbDifferences: string; image: Blob }> {
        return this.http
            .post<{ name: string; nbDifferences: string; image: Blob }>(`${this.baseUrl}/game/validateGame`, formData)
            .pipe(catchError(this.handleError<{ name: string; nbDifferences: string; image: Blob }>('validateGame')));
    }
    createGame(formData: FormData): Observable<string> {
        return this.http.post<string>(`${this.baseUrl}/game/createGame`, formData).pipe(catchError(this.handleError<string>('createGame')));
    }
    getAllGames(): Observable<Game[]> {
        return this.http.get<Game[]>(`${this.baseUrl}/game`).pipe(catchError(this.handleError<Game[]>('getAllGames')));
    }
    resetBestScore(game: Game) {
        return this.http.patch(`${this.baseUrl}/game`, game).pipe(catchError(this.handleError('updateGame')));
    }
    resetBestScores() {
        return this.http.put(`${this.baseUrl}/game`, []).pipe(catchError(this.handleError('updateGame')));
    }
    getGame(id: string): Observable<Game> {
        return this.http.get<Game>(`${this.baseUrl}/game/` + id).pipe(catchError(this.handleError<Game>('getGame')));
    }
    deleteGame(id: string) {
        return this.http.delete(`${this.baseUrl}/game/` + id).pipe(catchError(this.handleError('deleteGame')));
    }
    deleteAllGames() {
        return this.http.delete(`${this.baseUrl}/game/`).pipe(catchError(this.handleError('deleteGame')));
    }
    private handleError<T>(request: string, result?: T): (error: Error) => Observable<T> {
        return () => of(result as T);
    }
}
