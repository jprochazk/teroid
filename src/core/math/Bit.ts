/**
 * Bit operations 
 */
export class Bit {

    private constructor() {}

    /**
     * Returns true if the nth most significant bit in number is not 0, false otherwise
     * @param {number} num number to test
     * @param {number} bit bit to test for
     */
    public static test(num: number, bit: number): boolean {
        return (num & (1 << bit)) !== 0;
    }

    public static set(num: number, bit: number): number {
        return (num | (1 << bit));
    }
}