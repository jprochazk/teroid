import { NotInitializedError } from './../debug/NotInitializedError';
export type PartialUniformFn = (data:any) => void;

export abstract class GL {
    private static _context: WebGL2RenderingContext;

    public static init(canvas: HTMLCanvasElement) {
        const context = canvas.getContext('webgl2'/*, {preserveDrawingBuffer:true}*/);
        if(!context) throw new Error(`Failed to acquire WebGL2 context!`);
        this._context = context;
    }

    public static get context(): WebGL2RenderingContext {
        if(!this._context) throw new NotInitializedError(`WebGL context`);

        return this._context;
    }

    public static getPartialUniformSetter(
        type: string,
        location: WebGLUniformLocation
    ): PartialUniformFn {
        if(!this._context) throw new NotInitializedError(`WebGL context`);

        switch(type) {
            case 'SAMPLER_CUBE':
            return function(data:any) { GL.context.uniform1i.call(GL.context,location,data); }
            case 'SAMPLER_2D':
            return function(data:any) { GL.context.uniform1i.call(GL.context,location,data); }
            case 'FLOAT':
            return function(data:any) { GL.context.uniform1f.call(GL.context,location,data); }
            case 'INT':
            return function(data:any) { GL.context.uniform1f.call(GL.context,location,data); }
            case 'UNSIGNED_INT': 
            return function(data:any) { GL.context.uniform1ui.call(GL.context,location,data); }
            case 'BOOL':
            return function(data:any) { GL.context.uniform1i.call(GL.context,location,data); }
            case 'FLOAT_VEC2':
            return function(data:any) { GL.context.uniform2fv.call(GL.context,location,data); }
            case 'INT_VEC2': 
            return function(data:any) { GL.context.uniform2iv.call(GL.context,location,data); }
            case 'UNSIGNED_INT_VEC2':
            return function(data:any) { GL.context.uniform2uiv.call(GL.context,location,data); }
            case 'BOOL_VEC2':
            return function(data:any) { GL.context.uniform2iv.call(GL.context,location,data); }
            case 'FLOAT_VEC3':
            return function(data:any) { GL.context.uniform3fv.call(GL.context,location,data); }
            case 'INT_VEC3':
            return function(data:any) { GL.context.uniform3iv.call(GL.context,location,data); }
            case 'UNSIGNED_INT_VEC3':
            return function(data:any) { GL.context.uniform3uiv.call(GL.context,location,data); }
            case 'BOOL_VEC3':
            return function(data:any) { GL.context.uniform3iv.call(GL.context,location,data); }
            case 'FLOAT_VEC4':
            return function(data:any) { GL.context.uniform4fv.call(GL.context,location,data); }
            case 'INT_VEC4':
            return function(data:any) { GL.context.uniform4iv.call(GL.context,location,data); }
            case 'UNSIGNED_INT_VEC4':
            return function(data:any) { GL.context.uniform4uiv.call(GL.context,location,data); }
            case 'BOOL_VEC4':
            return function(data:any) { GL.context.uniform4iv.call(GL.context,location,data); }
            case 'FLOAT_MAT2':
            return function(data:any) { GL.context.uniformMatrix2fv.call(GL.context,location,false,data); }
            case 'FLOAT_MAT2X3':
            return function(data:any) { GL.context.uniformMatrix2x3fv.call(GL.context,location,false,data); }
            case 'FLOAT_MAT2X4':
            return function(data:any) { GL.context.uniformMatrix2x4fv.call(GL.context,location,false,data); }
            case 'FLOAT_MAT3X2':
            return function(data:any) { GL.context.uniformMatrix3x2fv.call(GL.context,location,false,data); }
            case 'FLOAT_MAT3':
            return function(data:any) { GL.context.uniformMatrix3fv.call(GL.context,location,false,data); }
            case 'FLOAT_MAT3X4':
            return function(data:any) { GL.context.uniformMatrix3x4fv.call(GL.context,location,false,data); }
            case 'FLOAT_MAT4X2':
            return function(data:any) { GL.context.uniformMatrix4x2fv.call(GL.context,location,false,data); }
            case 'FLOAT_MAT4X3':
            return function(data:any) { GL.context.uniformMatrix4x3fv.call(GL.context,location,false,data); }
            case 'FLOAT_MAT4':
            return function(data:any) { GL.context.uniformMatrix4fv.call(GL.context,location,false,data); }

            default: throw new Error(`Unknown uniform data type ${type}`);
        }
    }
}

