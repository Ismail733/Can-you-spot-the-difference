import { Component, NgZone, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { DialogueValidationComponent } from '@app/components/drawing-area/dialogue-validation/dialogue-validation.component';
import { ImageCanvasComponent } from '@app/components/image-canvas/image-canvas.component';
import { CommunicationService } from '@app/services/communication.service';
import { COLORS, DEFAULT_RADIUS, MAX_DIFFERENCE, SIZES } from '@common/constants';
@Component({
    selector: 'app-drawing-area',
    templateUrl: './drawing-area.component.html',
    styleUrls: ['./drawing-area.component.scss'],
})
export class DrawingAreaComponent {
    @ViewChild('1') canvas1: ImageCanvasComponent;
    @ViewChild('2') canvas2: ImageCanvasComponent;
    idCanvas: string = '1';
    idCanvas2: string = '2';
    hasImage1 = false;
    hasImage2 = false;

    readonly sizes: number[] = SIZES;
    readonly colors: string[] = COLORS;
    name = '';
    radius = DEFAULT_RADIUS;
    toolSelected: string = 'brush';
    sizeSelected: number = this.sizes[1];
    colorSelected: string = this.colors[0];
    formData: FormData;
    // eslint-disable-next-line max-params
    constructor(
        private readonly communicationService: CommunicationService,
        public dialog: MatDialog,
        private snackBar: MatSnackBar,
        private router: Router,
        private ngZone: NgZone,
    ) {}

    setSize(size: number): void {
        this.sizeSelected = size;
    }
    setColor(color: string): void {
        this.colorSelected = color;
    }

    removeBackground(canvas1: boolean, canvas2: boolean) {
        if (canvas1) {
            this.canvas1.removeBackground();
            this.hasImage1 = false;
        }
        if (canvas2) {
            this.canvas2.removeBackground();
            this.hasImage2 = false;
        }
    }
    setImage1(event: Event): void {
        this.canvas1.importImage(event);
        this.hasImage1 = true;
    }
    setImage2(event: Event): void {
        this.canvas2.importImage(event);
        this.hasImage2 = true;
    }
    setImageAll(event: Event): void {
        this.canvas1.importImage(event);
        this.canvas2.importImage(event);
        this.hasImage1 = true;
        this.hasImage2 = true;
    }
    setTool(tool: string): void {
        this.toolSelected = tool;
    }
    setRadius(radius: number): void {
        this.radius = radius;
    }
    validateGame() {
        this.canvas1.joinCanvas().then((image1: Blob) => {
            this.canvas2.joinCanvas().then((image2: Blob) => {
                this.formData = new FormData();
                this.formData.append('image1', image1);
                this.formData.append('image2', image2);
                this.formData.append('radius', this.radius.toString());
                this.formData.append('name', Math.floor(Math.random() * Date.now()).toString());
                this.communicationService.validateGame(this.formData).subscribe((resultat) => {
                    if (parseInt(resultat.nbDifferences, 10) < MAX_DIFFERENCE && parseInt(resultat.nbDifferences, 10) > 2) {
                        this.openDialog(resultat.name, parseInt(resultat.nbDifferences, 10), resultat.image);
                    } else {
                        this.openSnackBar('Le nombre de différences est incorrect', 'Fermer');
                    }
                });
            });
        });
    }

    createGame(): void {
        this.canvas1.joinCanvas().then((image1: Blob) => {
            this.canvas2.joinCanvas().then((image2: Blob) => {
                this.formData = new FormData();
                this.formData.append('image1', image1);
                this.formData.append('image2', image2);
                this.formData.append('name', this.name);
                this.formData.append('radius', this.radius.toString());
                this.communicationService.createGame(this.formData).subscribe(() => {
                    this.openSnackBar('Jeu créé avec succès', 'Fermer');
                    this.ngZone.run(async () => this.router.navigateByUrl('/admin'));
                });
            });
        });
    }
    openDialog(imageSource: string, nbDifferences: number, image: Blob): void {
        const dialogRef = this.dialog.open(DialogueValidationComponent, {
            data: { imageSource, nbDifferences, name: this.name, image },
        });
        dialogRef.afterClosed().subscribe((result) => {
            this.name = result.name;
            if (result.valider) {
                this.createGame();
            }
        });
    }
    openSnackBar(message: string, action: string): void {
        this.snackBar.open(message, action, { duration: 3000 });
    }
}
