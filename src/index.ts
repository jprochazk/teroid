import { GL } from 'core/gl/GLContext';
import { MaterialManager } from 'core/io/MaterialManager';
import { Application } from "core/Application";
import { Logger } from 'core/debug/Logger';
import { ModelManager } from "core/io/ModelManager";
import { LoadingAnimation } from "ui/LoadingAnimation";
import { PerspectiveCamera3D } from "core/scene/Camera";
import { Matrix4, Vector3 } from 'core/math/Math';
import { DebugWindow } from 'ui/Debug';


// @todo blender plugin to export models in custom file format
// @todo scene graph + renderer
// @todo shader #ifdef, #endif + #include
// @todo texture path in .tml instead of uniform data (for sampler uniforms)

class Game extends Application {
    private loadAnim: LoadingAnimation;

    private debugWindow: DebugWindow;

    constructor(canv: HTMLCanvasElement) {
        super(canv);

        this.canvas.oncontextmenu = e => e.preventDefault();
        

        const vcb = (d:any) => console.log(d);
        this.debugWindow = new DebugWindow([
            {name:"someoutput", type: "output"}
        ]);

        this.loadAnim = new LoadingAnimation();
    }

    public async start() {
        this.loadAnim.show();

        this.debugWindow.set("someoutput", "Hello!");

        const gl = GL.context;

        const camera = new PerspectiveCamera3D({
            width: this.canvas.clientWidth,
            height: this.canvas.clientHeight
        });

        // these will be loaded directly into a scene
        const model = await ModelManager.load("SampleModel");
        if(!model) throw new Error(`failed to get material`);

        // these will be stored in scene
        const material = MaterialManager.loadedMaterials.get("SampleMaterial");
        if(!material) throw new Error(`failed to get material`);

        gl.clearColor(0.2, 0.2, 0.2, 1);
        gl.enable(gl.DEPTH_TEST);

        this.debugWindow.addField({
            name:"camera_pos",type:"output"
        });

        const loop = () => {

            if(this.resize()) {
                camera.resize(this.canvas.width, this.canvas.height);
            }

            camera.update(1);
            this.debugWindow.set("camera_pos", camera.position.toArray().map(it => it.toFixed(1)));

            // render
            this.debugWindow.update();

            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

            material.shader.bind();

            material.shader.uploadUniforms({
                "u_model": Matrix4.create().translate(Vector3.create([0,0,-5])),
                "u_view": camera.viewMatrix,
                "u_projection": camera.projectionMatrix
            });
            material.use();

            for (const mesh of model.meshes) {
                mesh.draw(gl);
            }

            window.requestAnimationFrame(loop);
        }

        window.requestAnimationFrame(loop);

        this.loadAnim.hide();
    }
}

let canvas = document.createElement('canvas');
document.body.appendChild(canvas);
let game = new Game(canvas);
game.start();