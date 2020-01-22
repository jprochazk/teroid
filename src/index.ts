import { Application } from "core/Application";
import { Logger } from 'core/debug/Logger';
import { AssetManager } from 'core/io/AssetManager';
import { GL } from "core/gl/GLContext";


class Game extends Application {
    constructor(canvas: HTMLCanvasElement) {
        super(canvas);
    }

    public async start() {
    }
}

let canvas = document.createElement('canvas');
document.body.appendChild(canvas);
let game = new Game(canvas);
game.start();