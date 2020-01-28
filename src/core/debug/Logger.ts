import { NotInitializedError } from './NotInitializedError';
import { AlreadyInitializedError } from './AlreadyInitializedError';

export enum DebugLevel {
    NONE = 0,
    INFO = 1,
    WARN = 2,
    ERROR = 3
}

export abstract class Logger {
    private static initialized: boolean;

    private static DEBUG_LEVEL: 0 | 1 | 2 | 3;

    public static init(debugLevel: 'none' | 'info' | 'warn' | 'error' = 'error') {
        if(this.initialized && true) throw new AlreadyInitializedError("Logger");
        switch(debugLevel) {
            case 'none': this.DEBUG_LEVEL = 0;
            case 'info': this.DEBUG_LEVEL = 1;
            case 'warn': this.DEBUG_LEVEL = 2;
            case 'error': this.DEBUG_LEVEL = 3;
        }

        this.initialized = true;
    }

    public static isDebugLevel(compOp: '>=' | '<=' | '>' | '<' | '==', value: 'none' | 'info' | 'warn' | 'error') {
        let dbglvl = 0;
        switch(value) {
            case 'none': dbglvl = 0;
            case 'info': dbglvl = 1;
            case 'warn': dbglvl = 2;
            case 'error': dbglvl = 3;
        }
        switch(compOp) {
            case '>=': return this.DEBUG_LEVEL >= dbglvl;
            case '<=': return this.DEBUG_LEVEL <= dbglvl;
            case '>': return this.DEBUG_LEVEL > dbglvl;
            case '<': return this.DEBUG_LEVEL < dbglvl;
            case '==': return this.DEBUG_LEVEL == dbglvl;
        }
    }

    public static setDebugLevel(debugLevel: 'none' | 'info' | 'warn' | 'error') {
        switch(debugLevel) {
            case 'none': Logger.DEBUG_LEVEL = 0;
            case 'info': Logger.DEBUG_LEVEL = 1;
            case 'warn': Logger.DEBUG_LEVEL = 2;
            case 'error': Logger.DEBUG_LEVEL = 3;
        }
    }

    public static get debugLevel(): 0 | 1 | 2 | 3 {
        return this.DEBUG_LEVEL;
    }

    public static info(...args: any[]) {
        if(!Logger.initialized) throw new NotInitializedError(`Logger`);
        if(Logger.DEBUG_LEVEL >= 1) {
            console.info(...args);
        }
    }

    public static warn(...args: any[]) {
        if(!Logger.initialized) throw new NotInitializedError(`Logger`);
        if(Logger.DEBUG_LEVEL >= 2) {
            console.warn(...args);
        }
    }

    public static error(...args: any[]) {
        if(!Logger.initialized) throw new NotInitializedError(`Logger`);
        if(Logger.DEBUG_LEVEL >= 3) {
            console.error(...args);
        }
    }
}