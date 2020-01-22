export type PartialUniformFn<T extends number | number[]> = (data:T) => void;


type GLSLScalarDataTypeUnion = 
    'float' | 'int'    | 'uint'   | 'bool'  ;
type GLSLArrayDataTypeUnion = 
    'vec2'  | 'ivec2'  | 'uvec2'  | 'bvec2' |
    'vec3'  | 'ivec3'  | 'uvec3'  | 'bvec3' | 
    'vec4'  | 'ivec4'  | 'uvec4'  | 'bvec4' ;
type GLSLMatrixDataTypeUnion = 
    'mat2'  | 'mat2x3' | 'mat2x4' |
    'mat3'  | 'mat3x2' | 'mat3x4' |
    'mat4'  | 'mat4x3' | 'mat4x2' ;

    
export type GLSLDataTypeUnion = GLSLScalarDataTypeUnion | GLSLArrayDataTypeUnion | GLSLMatrixDataTypeUnion;


export abstract class GL {
    private static _context: WebGL2RenderingContext;

    public static init(canvas: HTMLCanvasElement) {
        let context = canvas.getContext('webgl2');
        if(!context) throw new Error(`Failed to acquire WebGL2 context!`);
        this._context = context;
    }

    public static get context(): WebGL2RenderingContext {
        if(!this._context) throw new Error(`WebGL context is not initialized!`);

        return this._context;
    }

    public static getPartialUniformSetter<T extends GLSLScalarDataTypeUnion | GLSLArrayDataTypeUnion | GLSLMatrixDataTypeUnion>(
        type: T,
        location: WebGLUniformLocation
    ): PartialUniformFn<T extends GLSLScalarDataTypeUnion ? number : number[]> {
        if(!this._context) throw new Error(`WebGL context is not initialized!`);

        switch(type) {
            case 'float':
            return function(data:any) {
                GL.context.uniform1f.call(GL.context,location,data);
            }

            case 'int':
            return function(data:any) {
                GL.context.uniform1f.call(GL.context,location,data);
            }

            case 'uint': 
            return function(data:any) {
                GL.context.uniform1ui.call(GL.context,location,data);
            }

            case 'bool':
            return function(data:any) {
                GL.context.uniform1i.call(GL.context,location,data);
            }
            
            case 'vec2':
            return function(data:any) {
                GL.context.uniform2fv.call(GL.context,location,data);
            }
            
            case 'ivec2': 
            return function(data:any) {
                GL.context.uniform2iv.call(GL.context,location,data);
            }
            
            case 'uvec2':
            return function(data:any) {
                GL.context.uniform2uiv.call(GL.context,location,data);
            }
            
            case 'bvec2':
            return function(data:any) {
                GL.context.uniform2iv.call(GL.context,location,data);
            }
            
            case 'vec3':
            return function(data:any) {
                GL.context.uniform3fv.call(GL.context,location,data);
            }
            
            case 'ivec3':
            return function(data:any) {
                GL.context.uniform3iv.call(GL.context,location,data);
            }
            
            case 'uvec3':
            return function(data:any) {
                GL.context.uniform3uiv.call(GL.context,location,data);
            }
            
            case 'bvec3':
            return function(data:any) {
                GL.context.uniform3iv.call(GL.context,location,data);
            }
            
            case 'vec4':
            return function(data:any) {
                GL.context.uniform4fv.call(GL.context,location,data);
            }
            
            case 'ivec4':
            return function(data:any) {
                GL.context.uniform4iv.call(GL.context,location,data);
            }
            
            case 'uvec4':
            return function(data:any) {
                GL.context.uniform4uiv.call(GL.context,location,data);
            }
            
            case 'bvec4':
            return function(data:any) {
                GL.context.uniform4iv.call(GL.context,location,data);
            }
            
            case 'mat2':
            return function(data:any) {
                GL.context.uniformMatrix2fv.call(GL.context,location,false,data);
            }
            
            case 'mat2x3':
            return function(data:any) {
                GL.context.uniformMatrix2x3fv.call(GL.context,location,false,data);
            }
            
            case 'mat2x4':
            return function(data:any) {
                GL.context.uniformMatrix2x4fv.call(GL.context,location,false,data);
            }
            
            case 'mat3x2':
            return function(data:any) {
                GL.context.uniformMatrix3x2fv.call(GL.context,location,false,data);
            }
            
            case 'mat3':
            return function(data:any) {
                GL.context.uniformMatrix3fv.call(GL.context,location,false,data);
            }
            
            case 'mat3x4':
            return function(data:any) {
                GL.context.uniformMatrix3x4fv.call(GL.context,location,false,data);
            }
            
            case 'mat4x2':
            return function(data:any) {
                GL.context.uniformMatrix4x2fv.call(GL.context,location,false,data);
            }
            
            case 'mat4x3':
            return function(data:any) {
                GL.context.uniformMatrix4x3fv.call(GL.context,location,false,data);
            }
            
            case 'mat4':
            return function(data:any) {
                GL.context.uniformMatrix4fv.call(GL.context,location,false,data);
            }
            
            default: throw new Error(`Unknown uniform data type ${type}`);
        }
    }
}