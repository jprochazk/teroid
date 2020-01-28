import { InputHandler } from 'core/io/Input';
import { Matrix4, Vector3 } from "core/math/Math";

/**
 * Minimal representation of a camera
 */
export interface Camera {
    projectionMatrix: Matrix4;
    viewMatrix: Matrix4;
    position: Vector3;
    update: (dt: number) => void;
    resize: (nw: number, nh: number) => void;
}

//// CAMERA IMPLEMENTATIONS ////

/**
 * Basic first person perspective camera with yaw <-90°; 90°> and pitch <0, 360>
 */
export class PerspectiveCamera3D implements Camera {
    private worldUp: Vector3;
    private near: number;
    private far: number;
    private fov: number;
    private aspectRatio: number;
    private _projectionMatrix: Matrix4;
    private _viewMatrix: Matrix4;

    private yaw: number;
    private pitch: number;
    private sensitivity: number;
    private moveSpeed: number;

    private direction: {
        front: boolean,
        back: boolean,
        right: boolean,
        left: boolean,
        up: boolean,
        down: boolean
    };
    private _position: Vector3;
    private front: Vector3;
    private right: Vector3;
    private up: Vector3;

    /**
     * Default values:
     * - sensitivity: 0.1
     * - moveSpeed: 0.1
     * - near: 0.000001
     * - far: 100
     * - fov: 60°
     * - worldUp: [0,1,0]
     * - position: [0,0,0]
     * - yawOffset: 0
     * - pitchOffset: 0
     */
    constructor(options: {
        width: number, 
        height: number, 
        sensitivity?: number, 
        moveSpeed?: number, 
        near?: number, 
        far?: number, 
        fov?: number, 
        worldUp?: Vector3,
        position?: Vector3,
        yawOffset?: number,
        pitchOffset?: number
    }) {
        this.near = options.near || 0.000001;
        this.far = options.far || 100;
        this.fov = (options.fov) ? Math.rad(options.fov) : Math.rad(60);
        this.aspectRatio = options.width / options.height;
        this.worldUp = options.worldUp || Vector3.create([0,1,0]);

        this.yaw = (options.yawOffset || 0) - 90.0;
        this.pitch = options.pitchOffset || 0.0;
        this.sensitivity = options.sensitivity || 0.1;
        this.moveSpeed = options.moveSpeed || 0.1;

        this.direction = {
            front: false,
            back: false,
            right: false,
            left: false,
            up: false,
            down: false
        };
        this._position = options.position || Vector3.create([0,0,0]);

        this.front = Vector3.create([
            Math.cos(Math.rad(this.yaw)) * Math.cos(Math.rad(this.pitch)),
            Math.sin(Math.rad(this.pitch)),
            Math.sin(Math.rad(this.yaw)) * Math.cos(Math.rad(this.pitch))
        ]).normalize();
        this.right = this.front.cross(this.worldUp).normalize();
        this.up = this.right.cross(this.front).normalize();

        this._projectionMatrix = Matrix4.perspective(this.fov, this.aspectRatio, this.near, this.far);
        this._viewMatrix = Matrix4.lookAt(this._position, this._position.clone().add(this.front), this.up);

        InputHandler.register("mousemove", (s)=>{
            if(s.mouse.isPointerLocked) this.mouseMove(s.mouse.movementX, -s.mouse.movementY);
        });
        InputHandler.register("keydown", (s) => {
            if(s.keys["W"] === true)         this.direction.front = true;
            if(s.keys["S"] === true)         this.direction.back = true;
            if(s.keys["D"] === true)         this.direction.right = true;
            if(s.keys["A"] === true)         this.direction.left = true;
            if(s.keys["SPACE"] === true)     this.direction.up = true;
            if(s.keys["SHIFT"] === true)     this.direction.down = true;
        });
        InputHandler.register("keyup", (s) => {
            if(s.keys["W"] === false)        this.direction.front = false;
            if(s.keys["S"] === false)        this.direction.back = false;
            if(s.keys["D"] === false)        this.direction.right = false;
            if(s.keys["A"] === false)        this.direction.left = false;
            if(s.keys["SPACE"] === false)    this.direction.up = false;
            if(s.keys["SHIFT"] === false)    this.direction.down = false;
        });
    }

    public get projectionMatrix() {
        return this._projectionMatrix;
    }

    public get viewMatrix() {
        return this._viewMatrix;
    }

    public get position() {
        return this._position;
    }

    public update(dt: number) {
        const dv = this.moveSpeed * dt;
        if(this.direction.front) this.position.add(this.front.clone().scale(dv));
        if(this.direction.back) this.position.sub(this.front.clone().scale(dv));
        if(this.direction.right) this.position.add(this.right.clone().scale(dv));
        if(this.direction.left) this.position.sub(this.right.clone().scale(dv));
        if(this.direction.up) this.position.add(this.up.clone().scale(dv));
        if(this.direction.down) this.position.sub(this.up.clone().scale(dv));
        
        this._viewMatrix = Matrix4.lookAt(this._position, this._position.clone().add(this.front), this.up);
    }

    public mouseMove(offsetX: number, offsetY: number) {
		offsetX *= this.sensitivity;
		offsetY *= this.sensitivity;

		this.yaw += offsetX;
		this.pitch += offsetY;

		if (this.pitch > 89.0) this.pitch = 89.0;
		if (this.pitch < -89.0) this.pitch = -89.0;
            
        this.front = Vector3.create([
            Math.cos(Math.rad(this.yaw)) * Math.cos(Math.rad(this.pitch)),
            Math.sin(Math.rad(this.pitch)),
            Math.sin(Math.rad(this.yaw)) * Math.cos(Math.rad(this.pitch))
        ]).normalize();
        this.right = this.front.cross(this.worldUp).normalize();
        this.up = this.right.cross(this.front).normalize();

        this._viewMatrix = Matrix4.lookAt(this._position, this._position.nadd(this.front), this.up);
    }

    public resize(nw: number, nh: number) {
        this.aspectRatio = nw / nh;
        this._projectionMatrix = Matrix4.perspective(this.fov, this.aspectRatio, this.near, this.far);
    }
}