import { Logger, DebugLevel } from 'core/debug/Logger';
import { GL, PartialUniformFn } from 'core/gl/GLContext';


export class Shader {
    private readonly gl: WebGL2RenderingContext;
    private readonly uniformMap: Map<string, ShaderReflection.Uniform>;

    private constructor(
        public readonly name: string,
        public readonly source: string,
        public readonly program: WebGLProgram,
        public readonly attributes: ShaderReflection.Attribute[],
        public readonly uniforms: ShaderReflection.Uniform[]
    ) {
        this.gl = GL.context;

        this.uniformMap = new Map();
        uniforms.forEach(uniform => {
            this.uniformMap.set(uniform.name, uniform);
        });
    }

    public uploadUniforms(uniformData: {[uniformName:string]:any}) {
        for(const [name,value] of Object.entries(uniformData)) {
            const uniform = this.uniformMap.get(name);
            if(!uniform) {
                if(Logger.debugLevel >= DebugLevel.WARN)
                    throw new Error(`Uniform ${name} not found in shader ${this.name} while attempting to set uniform (${name}: ${value})`);

                continue;
            }

            uniform.set(value);
        }
    }

    public bind() {
        this.gl.useProgram(this.program);
    }

    public unbind() {
        this.gl.useProgram(null);
    }

    public static fromGLSL(name: string, file: string): Shader {
        const shader_sources = ShaderUtils.splitShader(file);
        const program = ShaderUtils.createShaderProgram(shader_sources);

        const attributes = ShaderReflection.reflectAttributes(program);
        const uniforms = ShaderReflection.reflectUniforms(program);

        return new Shader(name, file, program, attributes, uniforms);
    }
}

export namespace ShaderReflection {

    export interface Attribute {
        location: number;
        type: number;
        name: string;
        size: number;
        stride: number;
        offset: number;
        normalized: boolean;
    }

    export function reflectAttributes(program: WebGLProgram): Attribute[] {
        const gl = GL.context;

        const attributes: Attribute[] = [];

        let total_stride = 0;
        const attributeCount = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES);
        for(let i = 0; i < attributeCount; i++) {
            const attributeInfo = gl.getActiveAttrib(program, i);
            if(!attributeInfo) throw new Error(`Could not get active attribute at location ${i}`);
            if(!ShaderDataTypes[attributeInfo.type]) throw new Error(`Unknown attribute data type at location ${i}`);

            const location = gl.getAttribLocation(program, attributeInfo.name);
            const size = ShaderDataTypeSizes[ShaderDataTypes[attributeInfo.type]];
            attributes.push({
                location: location,
                type: ShaderDataBaseTypes[attributeInfo.type],
                name: attributeInfo.name,
                size: size / 4,
                stride: 0,
                offset: size * location,
                normalized: false
            });

            total_stride += size;

            if(i === attributeCount - 1) {
                attributes.forEach(attrib => attrib.stride = total_stride);
            }
        }

        return attributes;
    }

    export interface Uniform {
        type: number;
        name: string;
        set: PartialUniformFn;
    }

    export function reflectUniforms(program: WebGLProgram): Uniform[] {
        const gl = GL.context;

        const uniformCount = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
        const uniforms: Uniform[] = [];
        for(let i = 0; i < uniformCount; i++) {
            const uniformInfo = gl.getActiveUniform(program, i);
            if(!uniformInfo) throw new Error(`Could not get active uniform at location ${i}`);
            if(!ShaderDataTypes[uniformInfo.type]) throw new Error(`Unknown uniform data type for uniform ${uniformInfo.name}`);

            const location = gl.getUniformLocation(program, uniformInfo.name);
            if(!location) throw new Error(`Could not get uniform location for uniform ${uniformInfo.name}`);

            const type = ShaderDataTypes[uniformInfo.type];
            uniforms.push({
                type: uniformInfo.type,
                name: uniformInfo.name,
                set: GL.getPartialUniformSetter(type, location)
            });
        }

        return uniforms;
    }
}

export namespace ShaderUtils {
    /**
     * Used to split a single shader source file into the corresponding vertex and fragment shaders  
     * Currently done via substring operations (could be done using regex, too)
     */
    export function splitShader(source: string): {vertex:string, fragment:string} {
        const ivertex = source.lastIndexOf("__VERTEX__");
        const ifragment = source.lastIndexOf("__FRAGMENT__");
        const temp_vsrc = source.substring(ivertex + "__VERTEX__".length, ifragment).trim();
        const temp_fsrc = source.substring(ifragment + "__FRAGMENT__".length).trim();
        return {vertex: temp_vsrc, fragment: temp_fsrc};
    }
    /**
     * 
     * @param sources the vertex and fragment shaders, provided individually  
     * this allows you the freedom to store the text form of shaders in any way (even as one file),  
     * as long as you provide them to this function individually
     */
    export function createShaderProgram(sources: {vertex:string, fragment:string}): WebGLProgram {
        const gl = GL.context;
        const vertexShader = compileShader(sources.vertex, gl.VERTEX_SHADER);
        const fragmentShader = compileShader(sources.fragment, gl.FRAGMENT_SHADER);

        return linkProgram(vertexShader, fragmentShader);
    };

