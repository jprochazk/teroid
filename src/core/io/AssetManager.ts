import { NotInitializedError } from '../debug/NotInitializedError';

export abstract class AssetManager {
    private static initialized: boolean;

    private static loadedAssets: Map<string, any>;

    public static init() {
        if(this.initialized) throw new Error(`Asset manager is already initialized!`);
        this.loadedAssets = new Map();
        
        this.initialized = true;
    }

    public static load(uri: string): Promise<any>;
    public static load<T>(uri: string, transform: (data: any) => T): Promise<T>;
    public static load<T>(uri: string, transform?: (data: any) => T): Promise<T | any> {
        if(!this.initialized) throw new NotInitializedError("Asset manager");

        if(this.loadedAssets.has(uri)) {
            return new Promise<T>(resolve => resolve(this.loadedAssets.get(uri)));
        }

        return new Promise<T>((resolve, reject) => {
            let request = new XMLHttpRequest();
            request.open('GET', uri);
            request.onreadystatechange = (e) => {
                if(request.readyState === XMLHttpRequest.DONE) {
                    let response = (transform) ? transform(request.response) : request.response;
                    this.loadedAssets.set(uri, response);
                    resolve(response);
                }
            }
            request.onerror = (e) => {
                reject(`Failed to load ${uri}, ${request.status} ${request.statusText} ${request.response}`);
            }
            request.send();
        });
    }
}