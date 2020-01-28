import { ShaderManager } from 'core/io/ShaderManager';
import { ModelManager } from 'core/io/ModelManager';
import { Logger } from 'core/debug/Logger';
import { AssetManager } from 'core/io/AssetManager';
import { GL } from './gl/GLContext';
import { MaterialManager } from 'core/io/MaterialManager';
import { InputHandler } from 'core/io/Input';


export abstract class Application {
    constructor(protected readonly canvas: HTMLCanvasElement) {
        Logger.init();
        GL.init(canvas);
        AssetManager.init();
        ShaderManager.init();
        MaterialManager.init();
        ModelManager.init();
        InputHandler.init(canvas);
    }

    protected resize(): boolean {
        if(this.canvas.width !== this.canvas.clientWidth
        || this.canvas.height !== this.canvas.clientHeight) {
            this.canvas.width = this.canvas.clientWidth;
            this.canvas.height = this.canvas.clientHeight;
            GL.context.viewport(0, 0, this.canvas.width, this.canvas.height);
            return true;
        }
        return false;
    }

    protected init() {}
}