import { ShaderManager } from 'core/io/ShaderManager';
import { AlreadyInitializedError } from "core/debug/AlreadyInitializedError";
import { Material } from "core/scene/Material";
import { ModelMaterialJson } from "core/io/ModelManager";


export abstract class MaterialManager {
    private static initialized: boolean;

    public static loadedMaterials: Map<string, Material>;

    public static init() {
        if(this.initialized) throw new AlreadyInitializedError("Model manager");
        this.loadedMaterials = new Map();
        
        this.initialized = true;
    }

    public static async build(material_json: ModelMaterialJson): Promise<Material> {
        return new Promise(async(resolve,reject)=>{
            if(this.loadedMaterials.has(material_json.name)) {
                resolve(this.loadedMaterials.get(material_json.name));
                return;
            }
            
            const shader = await ShaderManager.load(material_json.shader.name, material_json.shader.defines || []);

            const material = new Material(material_json.name, shader, material_json.properties);
            this.loadedMaterials.set(material.name, material);
            resolve(material);
        });
    }
}