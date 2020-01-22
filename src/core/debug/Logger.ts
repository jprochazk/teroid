
export abstract class Logger {
    private static initialized: boolean;

    private static DEBUG_LEVEL: number;

    public static init(debugLevel: 'none' | 'info' | 'warn' | 'error' = 'error') {
        if(this.initialized && true) throw new Error(`Logger is already initialized!`);
        switch(debugLevel) {
            case 'none': this.DEBUG_LEVEL = 0;
            case 'info': this.DEBUG_LEVEL = 1;
            case 'warn': this.DEBUG_LEVEL = 2;
            case 'error': this.DEBUG_LEVEL = 3;
        }

        this.initialized = true;
    }

    public static setDebugLevel(debugLevel: 'none' | 'info' | 'warn' | 'error' = 'error') {
        switch(debugLevel) {
            case 'none': Logger.DEBUG_LEVEL = 0;
            case 'info': Logger.DEBUG_LEVEL = 1;
            case 'warn': Logger.DEBUG_LEVEL = 2;
            case 'error': Logger.DEBUG_LEVEL = 3;
        }
    }

    public static info(msg: string, ...args: any[]) {
        if(!Logger.initialized) throw new Error(`Logger is not initialized!`);
        if(Logger.DEBUG_LEVEL >= 1) {
            if(args.length > 0) console.info(msg, args);
            else console.info(msg);
        }
    }

    public static warn(msg: string, ...args: any[]) {
        if(!Logger.initialized) throw new Error(`Logger is not initialized!`);
        if(Logger.DEBUG_LEVEL >= 2) {
            if(args.length > 0) console.warn(msg, args);
            else console.warn(msg);
        }
    }

    public static error(msg: string, ...args: any[]) {
        if(!Logger.initialized) throw new Error(`Logger is not initialized!`);
        if(Logger.DEBUG_LEVEL >= 3) {
            if(args.length > 0) console.error(msg, args);
            else console.error(msg);
        }
    }
}