    export function compileShader(shaderSource: string, shaderType: number) {
        const gl = GL.context;
        const shader = gl.createShader(shaderType);
        if(!shader) throw new Error(`Failed to initialize WebGL shader`);

        gl.shaderSource(shader, shaderSource);
        gl.compileShader(shader);

        const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
        if (!success) {
            const infoLog = gl.getShaderInfoLog(shader);
            Logger.error(`${shaderSource}`);
            throw new Error(`Shader compilation error: ${infoLog}`);
        }
        return shader;
    };

    export function linkProgram(vertexShader: WebGLShader, fragmentShader: WebGLShader) {
        const gl = GL.context;
        const program = gl.createProgram();
        if(!program) throw new Error(`Failed to initialize WebGL shader program`);

        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);

        const success = gl.getProgramParameter(program, gl.LINK_STATUS);
        if (!success) throw new Error("program failed to link:" + gl.getProgramInfoLog (program));

        return program;
    };
}

export const ShaderDataTypeSizes: {[x:string]:number} = {
    BYTE: 1,
    UNSIGNED_BYTE: 1,
    SHORT: 2,
    UNSIGNED_SHORT: 2,
    INT: 4,
    UNSIGNED_INT: 4,
    FLOAT: 4,
    FLOAT_VEC2: 4 * 2,
    FLOAT_VEC3: 4 * 3,
    FLOAT_VEC4: 4 * 4,
    INT_VEC2: 4 * 2,
    INT_VEC3: 4 * 3,
    INT_VEC4: 4 * 4,
    BOOL: 1,
    BOOL_VEC2: 1 * 2,
    BOOL_VEC3: 1 * 3,
    BOOL_VEC4: 1 * 4,
    SAMPLER_2D: 4,
    SAMPLER_CUBE: 4,
    FLOAT_MAT2: 4 * 2 * 2,
    FLOAT_MAT2x3: 4 * 2 * 3,
    FLOAT_MAT2x4: 4 * 2 * 4,
    FLOAT_MAT3x2: 4 * 3 * 2,
    FLOAT_MAT3: 4 * 3 * 3,
    FLOAT_MAT3x4: 4 * 3 * 4,
    FLOAT_MAT4x2: 4 * 4 * 2,
    FLOAT_MAT4x3: 4 * 4 * 3,
    FLOAT_MAT4: 4 * 4 * 4,
    UNSIGNED_INT_VEC2: 4 * 2,
    UNSIGNED_INT_VEC3: 4 * 3,
    UNSIGNED_INT_VEC4: 4 * 4
}

export const ShaderDataBaseTypes: {[x:number]:number} = {
    0x1400: 0x1400,
    0x1401: 0x1401,
    0x1402: 0x1402,
    0x1403: 0x1403,
    0x1404: 0x1404,
    0x1405: 0x1405,
    0x1406: 0x1406,
    0x8B50: 0x1406,
    0x8B51: 0x1406,
    0x8B52: 0x1406,
    0x8B53: 0x1404,
    0x8B54: 0x1404,
    0x8B55: 0x1404,
    0x8B56: 0x1404,
    0x8B57: 0x1404,
    0x8B58: 0x1404,
    0x8B59: 0x1404,
    0x8B5A: 0x1406,
    0x8B5B: 0x1406,
    0x8B5C: 0x1406,
    0x8B5E: 0x1404,
    0x8B60: 0x1404,
    0x8B65: 0x1406,
    0x8B66: 0x1406,
    0x8B67: 0x1406,
    0x8B68: 0x1406,
    0x8B69: 0x1406,
    0x8B6A: 0x1406,
    0x8DC6: 0x1405,
    0x8DC7: 0x1405,
    0x8DC8: 0x1405,
}

export const ShaderDataTypes: {[x:number]:string} = {
    0x1400: "BYTE",
    0x1401: "UNSIGNED_BYTE",
    0x1402: "SHORT",
    0x1403: "UNSIGNED_SHORT",
    0x1404: "INT",
    0x1405: "UNSIGNED_INT",
    0x1406: "FLOAT",
    0x8B50: "FLOAT_VEC2",
    0x8B51: "FLOAT_VEC3",
    0x8B52: "FLOAT_VEC4",
    0x8B53: "INT_VEC2",
    0x8B54: "INT_VEC3",
    0x8B55: "INT_VEC4",
    0x8B56: "BOOL",
    0x8B57: "BOOL_VEC2",
    0x8B58: "BOOL_VEC3",
    0x8B59: "BOOL_VEC4",
    0x8B5A: "FLOAT_MAT2",
    0x8B5B: "FLOAT_MAT3",
    0x8B5C: "FLOAT_MAT4",
    0x8B5E: "SAMPLER_2D",
    0x8B60: "SAMPLER_CUBE",
    0x8B65: "FLOAT_MAT2x3",
    0x8B66: "FLOAT_MAT2x4",
    0x8B67: "FLOAT_MAT3x2",
    0x8B68: "FLOAT_MAT3x4",
    0x8B69: "FLOAT_MAT4x2",
    0x8B6A: "FLOAT_MAT4x3",
    0x8DC6: "UNSIGNED_INT_VEC2",
    0x8DC7: "UNSIGNED_INT_VEC3",
    0x8DC8: "UNSIGNED_INT_VEC4",
}