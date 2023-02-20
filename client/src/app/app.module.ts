import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { GameCardComponent } from '@app/components/gamecard/gamecard.component';
import { AppRoutingModule } from '@app/modules/app-routing.module';
import { AppMaterialModule } from '@app/modules/material.module';
import { AppComponent } from '@app/pages/app/app.component';
import { GamePageComponent } from '@app/pages/game-page/game-page.component';
import { MainPageComponent } from '@app/pages/main-page/main-page.component';
import { SelectionPageComponent } from '@app/pages/selection-page/selection-page.component';
import { ChatBoxComponent } from './components/chat-box/chat-box.component';
import { CluesCanvasComponent } from './components/clues-canvas/clues-canvas.component';
import { DialogueGameOverComponent } from './components/dialogue-game-over/dialogue-game-over.component';
import { DialogueValidationComponent } from './components/drawing-area/dialogue-validation/dialogue-validation.component';
import { DrawingAreaComponent } from './components/drawing-area/drawing-area.component';
import { FooterComponent } from './components/footer/footer.component';
import { GameListComponent } from './components/gamelist/gamelist.component';
import { HeaderGamePageComponent } from './components/header-game-page/header-game-page.component';
import { HeaderComponent } from './components/header/header.component';
import { ImageCanvasGameComponent } from './components/image-canvas-game/image-canvas-game.component';
import { ImageCanvasComponent } from './components/image-canvas/image-canvas.component';
import { InfosGameComponent } from './components/infos-game/infos-game.component';
import { InfosUserPopUpComponent } from './components/infos-user-pop-up/infos-user-pop-up.component';
import { LimitedTimeSelectionComponent } from './components/limited-time-selection/limited-time-selection.component';
import { PlayAreaComponent } from './components/play-area/play-area.component';
import { AdminPageComponent } from './pages/admin-page/admin-page.component';
import { CreateGamePageComponent } from './pages/create-game-page/create-game-page.component';

/**
 * Main module that is used in main.ts.
 * All automatically generated components will appear in this module.
 * Please do not move this module in the module folder.
 * Otherwise Angular Cli will not know in which module to put new component
 */
@NgModule({
    declarations: [
        AppComponent,
        GamePageComponent,
        MainPageComponent,
        SelectionPageComponent,
        GameCardComponent,
        HeaderComponent,
        FooterComponent,
        GameListComponent,
        AdminPageComponent,
        GameCardComponent,
        CreateGamePageComponent,
        ImageCanvasComponent,
        DrawingAreaComponent,
        HeaderGamePageComponent,
        InfosGameComponent,
        DialogueValidationComponent,
        ImageCanvasGameComponent,
        DialogueGameOverComponent,
        InfosUserPopUpComponent,
        ChatBoxComponent,
        PlayAreaComponent,
        CluesCanvasComponent,
        LimitedTimeSelectionComponent,
    ],
    imports: [AppMaterialModule, AppRoutingModule, BrowserAnimationsModule, BrowserModule, FormsModule, HttpClientModule, ReactiveFormsModule],
    providers: [
        { provide: MAT_DIALOG_DATA, useValue: {} },
        { provide: MatDialogRef, useValue: {} },
    ],
    bootstrap: [AppComponent],
})
export class AppModule {}
