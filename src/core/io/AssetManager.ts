import { AlreadyInitializedError } from './../debug/AlreadyInitializedError';
import { NotInitializedError } from '../debug/NotInitializedError';

export abstract class AssetManager {
    private static initialized: boolean;

    private static _basePath: string;
    private static loadedAssets: Map<string, any>;

    public static init(basePath?: string) {
        if(this.initialized) throw new AlreadyInitializedError(`Asset manager`);
        this.loadedAssets = new Map();

        this._basePath = basePath ?? "assets";
        
        this.initialized = true;
    }

    public static get basePath() { return this._basePath; }

    public static load(uri: string): Promise<any>;
    public static load<T>(uri: string, transform: (data: any) => T): Promise<T>;
    public static load<T>(uri: string, transform?: (data: any) => T): Promise<T | any> {
        if(!this.initialized) throw new NotInitializedError("Asset manager");


        return new Promise<T>((resolve, reject) => {
            
            uri = `${this._basePath}/${uri}`;

            if(this.loadedAssets.has(uri)) {
                resolve(this.loadedAssets.get(uri));
                return;
            }

            let request = new XMLHttpRequest();
            request.open('GET', uri);
            request.onreadystatechange = (e) => {
                if(request.readyState === XMLHttpRequest.DONE && request.status < 400) {
                    let response = (transform) ? transform(request.response) : request.response;
                    this.loadedAssets.set(uri, response);
                    resolve(response);
                } else if(request.readyState === XMLHttpRequest.DONE && request.status >= 400) {
                    reject(`Failed to load "${uri}" ${request.status} ${request.statusText} ${request.response}`);
                }
            }
            request.onerror = (e) => {
                reject(`Failed to load "${uri}" ${request.status} ${request.statusText} ${request.response}`);
            }
            request.send();
        });
    }
}