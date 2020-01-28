import { Logger } from 'core/debug/Logger';
import { Vector2 } from 'core/math/Math';
import { UUID } from 'core/util/UUID';

const SupportedHTMLElementTagMap = {
    "a": HTMLAnchorElement.prototype,
    "span": HTMLSpanElement.prototype,
    "label": HTMLLabelElement.prototype,
    "button": HTMLButtonElement.prototype,
    "div": HTMLDivElement.prototype,
    "iframe": HTMLIFrameElement.prototype,
    "img": HTMLImageElement.prototype,
    "input": HTMLInputElement.prototype,
    "select": HTMLSelectElement.prototype,
    "textarea": HTMLTextAreaElement.prototype
}
type SupportedHTMLElementTagMap = typeof SupportedHTMLElementTagMap

export abstract class UIBase {
    private id: UUID;

    public readonly element: HTMLElement;
    public readonly parent: UIBase | null;
    protected children: UIBase[] = [];
    protected _position: Vector2 = Vector2.create();
    protected _dirty: boolean = false;

    constructor(
        type: keyof SupportedHTMLElementTagMap,
        parent: UIBase | null,
        options: {
            resizable: boolean,
            offset?: [number,number],
            size?: [number,number],
            classes?: string[]
        }
    ) {

        this.element = document.createElement(type);
        this.element.onmousedown = e =>{
            e.stopPropagation();
        }

        this.parent = parent;
        this.id = new UUID();
        this.element.id = this.id.toString();

        options.classes?.forEach(c => this.element.classList.add(c));

        if(options.offset) {
            this._position = Vector2.create(options.offset);
            this.element.style.position = "absolute";
            this.element.style.left = this._position[0].toString() + "px";
            this.element.style.top = this._position[1].toString() + "px";
        }

        if(options.size) {
            let size = Vector2.create(options.size);
            this.element.style.width = size[0].toString() + "px";
            this.element.style.minWidth = size[0].toString() + "px";
            this.element.style.height = size[1].toString() + "px";
            this.element.style.minHeight = size[1].toString() + "px";
        }

        if(options.resizable) {
            this.element.style.resize = "both";
            this.element.style.overflow = "hidden";
        }

        if(parent) {
            parent.addChild(this);
        } else {
            document.body.appendChild(this.element);
        }
    }

    public update() {
        this.children.forEach(child => child.update());
        if(!this._dirty) return false;
        
        this.element.style.left = this._position[0].toString() + "px";
        this.element.style.top = this._position[1].toString() + "px";
    }

    public addChild(child: UIBase) {
        this.element.appendChild(child.element);

        this.children.push(child);
        this._dirty = true;
    }

    public get position(): [number,number] { 
        return [this._position[0], this._position[1]]; 
    }

    public move(position: [number,number]) {
        // clamp to inner window
        position[0] = Math.clamp(position[0], 0, window.innerWidth - 10);
        position[1] = Math.clamp(position[1], 0, window.innerHeight - 10);

        this._position = Vector2.create(position);
        this._dirty = true;
    }

    public get size(): [number,number] {
        return [
            parseInt(this.element.style.left),
            parseInt(this.element.style.top)
        ];
    }

    public get minSize(): [number,number] {
        return [
            parseInt(this.element.style.minWidth),
            parseInt(this.element.style.minHeight)
        ];
    }

    public show() {
        this.element.hidden = false;
    }

    public hide() {
        this.element.hidden = true;
    }
}