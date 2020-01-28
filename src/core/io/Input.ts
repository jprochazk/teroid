import { Logger } from 'core/debug/Logger';
import { AlreadyInitializedError } from "core/debug/AlreadyInitializedError";
import { isNotNullOrUndefined } from "core/util/Common";
import { Bit } from "core/math/Bit";

/**
 * Declaration of events to listen to  
 * Used to initalize event listeners and propagate events  
 */
const Events = {
    "keydown": (e: Event, state: InputState, callbacks: Array<(state: InputState)=>void>) => {
        e.preventDefault()

        let key = (<KeyboardEvent>e).key.toUpperCase();
        if((<KeyboardEvent>e).key === " ") key = "SPACE";

        state.keys[key] = true;

        state.modifier.alt = (<KeyboardEvent>e).altKey;
        state.modifier.ctrl = (<KeyboardEvent>e).ctrlKey;
        state.modifier.shift = (<KeyboardEvent>e).shiftKey;

        const state_copy = _copyState(state);
        callbacks.forEach(c => c(state_copy));
    },
    "keyup": (e: Event, state: InputState, callbacks: Array<(state: InputState)=>void>) => {
        e.preventDefault()

        let key = (<KeyboardEvent>e).key.toUpperCase();
        if((<KeyboardEvent>e).key === " ") key = "SPACE";

        state.keys[key] = false;

        state.modifier.alt = (<KeyboardEvent>e).altKey;
        state.modifier.ctrl = (<KeyboardEvent>e).ctrlKey;
        state.modifier.shift = (<KeyboardEvent>e).shiftKey;

        const state_copy = _copyState(state);
        callbacks.forEach(c => c(state_copy));
    },
    "mousemove": (e: Event, state: InputState, callbacks: Array<(state: InputState)=>void>) => {
        e.preventDefault()
        
        state.mouse.movementX = Math.clamp((<MouseEvent>e).movementX, -10, 10);
        state.mouse.movementY = Math.clamp((<MouseEvent>e).movementY, -10, 10);
        state.mouse.clientX = (<MouseEvent>e).clientX;
        state.mouse.clientY = (<MouseEvent>e).clientY;
        state.mouse.buttons = (<MouseEvent>e).buttons;
        

        const state_copy = _copyState(state);
        callbacks.forEach(c => c(state_copy));
    },
    "mousedown": (e: Event, state: InputState, callbacks: Array<(state: InputState)=>void>) => {
        e.preventDefault()
        state.mouse.buttons = (<MouseEvent>e).buttons;
        // if we have a pointer lock element and the document doesnt have one (pointer isnt locked)
        // request pointer lock
        if(state.mouse.pointerLockElement && !document.pointerLockElement) {
            state.mouse.pointerLockElement.requestPointerLock();
            state.mouse.isPointerLocked = true;
        }

        const state_copy = _copyState(state);
        callbacks.forEach(c => c(state_copy));
    },
    "mouseup": (e: Event, state: InputState, callbacks: Array<(state: InputState)=>void>) => {
        e.preventDefault()
        state.mouse.buttons = (<MouseEvent>e).buttons;
        // if we have a pointer lock element & no buttons are pressed, exit pointer lock
        if(state.mouse.pointerLockElement && document.pointerLockElement && state.mouse.buttons === 0) {
            document.exitPointerLock();
            state.mouse.isPointerLocked = false;
        }

        const state_copy = _copyState(state);
        callbacks.forEach(c => c(state_copy));
    },
    "wheel": (e: Event, state: InputState, callbacks: Array<(state: InputState)=>void>) => {
        state.mouse.wheelDelta = (<WheelEvent>e).deltaY;
        
        state.modifier.alt = (<WheelEvent>e).altKey;
        state.modifier.ctrl = (<WheelEvent>e).ctrlKey;
        state.modifier.shift = (<WheelEvent>e).shiftKey;

        const state_copy = _copyState(state);
        callbacks.forEach(c => c(state_copy));
    }
}
type Events = typeof Events;

export interface MouseState {
    movementX: number;
    movementY: number;
    clientX: number;
    clientY: number;
    buttons: number;
    wheelDelta: number;
    isPointerLocked: boolean;
    pointerLockElement: HTMLElement | null;
}

export interface ModifierState {
    shift: boolean;
    ctrl: boolean;
    alt: boolean;
}

export interface InputState {
    mouse: MouseState;
    keys: {[key:string]:boolean};
    modifier: ModifierState;
}

const _copyState = (state: InputState): InputState => {
    return {
        mouse: {
            movementX: state.mouse.movementX,
            movementY: state.mouse.movementY,
            clientX: state.mouse.clientX,
            clientY: state.mouse.clientY,
            buttons: state.mouse.buttons,
            wheelDelta: state.mouse.wheelDelta,
            isPointerLocked: state.mouse.isPointerLocked,
            pointerLockElement: state.mouse.pointerLockElement
        },
        keys: state.keys,
        modifier: {
            shift: state.modifier.shift,
            ctrl: state.modifier.ctrl,
            alt: state.modifier.alt
        }
    }
}

// typescript is beautiful, isn't it?
type EventCallbackMap = {
    [x in keyof Events]: Array<(state: InputState) => void>;
};
const _initEventCallbackMap = (): EventCallbackMap => {
    let obj_dcl = "return { ";
    Object.keys(Events).forEach((k,i,arr) => {
        if(i === arr.length - 1) {
            obj_dcl += `"${k}": new Array() }`;
            return;
        }
        obj_dcl += `"${k}": new Array(), `;
    });
    return Function(obj_dcl)()
};

export abstract class InputHandler {
    private static initialized: boolean;

    private static callbacks: EventCallbackMap;

    private static state: InputState;

    public static init(pointerLockElement?: HTMLElement) {
        if(this.initialized) throw new AlreadyInitializedError(`Asset manager`);

        this.state = {
            mouse: {
                movementX: 0,
                movementY: 0,
                clientX: 0,
                clientY: 0,
                buttons: 0,
                wheelDelta: 0,
                isPointerLocked: false,
                pointerLockElement: pointerLockElement || null
            },
            keys: {},
            modifier: {
                shift: false,
                ctrl: false,
                alt: false
            }
        }

        this.callbacks = _initEventCallbackMap();

        this.initListeners();
        
        this.initialized = true;
    }

    public static register(event: keyof Events, callback: (state:InputState)=>void) {
        this.callbacks[event].push(callback);
    }

    private static inputCallback(e: Event) {
        Events[e.type as keyof Events](e, this.state, this.callbacks[e.type as keyof Events]);
    }

    private static initListeners() {
        // used for type narrowing of string so that the typescript compiler is happy :)
        const _narrow = (str:string): keyof Events => Function(`return "${str}"`)();
        // little trick to initalize event listeners from a map
        // this allows easily listening to new event types
        // and you can see all event types in a single place (top of this file)
        Object.keys(Events).map(event=>{
            event = event.toString().toLowerCase();
            window.addEventListener(_narrow(event), (e:Event)=>{this.inputCallback.call(InputHandler,e)});
        });
    }
}