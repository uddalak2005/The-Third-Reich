import { randomBytes, createHash } from 'node:crypto';

export type Shard = {
    index: number;
    value: bigint;
    hash: string;
};

/*
 * Mersenne prime (safe & common);
 */
const P = 2n ** 521n - 1n;

/*
 * Performing modular arithmetic
 * To fix negative remainders we add m
 * In JS it treats  (-3 % 5) as 3 mod 5, just the remainder takes sign of the dividend
 * But in modular arithmetic, -3 mod 5 is actually 2 because and not -3 because -3 = 5 * (-1) + "2"
 */
function mod(a: bigint, m: bigint = P): bigint {
    return ((a % m) + m) % m;
}

/*
 * Totally ChatGPT, This function finds the multiplicative inverse of a number in mod P space.
 * It uses fermat's Little theorem a ^ (P - 1) === 1 mod P
 * So a * a ^ (P - 2) === 1 mod P.
 * Hence a ^ (P - 2) is the multiplicative inverse of a.
 */
function modInverse(a: bigint, m: bigint = P): bigint {
    // Fermat's little theorem: a^(m-2) mod m
    let res = 1n;
    let base = a % m;
    let exp = m - 2n;
    while (exp > 0n) {
        if (exp % 2n === 1n) res = (res * base) % m;
        base = (base * base) % m;
        exp /= 2n;
    }
    return res;
}

function randomBigInt(): bigint {
    let n: bigint;
    do {
        n = BigInt('0x' + randomBytes(66).toString('hex')); // 66 bytes = 528 bits > 521
    } while (n >= P); // rejection sampling — ensure n < P
    return n;
}

export function split(
    secret: string,
    threshold: number = 3,
    total: number = 5,
): Shard[] {
    /*
     * Split the Secret into 5 shards and any 3 can reconstruct it
     */

    const secretBigInt = BigInt(
        '0x' + Buffer.from(secret, 'utf-8').toString('hex'),
    );

    if (secretBigInt >= P) throw new Error('Secret too large for prime field');

    // Generate Random Coefficients
    const coeff: bigint[] = [secretBigInt];

    for (let i = 1; i < threshold; i++) {
        coeff.push(randomBigInt());
    }

    // Calculation of shares
    const shards: Shard[] = [];

    for (let x = 1; x <= total; x++) {
        let y = 0n;

        for (let j = 0; j < coeff.length; j++) {
            y += coeff[j] * BigInt(x) ** BigInt(j);
        }

        const hash: string = createHash('sha256')
            .update(x.toString() + y.toString())
            .digest('hex');

        shards.push({ index: x, value: y, hash: hash });
    }

    console.log(shards);

    return shards;
}

export function reconstruct(shards: Shard[]): string {
    /*
     * Reconstruct secret from shards using simple Lagrange Interpolation
     */
    let secret: bigint = 0n;

    for (let i = 0; i < shards.length; i++) {
        const xi = BigInt(shards[i].index);
        const yi = BigInt(shards[i].value);

        let li = 1n;
        for (let j = 0; j < shards.length; j++) {
            if (i == j) {
                continue;
            }
            const xj = BigInt(shards[j].index);
            li = mod(li * mod(-xj) * modInverse(mod(xj - xi)));
        }

        secret = mod(secret + mod(yi * li));
    }

    // Convert back to String
    let hex = secret.toString(16);
    if (hex.length % 2 !== 0) {
        hex = '0' + hex;
    }
    return Buffer.from(hex, 'hex').toString('utf-8');
}

export function verifyShard(shard: Shard): boolean {
    /*
     * Verify a Shard by its Hash Value
     */
    const expected: string = createHash('sha256')
        .update(shard.index.toString() + shard.value.toString())
        .digest('hex');

    return expected === shard.hash;
}

//Example Usage
const apiKey = process.argv[2] || 'my-secret-api-key';
const shards: Shard[] = split(apiKey);
console.log(reconstruct(shards));
