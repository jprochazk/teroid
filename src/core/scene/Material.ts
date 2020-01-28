import { Logger } from 'core/debug/Logger';
import { ShaderManager } from 'core/io/ShaderManager';
import { ModelMaterialJson } from "core/io/ModelManager";
import { Shader } from 'core/gl/Shader';


export class Material {
    constructor(
        public readonly name: string,
        public readonly shader: Shader,
        public readonly uniformData: {[uniformName:string]:any}
    ) {
        if(!uniformData) Logger.warn(`Material ${name} has no uniform data!`);
    }

    public use() {
        this.shader.uploadUniforms(this.uniformData);
    }
}