import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { environment } from 'src/environments/environment';

@Component({
    selector: 'app-dialogue-validation',
    templateUrl: './dialogue-validation.component.html',
    styleUrls: ['./dialogue-validation.component.scss'],
})
export class DialogueValidationComponent implements OnInit {
    imageSource: string;
    constructor(@Inject(MAT_DIALOG_DATA) public data: { imageSource: string; nbDifferences: number; name: string; image: Blob }) {}

    ngOnInit(): void {
        this.imageSource = environment.serverUrl + '/file/' + this.data.imageSource + '.bmp';
    }
}
