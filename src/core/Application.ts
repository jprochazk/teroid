import { Logger } from 'core/debug/Logger';
import { AssetManager } from 'core/io/AssetManager';
import { GL } from './gl/GLContext';


export abstract class Application {
    constructor(canvas: HTMLCanvasElement) {
        Logger.init();
        GL.init(canvas);
        AssetManager.init();
    }
}