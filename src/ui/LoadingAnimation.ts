import { UIBase } from 'ui/Base';

export class LoadingAnimation extends UIBase {

    constructor() {
        super('div', null, {
            classes: ["loading-spinner"],
            resizable: false
        });
    }
}