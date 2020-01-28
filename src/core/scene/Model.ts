import { Mesh } from './Mesh';


export class Model {
    constructor(
        private name: string,
        public readonly meshes: Mesh[]
    ) {}
}