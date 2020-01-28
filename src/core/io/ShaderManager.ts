import { AssetManager } from 'core/io/AssetManager';
import { GL } from "core/gl/GLContext";
import { AlreadyInitializedError } from "core/debug/AlreadyInitializedError";
import { Shader } from "core/gl/Shader";
import { NotInitializedError } from "core/debug/NotInitializedError";
import { murmurhash3_32_gc } from "core/util/StringHash";

export abstract class ShaderManager {
    private static initialized: boolean;

    private static _basePath: string;
    public static loadedShaders: Map<number, Shader>;

    public static init(basePath?: string) {
        if(this.initialized) throw new AlreadyInitializedError("Model manager");
        this.loadedShaders = new Map();

        this._basePath = basePath ?? "shader";
        
        this.initialized = true;
    }

    public static async load(shader_name: string, defines: string[] = []): Promise<Shader> {
        if(!this.initialized) throw new NotInitializedError("Shader manager");
        
        const name_hash = murmurhash3_32_gc(shader_name+defines.join(''));
        
        return new Promise(async (resolve, reject) => {
            if(this.loadedShaders.has(name_hash)) {
                resolve(this.loadedShaders.get(name_hash));
                return;
            }
            
            const shader_glsl = await AssetManager.load(`${this._basePath}/${shader_name}.glsl`) as string;

            const shader = Shader.fromGLSL(shader_name, shader_glsl);
            this.loadedShaders.set(name_hash, shader);
            resolve(shader);
        });
    }
}