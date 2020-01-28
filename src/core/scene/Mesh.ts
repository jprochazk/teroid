import { Logger } from 'core/debug/Logger';
import { ModelMeshJson } from "core/io/ModelManager";
import { GL } from "core/gl/GLContext";
import { ShaderReflection } from "core/gl/Shader";

export class Mesh {
    

    private constructor(
        public readonly name: string,
        public readonly material: string,
        public readonly VAO: WebGLVertexArrayObject,
        public readonly bufferLength: number
    ) {

    }

    public draw(gl: WebGL2RenderingContext) {
        gl.bindVertexArray(this.VAO);
        // @todo include these parameters in the construction process
        gl.drawElements(gl.TRIANGLES, this.bufferLength, gl.UNSIGNED_INT, 0);
    }

    public static fromJson(mesh_json: ModelMeshJson, attributes: ShaderReflection.Attribute[]): Mesh {
        const gl = GL.context; 

        console.log(mesh_json.buffers.vertex, mesh_json.buffers.index);

        const stride = attributes[0].stride;
        if(mesh_json.buffers.vertex.length % stride !== 0) 
            throw new Error(`Vertex buffer for mesh ${mesh_json.name} is not multiple of ${stride}`);

        const highestIndex = mesh_json.buffers.index.reduce((prev, curr) => (curr > prev) ? curr : prev);
        if(highestIndex !== (mesh_json.buffers.vertex.length / (stride / 4)) - 1)
            throw new Error(`Highest index in index buffer for mesh ${mesh_json.name} is higher than length of vertex buffer`);
        
        
        let VAO = gl.createVertexArray();
        if(!VAO) throw new Error(`Failed to initialize WebGL vertex array object`);
        let VBO = gl.createBuffer();
        if(!VBO) throw new Error(`Failed to initialize WebGL buffers`);
        let EBO = gl.createBuffer();
        if(!EBO) throw new Error(`Failed to initialize WebGL buffers`);

        gl.bindVertexArray(VAO);
        gl.bindBuffer(gl.ARRAY_BUFFER, VBO);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(mesh_json.buffers.vertex), gl.STATIC_DRAW);

        attributes.forEach(attribute => {
            console.log(attribute);
            gl.enableVertexAttribArray(attribute.location);
            gl.vertexAttribPointer(
                attribute.location, 
                attribute.size, 
                attribute.type, 
                attribute.normalized, 
                attribute.stride, 
                attribute.offset
            );
        });

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, EBO);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Int32Array(mesh_json.buffers.index), gl.STATIC_DRAW);

        gl.bindVertexArray(null);

        return new Mesh(mesh_json.name, mesh_json.material, VAO, mesh_json.buffers.index.length);
    }
}