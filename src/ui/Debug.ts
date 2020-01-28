import { Logger } from 'core/debug/Logger';
import { InputHandler } from 'core/io/Input';
import { UIBase } from 'ui/Base';


export interface DebugFieldInfo {
    name: string;
    type: 'text' | 'range' | 'radio' | 'number' | 'color' | 'checkbox' | 'button';
    callback: (data:any)=>void;
    width?: number;
    min?: number;
    max?: number;
    step?: number;
}

export class DebugWindow extends UIBase {
    private _fields: DebugField[] = [];

    constructor(fields: DebugFieldInfo[]) {
        super("div", null, {
            classes: ["debug"],
            offset: [0, 0],
            // 300px width
            // 20px base height + 30 px for each field
            size: [300, 10 + (30*fields.length) + 10],
            resizable: false
        });

        this.addChild(new DebugWindowDrag(this));
        
        fields.forEach((field, i) => this._fields.push(
            new DebugField(this, field.name, {
                min: field.min || 0,
                max: field.max || 10,
                width: field.width || 200,
                step: field.step,
                fieldType: field.type, 
                index: i * 30, 
                valueChangeCallback: field.callback
            })
        ));
    }
}

class DebugInput<T extends 'text' | 'range' | 'radio' | 'number' | 'color' | 'checkbox' | 'button'> extends UIBase {
    constructor(
        type: T,
        field: DebugField,
        min: number,
        max: number,
        step?: number,
        valueChangeCallback?: (data: any) => void
    ) {
        super("input", field.parent, {
            resizable: false,
            classes: ["debug-field-input"]
        });

        this.element.focus = e => {
            this.element.onkeydown = e => e.stopPropagation();
            this.element.onkeyup = e => e.stopPropagation();
        }
        this.element.onblur = e => {
            this.element.onkeydown = e => {};
            this.element.onkeyup = e => {};
        }

        this.element.setAttribute("type", type);
        if(type === 'text') {
            this.element.setAttribute("minlength", min.toString());
            this.element.setAttribute("maxlength", max.toString());
        } else {
            this.element.setAttribute("min", min.toString());
            this.element.setAttribute("max", max.toString());
        }

        if(type === 'number') {
            if(step) {
                this.element.setAttribute("step", step.toString());
            } else {
                Logger.warn(`Field ${field.name} is numeric, but has no step interval!`);
            }
        }

        const cb = valueChangeCallback || function(){};
        if(type === 'radio' || type === 'checkbox') {
            this.element.onchange = e => cb((<HTMLInputElement>this.element).checked);
        } else {
            this.element.onchange = e => cb((<HTMLInputElement>this.element).value);
        }
    }
}

class DebugInputLabel extends UIBase {

    constructor(window: DebugWindow, content: string) {
        super("span", window, {
            resizable: false
        });

        this.element.innerText = content;
    }
}

class DebugField extends UIBase {


    constructor(
        window: DebugWindow,
        public readonly name: string, 
        options: {
            width: number,
            min: number,
            max: number,
            fieldType: 'text' | 'range' | 'radio' | 'number' | 'color' | 'checkbox' | 'button', 
            index: number,
            valueChangeCallback?: (data: any)=>void,
            step?: number,
        },
    ) {
        super("div", window, {
            classes: ["debug-field"],
            offset: [15, 15 + options.index],
            resizable: false
        });

        this.addChild(new DebugInputLabel(window, name));
        this.addChild(new DebugInput(options.fieldType, this, options.min, options.max, options.step, options.valueChangeCallback));
    }
}

class DebugWindowDrag extends UIBase {
    private drag: boolean;

    constructor(win: DebugWindow) {
        super("div", win, {
            offset: [0, 0],
            size: [10, 10],
            resizable: false,
            classes: ["debug-drag"]
        });

        this.drag = false;

        this.element.onmousedown = e => {
            this.drag = true;
            e.stopPropagation();
        }
        InputHandler.register("mousemove", (s)=>{
            if(this.drag) {
                this.parent!.move([s.mouse.clientX-5, s.mouse.clientY-5]);
            }
        });
        InputHandler.register("mouseup", (s)=>{
            this.drag = false;
        });
    }
}