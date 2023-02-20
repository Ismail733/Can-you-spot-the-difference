import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { GameCardComponent } from '@app/components/gamecard/gamecard.component';
import { Game } from '@app/interfaces/game.interface';
import { CommunicationService } from '@app/services/communication.service';
import { MAX_NB_IMGS } from '@common/constants';
import { of } from 'rxjs';
import { GameListComponent } from './gamelist.component';
import SpyObj = jasmine.SpyObj;

describe('GameListComponent', () => {
    let component: GameListComponent;
    let fixture: ComponentFixture<GameListComponent>;
    let communicationServiceSpy: SpyObj<CommunicationService>;
    const mockMatSnackBar = {
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        open: () => {},
    };
    beforeEach(async () => {
        communicationServiceSpy = jasmine.createSpyObj('CommunicationService', ['getAllGames', 'deleteGame']);
        communicationServiceSpy.getAllGames.and.returnValue(of([]));
        communicationServiceSpy.deleteGame.and.returnValue(of([]));
        await TestBed.configureTestingModule({
            declarations: [GameListComponent, GameCardComponent],
            imports: [HttpClientTestingModule, MatIconModule],
            providers: [
                { provide: MatSnackBar, useValue: mockMatSnackBar },
                { provide: CommunicationService, useValue: communicationServiceSpy },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(GameListComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        const game1: Game = { _id: '0', name: 'Game1', image1: '', image2: '', nbDifferences: 5, bestDuo: [], bestSolo: [] };
        const gamesTest: Game[] = [game1, game1, game1, game1, game1, game1, game1, game1];
        component.games = gamesTest;
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        component.currentIndexes = [7, 8, 9, 10];
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('isIndexInArray() should return false if the index is not in the array', () => {
        expect(component.isIndexInArray(1)).toBeFalsy();
    });

    it('isIndexInArray() should return true if the index is in the array', () => {
        expect(component.isIndexInArray(component.currentIndexes[0])).toBeTrue();
    });

    it('the length of the index array is the number of pictures shown', () => {
        component.initializeIndexes();
        expect(component.currentIndexes.length).toEqual(MAX_NB_IMGS);
    });

    it('prevGames() should change the indexes of the images shown', () => {
        component.prevGames();
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        expect(component.currentIndexes).toEqual([3, 4, 5, 6]);
    });

    it('when already showing the first images, prevGames() should show the same images', () => {
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        const indexesShown = [0, 1, 2, 3];
        component.currentIndexes = indexesShown;
        component.prevGames();
        expect(component.currentIndexes).toEqual(indexesShown);
    });

    it('when the there are less than 4 images to show next, nextGames() should show the last 4', () => {
        const spy = spyOn(component, 'lastIndexes').and.callThrough();
        component.nextGames();
        component.nextGames();
        expect(spy).toHaveBeenCalled();
    });

    it('nextGames() should show change the indexes of the images shown', () => {
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        const indexesShown = [0, 1, 2, 3];
        component.currentIndexes = indexesShown;
        component.nextGames();
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        expect(component.currentIndexes).toEqual([4, 5, 6, 7]);
    });

    it('decreaseIndexes() should call updateIndexes()', () => {
        const spy = spyOn(component, 'updateIndexes').and.callThrough();
        component.decreaseIndexes();
        expect(spy).toHaveBeenCalled();
    });

    it('increaseIndexes() should call updateIndexes()', () => {
        const spy = spyOn(component, 'updateIndexes').and.callThrough();
        component.increaseIndexes();
        expect(spy).toHaveBeenCalled();
    });

    it('updateIndexes() should change the indexes shown', () => {
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        expect(component.currentIndexes).toEqual([7, 8, 9, 10]);
        component.updateIndexes((x: number, y: number) => {
            return x * y;
        });
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        expect(component.currentIndexes).not.toEqual([7, 8, 9, 10]);
    });

    it('deleteGame() should send a confirmation when a game was deleted', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const spy = spyOn<any>(component, 'openSnackBar');
        const ID = '0';
        component.deleteGame(ID);
        expect(spy).toHaveBeenCalled();
    });
    it('deleteGame() should send a confirmation when a game was deleted', () => {
        communicationServiceSpy.deleteGame.and.throwError('error');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const spy = spyOn<any>(component, 'openSnackBar');
        const ID = '0';
        try {
            component.deleteGame(ID);
        } catch {
            expect(spy).toHaveBeenCalled();
        }
        expect(spy).toHaveBeenCalled();
    });
    it('openSnackBar() should open a snackbar', () => {
        // eslint-disable-next-line
        const spyOpen = spyOn(component['snackBar'], 'open');
        const ID = '0';
        component.deleteGame(ID);
        expect(spyOpen).toHaveBeenCalled();
    });
});
