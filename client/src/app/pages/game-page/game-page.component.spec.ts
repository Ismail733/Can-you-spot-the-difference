import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { HeaderGamePageComponent } from '@app/components/header-game-page/header-game-page.component';
import { ImageCanvasGameComponent } from '@app/components/image-canvas-game/image-canvas-game.component';
import { Game } from '@app/interfaces/game.interface';
import { CommunicationService } from '@app/services/communication.service';
import { of } from 'rxjs';
import { GamePageComponent } from './game-page.component';
import SpyObj = jasmine.SpyObj;

describe('GamePageComponent', () => {
    let component: GamePageComponent;
    let fixture: ComponentFixture<GamePageComponent>;
    let routerSpy: SpyObj<Router>;
    const game1: Game = { _id: '0', name: 'Game1', image1: '', image2: '', nbDifferences: 5, bestDuo: [], bestSolo: [] };

    beforeEach(async () => {
        routerSpy = jasmine.createSpyObj('Router', ['']);
        await TestBed.configureTestingModule({
            declarations: [GamePageComponent, ImageCanvasGameComponent, HeaderGamePageComponent],
            imports: [HttpClientTestingModule, MatDialogModule],
            providers: [
                { provide: Router, useValue: routerSpy },
                {
                    provide: ActivatedRoute,
                    useValue: {
                        snapshot: {
                            paramMap: {
                                get: () => '1',
                            },
                        },
                    },
                },
            ],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(GamePageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('getInfosGame() should set the data', async () => {
        const service = TestBed.inject(CommunicationService);
        spyOn(service, 'getGame').and.callFake(() => {
            return of(game1);
        });
        await component['getInfosGame']();
        expect(service.getGame).toHaveBeenCalled();
        expect(component.game).toEqual(game1);
        expect(component.gameName).toEqual(game1.name);
    });

    it('quitGame() should call quitGame from roomService', async () => {
        const spyQuitGame = spyOn(component['roomService'], 'quitGame');
        component.quitGame();
        expect(spyQuitGame).toHaveBeenCalled();
    });

    it('should initialize temps-limite', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        spyOn<any>(component, 'getGameID');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const limitedSpy = spyOn<any>(component, 'initializeLimitedTime');
        component.routeID = 'temps-limite';
        component.ngOnInit();
        fixture.detectChanges();
        fixture.whenStable().then(() => {
            expect(limitedSpy).toHaveBeenCalled();
        });
        expect(limitedSpy).toHaveBeenCalled();
    });
    it('should initialize temps-limite', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        spyOn<any>(component, 'getGameID');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const limitedSpy = spyOn<any>(component, 'initializeLimitedTime');
        component.routeID = 'temps-limite';
        component.ngOnInit();
        expect(limitedSpy).toHaveBeenCalled();
    });
    it('initializeLimitedTime will call the service', () => {
        const spy = spyOn(component['communicationService'], 'getAllGames').and.returnValue(of([game1]));
        component['initializeLimitedTime']();
        expect(spy).toHaveBeenCalled();
        // eslint-disable-next-line no-underscore-dangle
        expect(component.gameIDs).toContain(game1._id);
    });
});
