export class Player {
    isAllowedToClick: boolean;
    username: string;
    differenceCounter: number;
    clueCounter: number;
    numberOfDifferencesTotal: number;
    socketID: string;
    constructor() {
        this.differenceCounter = 0;
        this.clueCounter = 3;
    }
}
