import { Logger } from 'core/debug/Logger';
import { MaterialManager } from 'core/io/MaterialManager';
import { AlreadyInitializedError } from './../debug/AlreadyInitializedError';
import { NotInitializedError } from './../debug/NotInitializedError';
import { AssetManager } from 'core/io/AssetManager';
import { Model } from 'core/scene/Model';
import { Mesh } from 'core/scene/Mesh';
import { Material } from 'core/scene/Material';


export interface ModelMaterialJson {
    name: string,
    shader: {
        name: string,
        defines: string[]
    },
    properties: {[uniformName:string]:number|number[]}
}

export interface ModelMeshJson {
    name: string,
    material: string,
    buffers: {
        vertex: number[],
        index: number[]
    }
}

export interface ModelJson {
    name: string,
    materials: ModelMaterialJson[],
    meshes: ModelMeshJson[]
}

const SmarterParse = function (data:any): any { 
    let d;
    try {
        d = JSON.parse(data);
    } catch (e) {
        if(e instanceof SyntaxError) {
            const i = e.message.search("position ") + "position ".length;
            const pos = parseInt(e.message.substr(i, e.message.length - i));
            const strd = data.toString().replace(/\n|\r/g, '');
            const err_in_data = `...${strd.slice(pos, (pos+10 > strd.length) ? strd.length : pos+10)}...`;
            throw new Error(`Unexpected token near ${err_in_data} while parsing json`);
        }
    }
    return d;
}

export abstract class ModelManager {
    private static initialized: boolean;

    private static _basePath: string;
    private static loadedModels: Map<string, any>; // @temp - change <string,any> to <string,Model>

    public static init(basePath?: string) {
        if(this.initialized) throw new AlreadyInitializedError("Model manager");
        this.loadedModels = new Map();

        this._basePath = basePath ?? "model";
        
        this.initialized = true;
    }

    public static get basePath() { return this._basePath; }

    // @todo put materials into scene
    public static async load(model_name: string/*, scene: Scene*/): Promise<Model> {
        if(!this.initialized) throw new NotInitializedError("Model manager");

        return new Promise(async (resolve, reject) => {
            if(this.loadedModels.has(model_name)) {
                resolve(this.loadedModels.get(model_name));
                return;
            }

            const model_json = await AssetManager.load(`${this._basePath}/${model_name}.tml`, 
                (data: any) => SmarterParse(data)
            );
            
            if(!this.validateJson(model_name, model_json)) {
                reject(`Failed to load model ${model_name}`);
                return;
            }

            const materials = new Map<string, Material>();
            for (const material_json of model_json.materials) {
                const material = await MaterialManager.build(material_json);
                materials.set(material.name, material);
            }

            const meshes = model_json.meshes.map(mesh_json => {
                const material = materials.get(mesh_json.material);
                if(!material) throw new Error(`Material ${mesh_json.material} not found for mesh ${mesh_json.name}!`);
                return Mesh.fromJson(mesh_json, material.shader.attributes);
            });

            const model = new Model(model_name, meshes);
            this.loadedModels.set(model_name, model);
            resolve(model);
        });
    }

    private static validateJson(model_name: string, model_json: any): model_json is ModelJson {
        const validationError = (field: string, msg: string) => Logger.error(`Model JSON validation error for field ${field}: ${msg}`);

        if(!model_json.name) {
            validationError("name", "not found");
            return false;
        }

        if(model_json.name.constructor.name !== 'String') {
            validationError("name", `expected "string", found "${model_json.name.constructor.name}"`);
            return false;
        }

        if(model_json.materials && model_json.materials.constructor.name !== 'Array') {
            validationError("materials", `expected "array", found "${model_json.name.constructor.name}"`);
            return false;
        }

        if(!model_json.meshes) {
            validationError("meshes", "model needs at least 1 mesh, found 0");
            return false;
        }

        if(model_json.meshes.constructor.name !== 'Array') {
            validationError("meshes", `expected "array", found "${model_json.name.constructor.name}"`);
            return false;
        }

        return true;
    }
}