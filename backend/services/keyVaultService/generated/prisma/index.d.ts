
/**
 * Client
**/

import * as runtime from './runtime/client.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model HollowKey
 * 
 */
export type HollowKey = $Result.DefaultSelection<Prisma.$HollowKeyPayload>
/**
 * Model KeyShard
 * 
 */
export type KeyShard = $Result.DefaultSelection<Prisma.$KeyShardPayload>
/**
 * Model KeyEvent
 * 
 */
export type KeyEvent = $Result.DefaultSelection<Prisma.$KeyEventPayload>

/**
 * Enums
 */
export namespace $Enums {
  export const KeyStatus: {
  ACTIVE: 'ACTIVE',
  DEACTIVATED: 'DEACTIVATED',
  EXPIRED: 'EXPIRED'
};

export type KeyStatus = (typeof KeyStatus)[keyof typeof KeyStatus]

}

export type KeyStatus = $Enums.KeyStatus

export const KeyStatus: typeof $Enums.KeyStatus

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient({
 *   adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL })
 * })
 * // Fetch zero or more HollowKeys
 * const hollowKeys = await prisma.hollowKey.findMany()
 * ```
 *
 *
 * Read more in our [docs](https://pris.ly/d/client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  const U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   *
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient({
   *   adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL })
   * })
   * // Fetch zero or more HollowKeys
   * const hollowKeys = await prisma.hollowKey.findMany()
   * ```
   *
   *
   * Read more in our [docs](https://pris.ly/d/client).
   */

  constructor(optionsArg ?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): PrismaClient;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://pris.ly/d/raw-queries).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://pris.ly/d/raw-queries).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://pris.ly/d/raw-queries).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://pris.ly/d/raw-queries).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;


  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/orm/prisma-client/queries/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>

  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb<ClientOptions>, ExtArgs, $Utils.Call<Prisma.TypeMapCb<ClientOptions>, {
    extArgs: ExtArgs
  }>>

      /**
   * `prisma.hollowKey`: Exposes CRUD operations for the **HollowKey** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more HollowKeys
    * const hollowKeys = await prisma.hollowKey.findMany()
    * ```
    */
  get hollowKey(): Prisma.HollowKeyDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.keyShard`: Exposes CRUD operations for the **KeyShard** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more KeyShards
    * const keyShards = await prisma.keyShard.findMany()
    * ```
    */
  get keyShard(): Prisma.KeyShardDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.keyEvent`: Exposes CRUD operations for the **KeyEvent** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more KeyEvents
    * const keyEvents = await prisma.keyEvent.findMany()
    * ```
    */
  get keyEvent(): Prisma.KeyEventDelegate<ExtArgs, ClientOptions>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql



  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 7.5.0
   * Query Engine version: 280c870be64f457428992c43c1f6d557fab6e29e
   */
  export type PrismaVersion = {
    client: string
    engine: string
  }

  export const prismaVersion: PrismaVersion

  /**
   * Utility Types
   */


  export import Bytes = runtime.Bytes
  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? P : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
    HollowKey: 'HollowKey',
    KeyShard: 'KeyShard',
    KeyEvent: 'KeyEvent'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]



  interface TypeMapCb<ClientOptions = {}> extends $Utils.Fn<{extArgs: $Extensions.InternalArgs }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], ClientOptions extends { omit: infer OmitOptions } ? OmitOptions : {}>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> = {
    globalOmitOptions: {
      omit: GlobalOmitOptions
    }
    meta: {
      modelProps: "hollowKey" | "keyShard" | "keyEvent"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      HollowKey: {
        payload: Prisma.$HollowKeyPayload<ExtArgs>
        fields: Prisma.HollowKeyFieldRefs
        operations: {
          findUnique: {
            args: Prisma.HollowKeyFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$HollowKeyPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.HollowKeyFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$HollowKeyPayload>
          }
          findFirst: {
            args: Prisma.HollowKeyFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$HollowKeyPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.HollowKeyFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$HollowKeyPayload>
          }
          findMany: {
            args: Prisma.HollowKeyFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$HollowKeyPayload>[]
          }
          create: {
            args: Prisma.HollowKeyCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$HollowKeyPayload>
          }
          createMany: {
            args: Prisma.HollowKeyCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.HollowKeyCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$HollowKeyPayload>[]
          }
          delete: {
            args: Prisma.HollowKeyDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$HollowKeyPayload>
          }
          update: {
            args: Prisma.HollowKeyUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$HollowKeyPayload>
          }
          deleteMany: {
            args: Prisma.HollowKeyDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.HollowKeyUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.HollowKeyUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$HollowKeyPayload>[]
          }
          upsert: {
            args: Prisma.HollowKeyUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$HollowKeyPayload>
          }
          aggregate: {
            args: Prisma.HollowKeyAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateHollowKey>
          }
          groupBy: {
            args: Prisma.HollowKeyGroupByArgs<ExtArgs>
            result: $Utils.Optional<HollowKeyGroupByOutputType>[]
          }
          count: {
            args: Prisma.HollowKeyCountArgs<ExtArgs>
            result: $Utils.Optional<HollowKeyCountAggregateOutputType> | number
          }
        }
      }
      KeyShard: {
        payload: Prisma.$KeyShardPayload<ExtArgs>
        fields: Prisma.KeyShardFieldRefs
        operations: {
          findUnique: {
            args: Prisma.KeyShardFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$KeyShardPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.KeyShardFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$KeyShardPayload>
          }
          findFirst: {
            args: Prisma.KeyShardFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$KeyShardPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.KeyShardFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$KeyShardPayload>
          }
          findMany: {
            args: Prisma.KeyShardFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$KeyShardPayload>[]
          }
          create: {
            args: Prisma.KeyShardCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$KeyShardPayload>
          }
          createMany: {
            args: Prisma.KeyShardCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.KeyShardCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$KeyShardPayload>[]
          }
          delete: {
            args: Prisma.KeyShardDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$KeyShardPayload>
          }
          update: {
            args: Prisma.KeyShardUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$KeyShardPayload>
          }
          deleteMany: {
            args: Prisma.KeyShardDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.KeyShardUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.KeyShardUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$KeyShardPayload>[]
          }
          upsert: {
            args: Prisma.KeyShardUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$KeyShardPayload>
          }
          aggregate: {
            args: Prisma.KeyShardAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateKeyShard>
          }
          groupBy: {
            args: Prisma.KeyShardGroupByArgs<ExtArgs>
            result: $Utils.Optional<KeyShardGroupByOutputType>[]
          }
          count: {
            args: Prisma.KeyShardCountArgs<ExtArgs>
            result: $Utils.Optional<KeyShardCountAggregateOutputType> | number
          }
        }
      }
      KeyEvent: {
        payload: Prisma.$KeyEventPayload<ExtArgs>
        fields: Prisma.KeyEventFieldRefs
        operations: {
          findUnique: {
            args: Prisma.KeyEventFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$KeyEventPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.KeyEventFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$KeyEventPayload>
          }
          findFirst: {
            args: Prisma.KeyEventFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$KeyEventPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.KeyEventFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$KeyEventPayload>
          }
          findMany: {
            args: Prisma.KeyEventFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$KeyEventPayload>[]
          }
          create: {
            args: Prisma.KeyEventCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$KeyEventPayload>
          }
          createMany: {
            args: Prisma.KeyEventCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.KeyEventCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$KeyEventPayload>[]
          }
          delete: {
            args: Prisma.KeyEventDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$KeyEventPayload>
          }
          update: {
            args: Prisma.KeyEventUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$KeyEventPayload>
          }
          deleteMany: {
            args: Prisma.KeyEventDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.KeyEventUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.KeyEventUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$KeyEventPayload>[]
          }
          upsert: {
            args: Prisma.KeyEventUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$KeyEventPayload>
          }
          aggregate: {
            args: Prisma.KeyEventAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateKeyEvent>
          }
          groupBy: {
            args: Prisma.KeyEventGroupByArgs<ExtArgs>
            result: $Utils.Optional<KeyEventGroupByOutputType>[]
          }
          count: {
            args: Prisma.KeyEventCountArgs<ExtArgs>
            result: $Utils.Optional<KeyEventCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Shorthand for `emit: 'stdout'`
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events only
     * log: [
     *   { emit: 'event', level: 'query' },
     *   { emit: 'event', level: 'info' },
     *   { emit: 'event', level: 'warn' }
     *   { emit: 'event', level: 'error' }
     * ]
     * 
     * / Emit as events and log to stdout
     * og: [
     *  { emit: 'stdout', level: 'query' },
     *  { emit: 'stdout', level: 'info' },
     *  { emit: 'stdout', level: 'warn' }
     *  { emit: 'stdout', level: 'error' }
     * 
     * ```
     * Read more in our [docs](https://pris.ly/d/logging).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
    /**
     * Instance of a Driver Adapter, e.g., like one provided by `@prisma/adapter-planetscale`
     */
    adapter?: runtime.SqlDriverAdapterFactory
    /**
     * Prisma Accelerate URL allowing the client to connect through Accelerate instead of a direct database.
     */
    accelerateUrl?: string
    /**
     * Global configuration for omitting model fields by default.
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   omit: {
     *     user: {
     *       password: true
     *     }
     *   }
     * })
     * ```
     */
    omit?: Prisma.GlobalOmitConfig
    /**
     * SQL commenter plugins that add metadata to SQL queries as comments.
     * Comments follow the sqlcommenter format: https://google.github.io/sqlcommenter/
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   adapter,
     *   comments: [
     *     traceContext(),
     *     queryInsights(),
     *   ],
     * })
     * ```
     */
    comments?: runtime.SqlCommenterPlugin[]
  }
  export type GlobalOmitConfig = {
    hollowKey?: HollowKeyOmit
    keyShard?: KeyShardOmit
    keyEvent?: KeyEventOmit
  }

  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type CheckIsLogLevel<T> = T extends LogLevel ? T : never;

  export type GetLogType<T> = CheckIsLogLevel<
    T extends LogDefinition ? T['level'] : T
  >;

  export type GetEvents<T extends any[]> = T extends Array<LogLevel | LogDefinition>
    ? GetLogType<T[number]>
    : never;

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'updateManyAndReturn'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */


  /**
   * Count Type HollowKeyCountOutputType
   */

  export type HollowKeyCountOutputType = {
    shards: number
    events: number
  }

  export type HollowKeyCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    shards?: boolean | HollowKeyCountOutputTypeCountShardsArgs
    events?: boolean | HollowKeyCountOutputTypeCountEventsArgs
  }

  // Custom InputTypes
  /**
   * HollowKeyCountOutputType without action
   */
  export type HollowKeyCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the HollowKeyCountOutputType
     */
    select?: HollowKeyCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * HollowKeyCountOutputType without action
   */
  export type HollowKeyCountOutputTypeCountShardsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: KeyShardWhereInput
  }

  /**
   * HollowKeyCountOutputType without action
   */
  export type HollowKeyCountOutputTypeCountEventsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: KeyEventWhereInput
  }


  /**
   * Models
   */

  /**
   * Model HollowKey
   */

  export type AggregateHollowKey = {
    _count: HollowKeyCountAggregateOutputType | null
    _avg: HollowKeyAvgAggregateOutputType | null
    _sum: HollowKeySumAggregateOutputType | null
    _min: HollowKeyMinAggregateOutputType | null
    _max: HollowKeyMaxAggregateOutputType | null
  }

  export type HollowKeyAvgAggregateOutputType = {
    timesUsed: number | null
  }

  export type HollowKeySumAggregateOutputType = {
    timesUsed: number | null
  }

  export type HollowKeyMinAggregateOutputType = {
    id: string | null
    userId: string | null
    name: string | null
    agentId: string | null
    agentName: string | null
    provider: string | null
    allowedIntent: string | null
    status: $Enums.KeyStatus | null
    timesUsed: number | null
    lastUsedAt: Date | null
    expiresAt: Date | null
    createdAt: Date | null
  }

  export type HollowKeyMaxAggregateOutputType = {
    id: string | null
    userId: string | null
    name: string | null
    agentId: string | null
    agentName: string | null
    provider: string | null
    allowedIntent: string | null
    status: $Enums.KeyStatus | null
    timesUsed: number | null
    lastUsedAt: Date | null
    expiresAt: Date | null
    createdAt: Date | null
  }

  export type HollowKeyCountAggregateOutputType = {
    id: number
    userId: number
    name: number
    agentId: number
    agentName: number
    provider: number
    allowedIntent: number
    status: number
    timesUsed: number
    lastUsedAt: number
    expiresAt: number
    createdAt: number
    _all: number
  }


  export type HollowKeyAvgAggregateInputType = {
    timesUsed?: true
  }

  export type HollowKeySumAggregateInputType = {
    timesUsed?: true
  }

  export type HollowKeyMinAggregateInputType = {
    id?: true
    userId?: true
    name?: true
    agentId?: true
    agentName?: true
    provider?: true
    allowedIntent?: true
    status?: true
    timesUsed?: true
    lastUsedAt?: true
    expiresAt?: true
    createdAt?: true
  }

  export type HollowKeyMaxAggregateInputType = {
    id?: true
    userId?: true
    name?: true
    agentId?: true
    agentName?: true
    provider?: true
    allowedIntent?: true
    status?: true
    timesUsed?: true
    lastUsedAt?: true
    expiresAt?: true
    createdAt?: true
  }

  export type HollowKeyCountAggregateInputType = {
    id?: true
    userId?: true
    name?: true
    agentId?: true
    agentName?: true
    provider?: true
    allowedIntent?: true
    status?: true
    timesUsed?: true
    lastUsedAt?: true
    expiresAt?: true
    createdAt?: true
    _all?: true
  }

  export type HollowKeyAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which HollowKey to aggregate.
     */
    where?: HollowKeyWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of HollowKeys to fetch.
     */
    orderBy?: HollowKeyOrderByWithRelationInput | HollowKeyOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: HollowKeyWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` HollowKeys from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` HollowKeys.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned HollowKeys
    **/
    _count?: true | HollowKeyCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: HollowKeyAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: HollowKeySumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: HollowKeyMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: HollowKeyMaxAggregateInputType
  }

  export type GetHollowKeyAggregateType<T extends HollowKeyAggregateArgs> = {
        [P in keyof T & keyof AggregateHollowKey]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateHollowKey[P]>
      : GetScalarType<T[P], AggregateHollowKey[P]>
  }




  export type HollowKeyGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: HollowKeyWhereInput
    orderBy?: HollowKeyOrderByWithAggregationInput | HollowKeyOrderByWithAggregationInput[]
    by: HollowKeyScalarFieldEnum[] | HollowKeyScalarFieldEnum
    having?: HollowKeyScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: HollowKeyCountAggregateInputType | true
    _avg?: HollowKeyAvgAggregateInputType
    _sum?: HollowKeySumAggregateInputType
    _min?: HollowKeyMinAggregateInputType
    _max?: HollowKeyMaxAggregateInputType
  }

  export type HollowKeyGroupByOutputType = {
    id: string
    userId: string
    name: string
    agentId: string
    agentName: string
    provider: string
    allowedIntent: string
    status: $Enums.KeyStatus
    timesUsed: number
    lastUsedAt: Date
    expiresAt: Date | null
    createdAt: Date
    _count: HollowKeyCountAggregateOutputType | null
    _avg: HollowKeyAvgAggregateOutputType | null
    _sum: HollowKeySumAggregateOutputType | null
    _min: HollowKeyMinAggregateOutputType | null
    _max: HollowKeyMaxAggregateOutputType | null
  }

  type GetHollowKeyGroupByPayload<T extends HollowKeyGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<HollowKeyGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof HollowKeyGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], HollowKeyGroupByOutputType[P]>
            : GetScalarType<T[P], HollowKeyGroupByOutputType[P]>
        }
      >
    >


  export type HollowKeySelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    name?: boolean
    agentId?: boolean
    agentName?: boolean
    provider?: boolean
    allowedIntent?: boolean
    status?: boolean
    timesUsed?: boolean
    lastUsedAt?: boolean
    expiresAt?: boolean
    createdAt?: boolean
    shards?: boolean | HollowKey$shardsArgs<ExtArgs>
    events?: boolean | HollowKey$eventsArgs<ExtArgs>
    _count?: boolean | HollowKeyCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["hollowKey"]>

  export type HollowKeySelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    name?: boolean
    agentId?: boolean
    agentName?: boolean
    provider?: boolean
    allowedIntent?: boolean
    status?: boolean
    timesUsed?: boolean
    lastUsedAt?: boolean
    expiresAt?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["hollowKey"]>

  export type HollowKeySelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    name?: boolean
    agentId?: boolean
    agentName?: boolean
    provider?: boolean
    allowedIntent?: boolean
    status?: boolean
    timesUsed?: boolean
    lastUsedAt?: boolean
    expiresAt?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["hollowKey"]>

  export type HollowKeySelectScalar = {
    id?: boolean
    userId?: boolean
    name?: boolean
    agentId?: boolean
    agentName?: boolean
    provider?: boolean
    allowedIntent?: boolean
    status?: boolean
    timesUsed?: boolean
    lastUsedAt?: boolean
    expiresAt?: boolean
    createdAt?: boolean
  }

  export type HollowKeyOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "userId" | "name" | "agentId" | "agentName" | "provider" | "allowedIntent" | "status" | "timesUsed" | "lastUsedAt" | "expiresAt" | "createdAt", ExtArgs["result"]["hollowKey"]>
  export type HollowKeyInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    shards?: boolean | HollowKey$shardsArgs<ExtArgs>
    events?: boolean | HollowKey$eventsArgs<ExtArgs>
    _count?: boolean | HollowKeyCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type HollowKeyIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type HollowKeyIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $HollowKeyPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "HollowKey"
    objects: {
      shards: Prisma.$KeyShardPayload<ExtArgs>[]
      events: Prisma.$KeyEventPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      userId: string
      name: string
      agentId: string
      agentName: string
      provider: string
      allowedIntent: string
      status: $Enums.KeyStatus
      timesUsed: number
      lastUsedAt: Date
      expiresAt: Date | null
      createdAt: Date
    }, ExtArgs["result"]["hollowKey"]>
    composites: {}
  }

  type HollowKeyGetPayload<S extends boolean | null | undefined | HollowKeyDefaultArgs> = $Result.GetResult<Prisma.$HollowKeyPayload, S>

  type HollowKeyCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<HollowKeyFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: HollowKeyCountAggregateInputType | true
    }

  export interface HollowKeyDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['HollowKey'], meta: { name: 'HollowKey' } }
    /**
     * Find zero or one HollowKey that matches the filter.
     * @param {HollowKeyFindUniqueArgs} args - Arguments to find a HollowKey
     * @example
     * // Get one HollowKey
     * const hollowKey = await prisma.hollowKey.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends HollowKeyFindUniqueArgs>(args: SelectSubset<T, HollowKeyFindUniqueArgs<ExtArgs>>): Prisma__HollowKeyClient<$Result.GetResult<Prisma.$HollowKeyPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one HollowKey that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {HollowKeyFindUniqueOrThrowArgs} args - Arguments to find a HollowKey
     * @example
     * // Get one HollowKey
     * const hollowKey = await prisma.hollowKey.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends HollowKeyFindUniqueOrThrowArgs>(args: SelectSubset<T, HollowKeyFindUniqueOrThrowArgs<ExtArgs>>): Prisma__HollowKeyClient<$Result.GetResult<Prisma.$HollowKeyPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first HollowKey that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {HollowKeyFindFirstArgs} args - Arguments to find a HollowKey
     * @example
     * // Get one HollowKey
     * const hollowKey = await prisma.hollowKey.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends HollowKeyFindFirstArgs>(args?: SelectSubset<T, HollowKeyFindFirstArgs<ExtArgs>>): Prisma__HollowKeyClient<$Result.GetResult<Prisma.$HollowKeyPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first HollowKey that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {HollowKeyFindFirstOrThrowArgs} args - Arguments to find a HollowKey
     * @example
     * // Get one HollowKey
     * const hollowKey = await prisma.hollowKey.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends HollowKeyFindFirstOrThrowArgs>(args?: SelectSubset<T, HollowKeyFindFirstOrThrowArgs<ExtArgs>>): Prisma__HollowKeyClient<$Result.GetResult<Prisma.$HollowKeyPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more HollowKeys that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {HollowKeyFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all HollowKeys
     * const hollowKeys = await prisma.hollowKey.findMany()
     * 
     * // Get first 10 HollowKeys
     * const hollowKeys = await prisma.hollowKey.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const hollowKeyWithIdOnly = await prisma.hollowKey.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends HollowKeyFindManyArgs>(args?: SelectSubset<T, HollowKeyFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$HollowKeyPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a HollowKey.
     * @param {HollowKeyCreateArgs} args - Arguments to create a HollowKey.
     * @example
     * // Create one HollowKey
     * const HollowKey = await prisma.hollowKey.create({
     *   data: {
     *     // ... data to create a HollowKey
     *   }
     * })
     * 
     */
    create<T extends HollowKeyCreateArgs>(args: SelectSubset<T, HollowKeyCreateArgs<ExtArgs>>): Prisma__HollowKeyClient<$Result.GetResult<Prisma.$HollowKeyPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many HollowKeys.
     * @param {HollowKeyCreateManyArgs} args - Arguments to create many HollowKeys.
     * @example
     * // Create many HollowKeys
     * const hollowKey = await prisma.hollowKey.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends HollowKeyCreateManyArgs>(args?: SelectSubset<T, HollowKeyCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many HollowKeys and returns the data saved in the database.
     * @param {HollowKeyCreateManyAndReturnArgs} args - Arguments to create many HollowKeys.
     * @example
     * // Create many HollowKeys
     * const hollowKey = await prisma.hollowKey.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many HollowKeys and only return the `id`
     * const hollowKeyWithIdOnly = await prisma.hollowKey.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends HollowKeyCreateManyAndReturnArgs>(args?: SelectSubset<T, HollowKeyCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$HollowKeyPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a HollowKey.
     * @param {HollowKeyDeleteArgs} args - Arguments to delete one HollowKey.
     * @example
     * // Delete one HollowKey
     * const HollowKey = await prisma.hollowKey.delete({
     *   where: {
     *     // ... filter to delete one HollowKey
     *   }
     * })
     * 
     */
    delete<T extends HollowKeyDeleteArgs>(args: SelectSubset<T, HollowKeyDeleteArgs<ExtArgs>>): Prisma__HollowKeyClient<$Result.GetResult<Prisma.$HollowKeyPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one HollowKey.
     * @param {HollowKeyUpdateArgs} args - Arguments to update one HollowKey.
     * @example
     * // Update one HollowKey
     * const hollowKey = await prisma.hollowKey.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends HollowKeyUpdateArgs>(args: SelectSubset<T, HollowKeyUpdateArgs<ExtArgs>>): Prisma__HollowKeyClient<$Result.GetResult<Prisma.$HollowKeyPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more HollowKeys.
     * @param {HollowKeyDeleteManyArgs} args - Arguments to filter HollowKeys to delete.
     * @example
     * // Delete a few HollowKeys
     * const { count } = await prisma.hollowKey.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends HollowKeyDeleteManyArgs>(args?: SelectSubset<T, HollowKeyDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more HollowKeys.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {HollowKeyUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many HollowKeys
     * const hollowKey = await prisma.hollowKey.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends HollowKeyUpdateManyArgs>(args: SelectSubset<T, HollowKeyUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more HollowKeys and returns the data updated in the database.
     * @param {HollowKeyUpdateManyAndReturnArgs} args - Arguments to update many HollowKeys.
     * @example
     * // Update many HollowKeys
     * const hollowKey = await prisma.hollowKey.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more HollowKeys and only return the `id`
     * const hollowKeyWithIdOnly = await prisma.hollowKey.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends HollowKeyUpdateManyAndReturnArgs>(args: SelectSubset<T, HollowKeyUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$HollowKeyPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one HollowKey.
     * @param {HollowKeyUpsertArgs} args - Arguments to update or create a HollowKey.
     * @example
     * // Update or create a HollowKey
     * const hollowKey = await prisma.hollowKey.upsert({
     *   create: {
     *     // ... data to create a HollowKey
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the HollowKey we want to update
     *   }
     * })
     */
    upsert<T extends HollowKeyUpsertArgs>(args: SelectSubset<T, HollowKeyUpsertArgs<ExtArgs>>): Prisma__HollowKeyClient<$Result.GetResult<Prisma.$HollowKeyPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of HollowKeys.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {HollowKeyCountArgs} args - Arguments to filter HollowKeys to count.
     * @example
     * // Count the number of HollowKeys
     * const count = await prisma.hollowKey.count({
     *   where: {
     *     // ... the filter for the HollowKeys we want to count
     *   }
     * })
    **/
    count<T extends HollowKeyCountArgs>(
      args?: Subset<T, HollowKeyCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], HollowKeyCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a HollowKey.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {HollowKeyAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends HollowKeyAggregateArgs>(args: Subset<T, HollowKeyAggregateArgs>): Prisma.PrismaPromise<GetHollowKeyAggregateType<T>>

    /**
     * Group by HollowKey.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {HollowKeyGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends HollowKeyGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: HollowKeyGroupByArgs['orderBy'] }
        : { orderBy?: HollowKeyGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, HollowKeyGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetHollowKeyGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the HollowKey model
   */
  readonly fields: HollowKeyFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for HollowKey.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__HollowKeyClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    shards<T extends HollowKey$shardsArgs<ExtArgs> = {}>(args?: Subset<T, HollowKey$shardsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$KeyShardPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    events<T extends HollowKey$eventsArgs<ExtArgs> = {}>(args?: Subset<T, HollowKey$eventsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$KeyEventPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the HollowKey model
   */
  interface HollowKeyFieldRefs {
    readonly id: FieldRef<"HollowKey", 'String'>
    readonly userId: FieldRef<"HollowKey", 'String'>
    readonly name: FieldRef<"HollowKey", 'String'>
    readonly agentId: FieldRef<"HollowKey", 'String'>
    readonly agentName: FieldRef<"HollowKey", 'String'>
    readonly provider: FieldRef<"HollowKey", 'String'>
    readonly allowedIntent: FieldRef<"HollowKey", 'String'>
    readonly status: FieldRef<"HollowKey", 'KeyStatus'>
    readonly timesUsed: FieldRef<"HollowKey", 'Int'>
    readonly lastUsedAt: FieldRef<"HollowKey", 'DateTime'>
    readonly expiresAt: FieldRef<"HollowKey", 'DateTime'>
    readonly createdAt: FieldRef<"HollowKey", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * HollowKey findUnique
   */
  export type HollowKeyFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the HollowKey
     */
    select?: HollowKeySelect<ExtArgs> | null
    /**
     * Omit specific fields from the HollowKey
     */
    omit?: HollowKeyOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: HollowKeyInclude<ExtArgs> | null
    /**
     * Filter, which HollowKey to fetch.
     */
    where: HollowKeyWhereUniqueInput
  }

  /**
   * HollowKey findUniqueOrThrow
   */
  export type HollowKeyFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the HollowKey
     */
    select?: HollowKeySelect<ExtArgs> | null
    /**
     * Omit specific fields from the HollowKey
     */
    omit?: HollowKeyOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: HollowKeyInclude<ExtArgs> | null
    /**
     * Filter, which HollowKey to fetch.
     */
    where: HollowKeyWhereUniqueInput
  }

  /**
   * HollowKey findFirst
   */
  export type HollowKeyFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the HollowKey
     */
    select?: HollowKeySelect<ExtArgs> | null
    /**
     * Omit specific fields from the HollowKey
     */
    omit?: HollowKeyOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: HollowKeyInclude<ExtArgs> | null
    /**
     * Filter, which HollowKey to fetch.
     */
    where?: HollowKeyWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of HollowKeys to fetch.
     */
    orderBy?: HollowKeyOrderByWithRelationInput | HollowKeyOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for HollowKeys.
     */
    cursor?: HollowKeyWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` HollowKeys from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` HollowKeys.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of HollowKeys.
     */
    distinct?: HollowKeyScalarFieldEnum | HollowKeyScalarFieldEnum[]
  }

  /**
   * HollowKey findFirstOrThrow
   */
  export type HollowKeyFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the HollowKey
     */
    select?: HollowKeySelect<ExtArgs> | null
    /**
     * Omit specific fields from the HollowKey
     */
    omit?: HollowKeyOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: HollowKeyInclude<ExtArgs> | null
    /**
     * Filter, which HollowKey to fetch.
     */
    where?: HollowKeyWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of HollowKeys to fetch.
     */
    orderBy?: HollowKeyOrderByWithRelationInput | HollowKeyOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for HollowKeys.
     */
    cursor?: HollowKeyWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` HollowKeys from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` HollowKeys.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of HollowKeys.
     */
    distinct?: HollowKeyScalarFieldEnum | HollowKeyScalarFieldEnum[]
  }

  /**
   * HollowKey findMany
   */
  export type HollowKeyFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the HollowKey
     */
    select?: HollowKeySelect<ExtArgs> | null
    /**
     * Omit specific fields from the HollowKey
     */
    omit?: HollowKeyOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: HollowKeyInclude<ExtArgs> | null
    /**
     * Filter, which HollowKeys to fetch.
     */
    where?: HollowKeyWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of HollowKeys to fetch.
     */
    orderBy?: HollowKeyOrderByWithRelationInput | HollowKeyOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing HollowKeys.
     */
    cursor?: HollowKeyWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` HollowKeys from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` HollowKeys.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of HollowKeys.
     */
    distinct?: HollowKeyScalarFieldEnum | HollowKeyScalarFieldEnum[]
  }

  /**
   * HollowKey create
   */
  export type HollowKeyCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the HollowKey
     */
    select?: HollowKeySelect<ExtArgs> | null
    /**
     * Omit specific fields from the HollowKey
     */
    omit?: HollowKeyOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: HollowKeyInclude<ExtArgs> | null
    /**
     * The data needed to create a HollowKey.
     */
    data: XOR<HollowKeyCreateInput, HollowKeyUncheckedCreateInput>
  }

  /**
   * HollowKey createMany
   */
  export type HollowKeyCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many HollowKeys.
     */
    data: HollowKeyCreateManyInput | HollowKeyCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * HollowKey createManyAndReturn
   */
  export type HollowKeyCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the HollowKey
     */
    select?: HollowKeySelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the HollowKey
     */
    omit?: HollowKeyOmit<ExtArgs> | null
    /**
     * The data used to create many HollowKeys.
     */
    data: HollowKeyCreateManyInput | HollowKeyCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * HollowKey update
   */
  export type HollowKeyUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the HollowKey
     */
    select?: HollowKeySelect<ExtArgs> | null
    /**
     * Omit specific fields from the HollowKey
     */
    omit?: HollowKeyOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: HollowKeyInclude<ExtArgs> | null
    /**
     * The data needed to update a HollowKey.
     */
    data: XOR<HollowKeyUpdateInput, HollowKeyUncheckedUpdateInput>
    /**
     * Choose, which HollowKey to update.
     */
    where: HollowKeyWhereUniqueInput
  }

  /**
   * HollowKey updateMany
   */
  export type HollowKeyUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update HollowKeys.
     */
    data: XOR<HollowKeyUpdateManyMutationInput, HollowKeyUncheckedUpdateManyInput>
    /**
     * Filter which HollowKeys to update
     */
    where?: HollowKeyWhereInput
    /**
     * Limit how many HollowKeys to update.
     */
    limit?: number
  }

  /**
   * HollowKey updateManyAndReturn
   */
  export type HollowKeyUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the HollowKey
     */
    select?: HollowKeySelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the HollowKey
     */
    omit?: HollowKeyOmit<ExtArgs> | null
    /**
     * The data used to update HollowKeys.
     */
    data: XOR<HollowKeyUpdateManyMutationInput, HollowKeyUncheckedUpdateManyInput>
    /**
     * Filter which HollowKeys to update
     */
    where?: HollowKeyWhereInput
    /**
     * Limit how many HollowKeys to update.
     */
    limit?: number
  }

  /**
   * HollowKey upsert
   */
  export type HollowKeyUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the HollowKey
     */
    select?: HollowKeySelect<ExtArgs> | null
    /**
     * Omit specific fields from the HollowKey
     */
    omit?: HollowKeyOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: HollowKeyInclude<ExtArgs> | null
    /**
     * The filter to search for the HollowKey to update in case it exists.
     */
    where: HollowKeyWhereUniqueInput
    /**
     * In case the HollowKey found by the `where` argument doesn't exist, create a new HollowKey with this data.
     */
    create: XOR<HollowKeyCreateInput, HollowKeyUncheckedCreateInput>
    /**
     * In case the HollowKey was found with the provided `where` argument, update it with this data.
     */
    update: XOR<HollowKeyUpdateInput, HollowKeyUncheckedUpdateInput>
  }

  /**
   * HollowKey delete
   */
  export type HollowKeyDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the HollowKey
     */
    select?: HollowKeySelect<ExtArgs> | null
    /**
     * Omit specific fields from the HollowKey
     */
    omit?: HollowKeyOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: HollowKeyInclude<ExtArgs> | null
    /**
     * Filter which HollowKey to delete.
     */
    where: HollowKeyWhereUniqueInput
  }

  /**
   * HollowKey deleteMany
   */
  export type HollowKeyDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which HollowKeys to delete
     */
    where?: HollowKeyWhereInput
    /**
     * Limit how many HollowKeys to delete.
     */
    limit?: number
  }

  /**
   * HollowKey.shards
   */
  export type HollowKey$shardsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the KeyShard
     */
    select?: KeyShardSelect<ExtArgs> | null
    /**
     * Omit specific fields from the KeyShard
     */
    omit?: KeyShardOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: KeyShardInclude<ExtArgs> | null
    where?: KeyShardWhereInput
    orderBy?: KeyShardOrderByWithRelationInput | KeyShardOrderByWithRelationInput[]
    cursor?: KeyShardWhereUniqueInput
    take?: number
    skip?: number
    distinct?: KeyShardScalarFieldEnum | KeyShardScalarFieldEnum[]
  }

  /**
   * HollowKey.events
   */
  export type HollowKey$eventsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the KeyEvent
     */
    select?: KeyEventSelect<ExtArgs> | null
    /**
     * Omit specific fields from the KeyEvent
     */
    omit?: KeyEventOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: KeyEventInclude<ExtArgs> | null
    where?: KeyEventWhereInput
    orderBy?: KeyEventOrderByWithRelationInput | KeyEventOrderByWithRelationInput[]
    cursor?: KeyEventWhereUniqueInput
    take?: number
    skip?: number
    distinct?: KeyEventScalarFieldEnum | KeyEventScalarFieldEnum[]
  }

  /**
   * HollowKey without action
   */
  export type HollowKeyDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the HollowKey
     */
    select?: HollowKeySelect<ExtArgs> | null
    /**
     * Omit specific fields from the HollowKey
     */
    omit?: HollowKeyOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: HollowKeyInclude<ExtArgs> | null
  }


  /**
   * Model KeyShard
   */

  export type AggregateKeyShard = {
    _count: KeyShardCountAggregateOutputType | null
    _avg: KeyShardAvgAggregateOutputType | null
    _sum: KeyShardSumAggregateOutputType | null
    _min: KeyShardMinAggregateOutputType | null
    _max: KeyShardMaxAggregateOutputType | null
  }

  export type KeyShardAvgAggregateOutputType = {
    shardIndex: number | null
  }

  export type KeyShardSumAggregateOutputType = {
    shardIndex: number | null
  }

  export type KeyShardMinAggregateOutputType = {
    id: string | null
    hollowKeyId: string | null
    shardIndex: number | null
    vaultLocation: string | null
    shardHash: string | null
    createdAt: Date | null
  }

  export type KeyShardMaxAggregateOutputType = {
    id: string | null
    hollowKeyId: string | null
    shardIndex: number | null
    vaultLocation: string | null
    shardHash: string | null
    createdAt: Date | null
  }

  export type KeyShardCountAggregateOutputType = {
    id: number
    hollowKeyId: number
    shardIndex: number
    vaultLocation: number
    shardHash: number
    createdAt: number
    _all: number
  }


  export type KeyShardAvgAggregateInputType = {
    shardIndex?: true
  }

  export type KeyShardSumAggregateInputType = {
    shardIndex?: true
  }

  export type KeyShardMinAggregateInputType = {
    id?: true
    hollowKeyId?: true
    shardIndex?: true
    vaultLocation?: true
    shardHash?: true
    createdAt?: true
  }

  export type KeyShardMaxAggregateInputType = {
    id?: true
    hollowKeyId?: true
    shardIndex?: true
    vaultLocation?: true
    shardHash?: true
    createdAt?: true
  }

  export type KeyShardCountAggregateInputType = {
    id?: true
    hollowKeyId?: true
    shardIndex?: true
    vaultLocation?: true
    shardHash?: true
    createdAt?: true
    _all?: true
  }

  export type KeyShardAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which KeyShard to aggregate.
     */
    where?: KeyShardWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of KeyShards to fetch.
     */
    orderBy?: KeyShardOrderByWithRelationInput | KeyShardOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: KeyShardWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` KeyShards from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` KeyShards.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned KeyShards
    **/
    _count?: true | KeyShardCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: KeyShardAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: KeyShardSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: KeyShardMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: KeyShardMaxAggregateInputType
  }

  export type GetKeyShardAggregateType<T extends KeyShardAggregateArgs> = {
        [P in keyof T & keyof AggregateKeyShard]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateKeyShard[P]>
      : GetScalarType<T[P], AggregateKeyShard[P]>
  }




  export type KeyShardGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: KeyShardWhereInput
    orderBy?: KeyShardOrderByWithAggregationInput | KeyShardOrderByWithAggregationInput[]
    by: KeyShardScalarFieldEnum[] | KeyShardScalarFieldEnum
    having?: KeyShardScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: KeyShardCountAggregateInputType | true
    _avg?: KeyShardAvgAggregateInputType
    _sum?: KeyShardSumAggregateInputType
    _min?: KeyShardMinAggregateInputType
    _max?: KeyShardMaxAggregateInputType
  }

  export type KeyShardGroupByOutputType = {
    id: string
    hollowKeyId: string
    shardIndex: number
    vaultLocation: string
    shardHash: string
    createdAt: Date
    _count: KeyShardCountAggregateOutputType | null
    _avg: KeyShardAvgAggregateOutputType | null
    _sum: KeyShardSumAggregateOutputType | null
    _min: KeyShardMinAggregateOutputType | null
    _max: KeyShardMaxAggregateOutputType | null
  }

  type GetKeyShardGroupByPayload<T extends KeyShardGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<KeyShardGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof KeyShardGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], KeyShardGroupByOutputType[P]>
            : GetScalarType<T[P], KeyShardGroupByOutputType[P]>
        }
      >
    >


  export type KeyShardSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    hollowKeyId?: boolean
    shardIndex?: boolean
    vaultLocation?: boolean
    shardHash?: boolean
    createdAt?: boolean
    hollowKey?: boolean | HollowKeyDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["keyShard"]>

  export type KeyShardSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    hollowKeyId?: boolean
    shardIndex?: boolean
    vaultLocation?: boolean
    shardHash?: boolean
    createdAt?: boolean
    hollowKey?: boolean | HollowKeyDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["keyShard"]>

  export type KeyShardSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    hollowKeyId?: boolean
    shardIndex?: boolean
    vaultLocation?: boolean
    shardHash?: boolean
    createdAt?: boolean
    hollowKey?: boolean | HollowKeyDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["keyShard"]>

  export type KeyShardSelectScalar = {
    id?: boolean
    hollowKeyId?: boolean
    shardIndex?: boolean
    vaultLocation?: boolean
    shardHash?: boolean
    createdAt?: boolean
  }

  export type KeyShardOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "hollowKeyId" | "shardIndex" | "vaultLocation" | "shardHash" | "createdAt", ExtArgs["result"]["keyShard"]>
  export type KeyShardInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    hollowKey?: boolean | HollowKeyDefaultArgs<ExtArgs>
  }
  export type KeyShardIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    hollowKey?: boolean | HollowKeyDefaultArgs<ExtArgs>
  }
  export type KeyShardIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    hollowKey?: boolean | HollowKeyDefaultArgs<ExtArgs>
  }

  export type $KeyShardPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "KeyShard"
    objects: {
      hollowKey: Prisma.$HollowKeyPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      hollowKeyId: string
      shardIndex: number
      vaultLocation: string
      shardHash: string
      createdAt: Date
    }, ExtArgs["result"]["keyShard"]>
    composites: {}
  }

  type KeyShardGetPayload<S extends boolean | null | undefined | KeyShardDefaultArgs> = $Result.GetResult<Prisma.$KeyShardPayload, S>

  type KeyShardCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<KeyShardFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: KeyShardCountAggregateInputType | true
    }

  export interface KeyShardDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['KeyShard'], meta: { name: 'KeyShard' } }
    /**
     * Find zero or one KeyShard that matches the filter.
     * @param {KeyShardFindUniqueArgs} args - Arguments to find a KeyShard
     * @example
     * // Get one KeyShard
     * const keyShard = await prisma.keyShard.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends KeyShardFindUniqueArgs>(args: SelectSubset<T, KeyShardFindUniqueArgs<ExtArgs>>): Prisma__KeyShardClient<$Result.GetResult<Prisma.$KeyShardPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one KeyShard that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {KeyShardFindUniqueOrThrowArgs} args - Arguments to find a KeyShard
     * @example
     * // Get one KeyShard
     * const keyShard = await prisma.keyShard.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends KeyShardFindUniqueOrThrowArgs>(args: SelectSubset<T, KeyShardFindUniqueOrThrowArgs<ExtArgs>>): Prisma__KeyShardClient<$Result.GetResult<Prisma.$KeyShardPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first KeyShard that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {KeyShardFindFirstArgs} args - Arguments to find a KeyShard
     * @example
     * // Get one KeyShard
     * const keyShard = await prisma.keyShard.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends KeyShardFindFirstArgs>(args?: SelectSubset<T, KeyShardFindFirstArgs<ExtArgs>>): Prisma__KeyShardClient<$Result.GetResult<Prisma.$KeyShardPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first KeyShard that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {KeyShardFindFirstOrThrowArgs} args - Arguments to find a KeyShard
     * @example
     * // Get one KeyShard
     * const keyShard = await prisma.keyShard.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends KeyShardFindFirstOrThrowArgs>(args?: SelectSubset<T, KeyShardFindFirstOrThrowArgs<ExtArgs>>): Prisma__KeyShardClient<$Result.GetResult<Prisma.$KeyShardPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more KeyShards that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {KeyShardFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all KeyShards
     * const keyShards = await prisma.keyShard.findMany()
     * 
     * // Get first 10 KeyShards
     * const keyShards = await prisma.keyShard.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const keyShardWithIdOnly = await prisma.keyShard.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends KeyShardFindManyArgs>(args?: SelectSubset<T, KeyShardFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$KeyShardPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a KeyShard.
     * @param {KeyShardCreateArgs} args - Arguments to create a KeyShard.
     * @example
     * // Create one KeyShard
     * const KeyShard = await prisma.keyShard.create({
     *   data: {
     *     // ... data to create a KeyShard
     *   }
     * })
     * 
     */
    create<T extends KeyShardCreateArgs>(args: SelectSubset<T, KeyShardCreateArgs<ExtArgs>>): Prisma__KeyShardClient<$Result.GetResult<Prisma.$KeyShardPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many KeyShards.
     * @param {KeyShardCreateManyArgs} args - Arguments to create many KeyShards.
     * @example
     * // Create many KeyShards
     * const keyShard = await prisma.keyShard.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends KeyShardCreateManyArgs>(args?: SelectSubset<T, KeyShardCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many KeyShards and returns the data saved in the database.
     * @param {KeyShardCreateManyAndReturnArgs} args - Arguments to create many KeyShards.
     * @example
     * // Create many KeyShards
     * const keyShard = await prisma.keyShard.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many KeyShards and only return the `id`
     * const keyShardWithIdOnly = await prisma.keyShard.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends KeyShardCreateManyAndReturnArgs>(args?: SelectSubset<T, KeyShardCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$KeyShardPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a KeyShard.
     * @param {KeyShardDeleteArgs} args - Arguments to delete one KeyShard.
     * @example
     * // Delete one KeyShard
     * const KeyShard = await prisma.keyShard.delete({
     *   where: {
     *     // ... filter to delete one KeyShard
     *   }
     * })
     * 
     */
    delete<T extends KeyShardDeleteArgs>(args: SelectSubset<T, KeyShardDeleteArgs<ExtArgs>>): Prisma__KeyShardClient<$Result.GetResult<Prisma.$KeyShardPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one KeyShard.
     * @param {KeyShardUpdateArgs} args - Arguments to update one KeyShard.
     * @example
     * // Update one KeyShard
     * const keyShard = await prisma.keyShard.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends KeyShardUpdateArgs>(args: SelectSubset<T, KeyShardUpdateArgs<ExtArgs>>): Prisma__KeyShardClient<$Result.GetResult<Prisma.$KeyShardPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more KeyShards.
     * @param {KeyShardDeleteManyArgs} args - Arguments to filter KeyShards to delete.
     * @example
     * // Delete a few KeyShards
     * const { count } = await prisma.keyShard.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends KeyShardDeleteManyArgs>(args?: SelectSubset<T, KeyShardDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more KeyShards.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {KeyShardUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many KeyShards
     * const keyShard = await prisma.keyShard.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends KeyShardUpdateManyArgs>(args: SelectSubset<T, KeyShardUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more KeyShards and returns the data updated in the database.
     * @param {KeyShardUpdateManyAndReturnArgs} args - Arguments to update many KeyShards.
     * @example
     * // Update many KeyShards
     * const keyShard = await prisma.keyShard.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more KeyShards and only return the `id`
     * const keyShardWithIdOnly = await prisma.keyShard.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends KeyShardUpdateManyAndReturnArgs>(args: SelectSubset<T, KeyShardUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$KeyShardPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one KeyShard.
     * @param {KeyShardUpsertArgs} args - Arguments to update or create a KeyShard.
     * @example
     * // Update or create a KeyShard
     * const keyShard = await prisma.keyShard.upsert({
     *   create: {
     *     // ... data to create a KeyShard
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the KeyShard we want to update
     *   }
     * })
     */
    upsert<T extends KeyShardUpsertArgs>(args: SelectSubset<T, KeyShardUpsertArgs<ExtArgs>>): Prisma__KeyShardClient<$Result.GetResult<Prisma.$KeyShardPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of KeyShards.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {KeyShardCountArgs} args - Arguments to filter KeyShards to count.
     * @example
     * // Count the number of KeyShards
     * const count = await prisma.keyShard.count({
     *   where: {
     *     // ... the filter for the KeyShards we want to count
     *   }
     * })
    **/
    count<T extends KeyShardCountArgs>(
      args?: Subset<T, KeyShardCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], KeyShardCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a KeyShard.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {KeyShardAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends KeyShardAggregateArgs>(args: Subset<T, KeyShardAggregateArgs>): Prisma.PrismaPromise<GetKeyShardAggregateType<T>>

    /**
     * Group by KeyShard.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {KeyShardGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends KeyShardGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: KeyShardGroupByArgs['orderBy'] }
        : { orderBy?: KeyShardGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, KeyShardGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetKeyShardGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the KeyShard model
   */
  readonly fields: KeyShardFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for KeyShard.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__KeyShardClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    hollowKey<T extends HollowKeyDefaultArgs<ExtArgs> = {}>(args?: Subset<T, HollowKeyDefaultArgs<ExtArgs>>): Prisma__HollowKeyClient<$Result.GetResult<Prisma.$HollowKeyPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the KeyShard model
   */
  interface KeyShardFieldRefs {
    readonly id: FieldRef<"KeyShard", 'String'>
    readonly hollowKeyId: FieldRef<"KeyShard", 'String'>
    readonly shardIndex: FieldRef<"KeyShard", 'Int'>
    readonly vaultLocation: FieldRef<"KeyShard", 'String'>
    readonly shardHash: FieldRef<"KeyShard", 'String'>
    readonly createdAt: FieldRef<"KeyShard", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * KeyShard findUnique
   */
  export type KeyShardFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the KeyShard
     */
    select?: KeyShardSelect<ExtArgs> | null
    /**
     * Omit specific fields from the KeyShard
     */
    omit?: KeyShardOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: KeyShardInclude<ExtArgs> | null
    /**
     * Filter, which KeyShard to fetch.
     */
    where: KeyShardWhereUniqueInput
  }

  /**
   * KeyShard findUniqueOrThrow
   */
  export type KeyShardFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the KeyShard
     */
    select?: KeyShardSelect<ExtArgs> | null
    /**
     * Omit specific fields from the KeyShard
     */
    omit?: KeyShardOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: KeyShardInclude<ExtArgs> | null
    /**
     * Filter, which KeyShard to fetch.
     */
    where: KeyShardWhereUniqueInput
  }

  /**
   * KeyShard findFirst
   */
  export type KeyShardFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the KeyShard
     */
    select?: KeyShardSelect<ExtArgs> | null
    /**
     * Omit specific fields from the KeyShard
     */
    omit?: KeyShardOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: KeyShardInclude<ExtArgs> | null
    /**
     * Filter, which KeyShard to fetch.
     */
    where?: KeyShardWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of KeyShards to fetch.
     */
    orderBy?: KeyShardOrderByWithRelationInput | KeyShardOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for KeyShards.
     */
    cursor?: KeyShardWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` KeyShards from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` KeyShards.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of KeyShards.
     */
    distinct?: KeyShardScalarFieldEnum | KeyShardScalarFieldEnum[]
  }

  /**
   * KeyShard findFirstOrThrow
   */
  export type KeyShardFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the KeyShard
     */
    select?: KeyShardSelect<ExtArgs> | null
    /**
     * Omit specific fields from the KeyShard
     */
    omit?: KeyShardOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: KeyShardInclude<ExtArgs> | null
    /**
     * Filter, which KeyShard to fetch.
     */
    where?: KeyShardWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of KeyShards to fetch.
     */
    orderBy?: KeyShardOrderByWithRelationInput | KeyShardOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for KeyShards.
     */
    cursor?: KeyShardWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` KeyShards from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` KeyShards.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of KeyShards.
     */
    distinct?: KeyShardScalarFieldEnum | KeyShardScalarFieldEnum[]
  }

  /**
   * KeyShard findMany
   */
  export type KeyShardFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the KeyShard
     */
    select?: KeyShardSelect<ExtArgs> | null
    /**
     * Omit specific fields from the KeyShard
     */
    omit?: KeyShardOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: KeyShardInclude<ExtArgs> | null
    /**
     * Filter, which KeyShards to fetch.
     */
    where?: KeyShardWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of KeyShards to fetch.
     */
    orderBy?: KeyShardOrderByWithRelationInput | KeyShardOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing KeyShards.
     */
    cursor?: KeyShardWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` KeyShards from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` KeyShards.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of KeyShards.
     */
    distinct?: KeyShardScalarFieldEnum | KeyShardScalarFieldEnum[]
  }

  /**
   * KeyShard create
   */
  export type KeyShardCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the KeyShard
     */
    select?: KeyShardSelect<ExtArgs> | null
    /**
     * Omit specific fields from the KeyShard
     */
    omit?: KeyShardOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: KeyShardInclude<ExtArgs> | null
    /**
     * The data needed to create a KeyShard.
     */
    data: XOR<KeyShardCreateInput, KeyShardUncheckedCreateInput>
  }

  /**
   * KeyShard createMany
   */
  export type KeyShardCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many KeyShards.
     */
    data: KeyShardCreateManyInput | KeyShardCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * KeyShard createManyAndReturn
   */
  export type KeyShardCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the KeyShard
     */
    select?: KeyShardSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the KeyShard
     */
    omit?: KeyShardOmit<ExtArgs> | null
    /**
     * The data used to create many KeyShards.
     */
    data: KeyShardCreateManyInput | KeyShardCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: KeyShardIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * KeyShard update
   */
  export type KeyShardUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the KeyShard
     */
    select?: KeyShardSelect<ExtArgs> | null
    /**
     * Omit specific fields from the KeyShard
     */
    omit?: KeyShardOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: KeyShardInclude<ExtArgs> | null
    /**
     * The data needed to update a KeyShard.
     */
    data: XOR<KeyShardUpdateInput, KeyShardUncheckedUpdateInput>
    /**
     * Choose, which KeyShard to update.
     */
    where: KeyShardWhereUniqueInput
  }

  /**
   * KeyShard updateMany
   */
  export type KeyShardUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update KeyShards.
     */
    data: XOR<KeyShardUpdateManyMutationInput, KeyShardUncheckedUpdateManyInput>
    /**
     * Filter which KeyShards to update
     */
    where?: KeyShardWhereInput
    /**
     * Limit how many KeyShards to update.
     */
    limit?: number
  }

  /**
   * KeyShard updateManyAndReturn
   */
  export type KeyShardUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the KeyShard
     */
    select?: KeyShardSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the KeyShard
     */
    omit?: KeyShardOmit<ExtArgs> | null
    /**
     * The data used to update KeyShards.
     */
    data: XOR<KeyShardUpdateManyMutationInput, KeyShardUncheckedUpdateManyInput>
    /**
     * Filter which KeyShards to update
     */
    where?: KeyShardWhereInput
    /**
     * Limit how many KeyShards to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: KeyShardIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * KeyShard upsert
   */
  export type KeyShardUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the KeyShard
     */
    select?: KeyShardSelect<ExtArgs> | null
    /**
     * Omit specific fields from the KeyShard
     */
    omit?: KeyShardOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: KeyShardInclude<ExtArgs> | null
    /**
     * The filter to search for the KeyShard to update in case it exists.
     */
    where: KeyShardWhereUniqueInput
    /**
     * In case the KeyShard found by the `where` argument doesn't exist, create a new KeyShard with this data.
     */
    create: XOR<KeyShardCreateInput, KeyShardUncheckedCreateInput>
    /**
     * In case the KeyShard was found with the provided `where` argument, update it with this data.
     */
    update: XOR<KeyShardUpdateInput, KeyShardUncheckedUpdateInput>
  }

  /**
   * KeyShard delete
   */
  export type KeyShardDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the KeyShard
     */
    select?: KeyShardSelect<ExtArgs> | null
    /**
     * Omit specific fields from the KeyShard
     */
    omit?: KeyShardOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: KeyShardInclude<ExtArgs> | null
    /**
     * Filter which KeyShard to delete.
     */
    where: KeyShardWhereUniqueInput
  }

  /**
   * KeyShard deleteMany
   */
  export type KeyShardDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which KeyShards to delete
     */
    where?: KeyShardWhereInput
    /**
     * Limit how many KeyShards to delete.
     */
    limit?: number
  }

  /**
   * KeyShard without action
   */
  export type KeyShardDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the KeyShard
     */
    select?: KeyShardSelect<ExtArgs> | null
    /**
     * Omit specific fields from the KeyShard
     */
    omit?: KeyShardOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: KeyShardInclude<ExtArgs> | null
  }


  /**
   * Model KeyEvent
   */

  export type AggregateKeyEvent = {
    _count: KeyEventCountAggregateOutputType | null
    _min: KeyEventMinAggregateOutputType | null
    _max: KeyEventMaxAggregateOutputType | null
  }

  export type KeyEventMinAggregateOutputType = {
    id: string | null
    hollowKeyId: string | null
    eventType: string | null
    traceId: string | null
    agentId: string | null
    createdAt: Date | null
  }

  export type KeyEventMaxAggregateOutputType = {
    id: string | null
    hollowKeyId: string | null
    eventType: string | null
    traceId: string | null
    agentId: string | null
    createdAt: Date | null
  }

  export type KeyEventCountAggregateOutputType = {
    id: number
    hollowKeyId: number
    eventType: number
    traceId: number
    agentId: number
    metadata: number
    createdAt: number
    _all: number
  }


  export type KeyEventMinAggregateInputType = {
    id?: true
    hollowKeyId?: true
    eventType?: true
    traceId?: true
    agentId?: true
    createdAt?: true
  }

  export type KeyEventMaxAggregateInputType = {
    id?: true
    hollowKeyId?: true
    eventType?: true
    traceId?: true
    agentId?: true
    createdAt?: true
  }

  export type KeyEventCountAggregateInputType = {
    id?: true
    hollowKeyId?: true
    eventType?: true
    traceId?: true
    agentId?: true
    metadata?: true
    createdAt?: true
    _all?: true
  }

  export type KeyEventAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which KeyEvent to aggregate.
     */
    where?: KeyEventWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of KeyEvents to fetch.
     */
    orderBy?: KeyEventOrderByWithRelationInput | KeyEventOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: KeyEventWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` KeyEvents from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` KeyEvents.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned KeyEvents
    **/
    _count?: true | KeyEventCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: KeyEventMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: KeyEventMaxAggregateInputType
  }

  export type GetKeyEventAggregateType<T extends KeyEventAggregateArgs> = {
        [P in keyof T & keyof AggregateKeyEvent]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateKeyEvent[P]>
      : GetScalarType<T[P], AggregateKeyEvent[P]>
  }




  export type KeyEventGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: KeyEventWhereInput
    orderBy?: KeyEventOrderByWithAggregationInput | KeyEventOrderByWithAggregationInput[]
    by: KeyEventScalarFieldEnum[] | KeyEventScalarFieldEnum
    having?: KeyEventScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: KeyEventCountAggregateInputType | true
    _min?: KeyEventMinAggregateInputType
    _max?: KeyEventMaxAggregateInputType
  }

  export type KeyEventGroupByOutputType = {
    id: string
    hollowKeyId: string
    eventType: string
    traceId: string | null
    agentId: string | null
    metadata: JsonValue | null
    createdAt: Date
    _count: KeyEventCountAggregateOutputType | null
    _min: KeyEventMinAggregateOutputType | null
    _max: KeyEventMaxAggregateOutputType | null
  }

  type GetKeyEventGroupByPayload<T extends KeyEventGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<KeyEventGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof KeyEventGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], KeyEventGroupByOutputType[P]>
            : GetScalarType<T[P], KeyEventGroupByOutputType[P]>
        }
      >
    >


  export type KeyEventSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    hollowKeyId?: boolean
    eventType?: boolean
    traceId?: boolean
    agentId?: boolean
    metadata?: boolean
    createdAt?: boolean
    hollowKey?: boolean | HollowKeyDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["keyEvent"]>

  export type KeyEventSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    hollowKeyId?: boolean
    eventType?: boolean
    traceId?: boolean
    agentId?: boolean
    metadata?: boolean
    createdAt?: boolean
    hollowKey?: boolean | HollowKeyDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["keyEvent"]>

  export type KeyEventSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    hollowKeyId?: boolean
    eventType?: boolean
    traceId?: boolean
    agentId?: boolean
    metadata?: boolean
    createdAt?: boolean
    hollowKey?: boolean | HollowKeyDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["keyEvent"]>

  export type KeyEventSelectScalar = {
    id?: boolean
    hollowKeyId?: boolean
    eventType?: boolean
    traceId?: boolean
    agentId?: boolean
    metadata?: boolean
    createdAt?: boolean
  }

  export type KeyEventOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "hollowKeyId" | "eventType" | "traceId" | "agentId" | "metadata" | "createdAt", ExtArgs["result"]["keyEvent"]>
  export type KeyEventInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    hollowKey?: boolean | HollowKeyDefaultArgs<ExtArgs>
  }
  export type KeyEventIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    hollowKey?: boolean | HollowKeyDefaultArgs<ExtArgs>
  }
  export type KeyEventIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    hollowKey?: boolean | HollowKeyDefaultArgs<ExtArgs>
  }

  export type $KeyEventPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "KeyEvent"
    objects: {
      hollowKey: Prisma.$HollowKeyPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      hollowKeyId: string
      eventType: string
      traceId: string | null
      agentId: string | null
      metadata: Prisma.JsonValue | null
      createdAt: Date
    }, ExtArgs["result"]["keyEvent"]>
    composites: {}
  }

  type KeyEventGetPayload<S extends boolean | null | undefined | KeyEventDefaultArgs> = $Result.GetResult<Prisma.$KeyEventPayload, S>

  type KeyEventCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<KeyEventFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: KeyEventCountAggregateInputType | true
    }

  export interface KeyEventDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['KeyEvent'], meta: { name: 'KeyEvent' } }
    /**
     * Find zero or one KeyEvent that matches the filter.
     * @param {KeyEventFindUniqueArgs} args - Arguments to find a KeyEvent
     * @example
     * // Get one KeyEvent
     * const keyEvent = await prisma.keyEvent.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends KeyEventFindUniqueArgs>(args: SelectSubset<T, KeyEventFindUniqueArgs<ExtArgs>>): Prisma__KeyEventClient<$Result.GetResult<Prisma.$KeyEventPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one KeyEvent that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {KeyEventFindUniqueOrThrowArgs} args - Arguments to find a KeyEvent
     * @example
     * // Get one KeyEvent
     * const keyEvent = await prisma.keyEvent.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends KeyEventFindUniqueOrThrowArgs>(args: SelectSubset<T, KeyEventFindUniqueOrThrowArgs<ExtArgs>>): Prisma__KeyEventClient<$Result.GetResult<Prisma.$KeyEventPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first KeyEvent that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {KeyEventFindFirstArgs} args - Arguments to find a KeyEvent
     * @example
     * // Get one KeyEvent
     * const keyEvent = await prisma.keyEvent.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends KeyEventFindFirstArgs>(args?: SelectSubset<T, KeyEventFindFirstArgs<ExtArgs>>): Prisma__KeyEventClient<$Result.GetResult<Prisma.$KeyEventPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first KeyEvent that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {KeyEventFindFirstOrThrowArgs} args - Arguments to find a KeyEvent
     * @example
     * // Get one KeyEvent
     * const keyEvent = await prisma.keyEvent.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends KeyEventFindFirstOrThrowArgs>(args?: SelectSubset<T, KeyEventFindFirstOrThrowArgs<ExtArgs>>): Prisma__KeyEventClient<$Result.GetResult<Prisma.$KeyEventPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more KeyEvents that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {KeyEventFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all KeyEvents
     * const keyEvents = await prisma.keyEvent.findMany()
     * 
     * // Get first 10 KeyEvents
     * const keyEvents = await prisma.keyEvent.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const keyEventWithIdOnly = await prisma.keyEvent.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends KeyEventFindManyArgs>(args?: SelectSubset<T, KeyEventFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$KeyEventPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a KeyEvent.
     * @param {KeyEventCreateArgs} args - Arguments to create a KeyEvent.
     * @example
     * // Create one KeyEvent
     * const KeyEvent = await prisma.keyEvent.create({
     *   data: {
     *     // ... data to create a KeyEvent
     *   }
     * })
     * 
     */
    create<T extends KeyEventCreateArgs>(args: SelectSubset<T, KeyEventCreateArgs<ExtArgs>>): Prisma__KeyEventClient<$Result.GetResult<Prisma.$KeyEventPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many KeyEvents.
     * @param {KeyEventCreateManyArgs} args - Arguments to create many KeyEvents.
     * @example
     * // Create many KeyEvents
     * const keyEvent = await prisma.keyEvent.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends KeyEventCreateManyArgs>(args?: SelectSubset<T, KeyEventCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many KeyEvents and returns the data saved in the database.
     * @param {KeyEventCreateManyAndReturnArgs} args - Arguments to create many KeyEvents.
     * @example
     * // Create many KeyEvents
     * const keyEvent = await prisma.keyEvent.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many KeyEvents and only return the `id`
     * const keyEventWithIdOnly = await prisma.keyEvent.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends KeyEventCreateManyAndReturnArgs>(args?: SelectSubset<T, KeyEventCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$KeyEventPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a KeyEvent.
     * @param {KeyEventDeleteArgs} args - Arguments to delete one KeyEvent.
     * @example
     * // Delete one KeyEvent
     * const KeyEvent = await prisma.keyEvent.delete({
     *   where: {
     *     // ... filter to delete one KeyEvent
     *   }
     * })
     * 
     */
    delete<T extends KeyEventDeleteArgs>(args: SelectSubset<T, KeyEventDeleteArgs<ExtArgs>>): Prisma__KeyEventClient<$Result.GetResult<Prisma.$KeyEventPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one KeyEvent.
     * @param {KeyEventUpdateArgs} args - Arguments to update one KeyEvent.
     * @example
     * // Update one KeyEvent
     * const keyEvent = await prisma.keyEvent.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends KeyEventUpdateArgs>(args: SelectSubset<T, KeyEventUpdateArgs<ExtArgs>>): Prisma__KeyEventClient<$Result.GetResult<Prisma.$KeyEventPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more KeyEvents.
     * @param {KeyEventDeleteManyArgs} args - Arguments to filter KeyEvents to delete.
     * @example
     * // Delete a few KeyEvents
     * const { count } = await prisma.keyEvent.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends KeyEventDeleteManyArgs>(args?: SelectSubset<T, KeyEventDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more KeyEvents.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {KeyEventUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many KeyEvents
     * const keyEvent = await prisma.keyEvent.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends KeyEventUpdateManyArgs>(args: SelectSubset<T, KeyEventUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more KeyEvents and returns the data updated in the database.
     * @param {KeyEventUpdateManyAndReturnArgs} args - Arguments to update many KeyEvents.
     * @example
     * // Update many KeyEvents
     * const keyEvent = await prisma.keyEvent.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more KeyEvents and only return the `id`
     * const keyEventWithIdOnly = await prisma.keyEvent.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends KeyEventUpdateManyAndReturnArgs>(args: SelectSubset<T, KeyEventUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$KeyEventPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one KeyEvent.
     * @param {KeyEventUpsertArgs} args - Arguments to update or create a KeyEvent.
     * @example
     * // Update or create a KeyEvent
     * const keyEvent = await prisma.keyEvent.upsert({
     *   create: {
     *     // ... data to create a KeyEvent
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the KeyEvent we want to update
     *   }
     * })
     */
    upsert<T extends KeyEventUpsertArgs>(args: SelectSubset<T, KeyEventUpsertArgs<ExtArgs>>): Prisma__KeyEventClient<$Result.GetResult<Prisma.$KeyEventPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of KeyEvents.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {KeyEventCountArgs} args - Arguments to filter KeyEvents to count.
     * @example
     * // Count the number of KeyEvents
     * const count = await prisma.keyEvent.count({
     *   where: {
     *     // ... the filter for the KeyEvents we want to count
     *   }
     * })
    **/
    count<T extends KeyEventCountArgs>(
      args?: Subset<T, KeyEventCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], KeyEventCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a KeyEvent.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {KeyEventAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends KeyEventAggregateArgs>(args: Subset<T, KeyEventAggregateArgs>): Prisma.PrismaPromise<GetKeyEventAggregateType<T>>

    /**
     * Group by KeyEvent.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {KeyEventGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends KeyEventGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: KeyEventGroupByArgs['orderBy'] }
        : { orderBy?: KeyEventGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, KeyEventGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetKeyEventGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the KeyEvent model
   */
  readonly fields: KeyEventFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for KeyEvent.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__KeyEventClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    hollowKey<T extends HollowKeyDefaultArgs<ExtArgs> = {}>(args?: Subset<T, HollowKeyDefaultArgs<ExtArgs>>): Prisma__HollowKeyClient<$Result.GetResult<Prisma.$HollowKeyPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the KeyEvent model
   */
  interface KeyEventFieldRefs {
    readonly id: FieldRef<"KeyEvent", 'String'>
    readonly hollowKeyId: FieldRef<"KeyEvent", 'String'>
    readonly eventType: FieldRef<"KeyEvent", 'String'>
    readonly traceId: FieldRef<"KeyEvent", 'String'>
    readonly agentId: FieldRef<"KeyEvent", 'String'>
    readonly metadata: FieldRef<"KeyEvent", 'Json'>
    readonly createdAt: FieldRef<"KeyEvent", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * KeyEvent findUnique
   */
  export type KeyEventFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the KeyEvent
     */
    select?: KeyEventSelect<ExtArgs> | null
    /**
     * Omit specific fields from the KeyEvent
     */
    omit?: KeyEventOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: KeyEventInclude<ExtArgs> | null
    /**
     * Filter, which KeyEvent to fetch.
     */
    where: KeyEventWhereUniqueInput
  }

  /**
   * KeyEvent findUniqueOrThrow
   */
  export type KeyEventFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the KeyEvent
     */
    select?: KeyEventSelect<ExtArgs> | null
    /**
     * Omit specific fields from the KeyEvent
     */
    omit?: KeyEventOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: KeyEventInclude<ExtArgs> | null
    /**
     * Filter, which KeyEvent to fetch.
     */
    where: KeyEventWhereUniqueInput
  }

  /**
   * KeyEvent findFirst
   */
  export type KeyEventFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the KeyEvent
     */
    select?: KeyEventSelect<ExtArgs> | null
    /**
     * Omit specific fields from the KeyEvent
     */
    omit?: KeyEventOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: KeyEventInclude<ExtArgs> | null
    /**
     * Filter, which KeyEvent to fetch.
     */
    where?: KeyEventWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of KeyEvents to fetch.
     */
    orderBy?: KeyEventOrderByWithRelationInput | KeyEventOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for KeyEvents.
     */
    cursor?: KeyEventWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` KeyEvents from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` KeyEvents.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of KeyEvents.
     */
    distinct?: KeyEventScalarFieldEnum | KeyEventScalarFieldEnum[]
  }

  /**
   * KeyEvent findFirstOrThrow
   */
  export type KeyEventFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the KeyEvent
     */
    select?: KeyEventSelect<ExtArgs> | null
    /**
     * Omit specific fields from the KeyEvent
     */
    omit?: KeyEventOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: KeyEventInclude<ExtArgs> | null
    /**
     * Filter, which KeyEvent to fetch.
     */
    where?: KeyEventWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of KeyEvents to fetch.
     */
    orderBy?: KeyEventOrderByWithRelationInput | KeyEventOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for KeyEvents.
     */
    cursor?: KeyEventWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` KeyEvents from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` KeyEvents.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of KeyEvents.
     */
    distinct?: KeyEventScalarFieldEnum | KeyEventScalarFieldEnum[]
  }

  /**
   * KeyEvent findMany
   */
  export type KeyEventFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the KeyEvent
     */
    select?: KeyEventSelect<ExtArgs> | null
    /**
     * Omit specific fields from the KeyEvent
     */
    omit?: KeyEventOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: KeyEventInclude<ExtArgs> | null
    /**
     * Filter, which KeyEvents to fetch.
     */
    where?: KeyEventWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of KeyEvents to fetch.
     */
    orderBy?: KeyEventOrderByWithRelationInput | KeyEventOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing KeyEvents.
     */
    cursor?: KeyEventWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` KeyEvents from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` KeyEvents.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of KeyEvents.
     */
    distinct?: KeyEventScalarFieldEnum | KeyEventScalarFieldEnum[]
  }

  /**
   * KeyEvent create
   */
  export type KeyEventCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the KeyEvent
     */
    select?: KeyEventSelect<ExtArgs> | null
    /**
     * Omit specific fields from the KeyEvent
     */
    omit?: KeyEventOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: KeyEventInclude<ExtArgs> | null
    /**
     * The data needed to create a KeyEvent.
     */
    data: XOR<KeyEventCreateInput, KeyEventUncheckedCreateInput>
  }

  /**
   * KeyEvent createMany
   */
  export type KeyEventCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many KeyEvents.
     */
    data: KeyEventCreateManyInput | KeyEventCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * KeyEvent createManyAndReturn
   */
  export type KeyEventCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the KeyEvent
     */
    select?: KeyEventSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the KeyEvent
     */
    omit?: KeyEventOmit<ExtArgs> | null
    /**
     * The data used to create many KeyEvents.
     */
    data: KeyEventCreateManyInput | KeyEventCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: KeyEventIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * KeyEvent update
   */
  export type KeyEventUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the KeyEvent
     */
    select?: KeyEventSelect<ExtArgs> | null
    /**
     * Omit specific fields from the KeyEvent
     */
    omit?: KeyEventOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: KeyEventInclude<ExtArgs> | null
    /**
     * The data needed to update a KeyEvent.
     */
    data: XOR<KeyEventUpdateInput, KeyEventUncheckedUpdateInput>
    /**
     * Choose, which KeyEvent to update.
     */
    where: KeyEventWhereUniqueInput
  }

  /**
   * KeyEvent updateMany
   */
  export type KeyEventUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update KeyEvents.
     */
    data: XOR<KeyEventUpdateManyMutationInput, KeyEventUncheckedUpdateManyInput>
    /**
     * Filter which KeyEvents to update
     */
    where?: KeyEventWhereInput
    /**
     * Limit how many KeyEvents to update.
     */
    limit?: number
  }

  /**
   * KeyEvent updateManyAndReturn
   */
  export type KeyEventUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the KeyEvent
     */
    select?: KeyEventSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the KeyEvent
     */
    omit?: KeyEventOmit<ExtArgs> | null
    /**
     * The data used to update KeyEvents.
     */
    data: XOR<KeyEventUpdateManyMutationInput, KeyEventUncheckedUpdateManyInput>
    /**
     * Filter which KeyEvents to update
     */
    where?: KeyEventWhereInput
    /**
     * Limit how many KeyEvents to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: KeyEventIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * KeyEvent upsert
   */
  export type KeyEventUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the KeyEvent
     */
    select?: KeyEventSelect<ExtArgs> | null
    /**
     * Omit specific fields from the KeyEvent
     */
    omit?: KeyEventOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: KeyEventInclude<ExtArgs> | null
    /**
     * The filter to search for the KeyEvent to update in case it exists.
     */
    where: KeyEventWhereUniqueInput
    /**
     * In case the KeyEvent found by the `where` argument doesn't exist, create a new KeyEvent with this data.
     */
    create: XOR<KeyEventCreateInput, KeyEventUncheckedCreateInput>
    /**
     * In case the KeyEvent was found with the provided `where` argument, update it with this data.
     */
    update: XOR<KeyEventUpdateInput, KeyEventUncheckedUpdateInput>
  }

  /**
   * KeyEvent delete
   */
  export type KeyEventDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the KeyEvent
     */
    select?: KeyEventSelect<ExtArgs> | null
    /**
     * Omit specific fields from the KeyEvent
     */
    omit?: KeyEventOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: KeyEventInclude<ExtArgs> | null
    /**
     * Filter which KeyEvent to delete.
     */
    where: KeyEventWhereUniqueInput
  }

  /**
   * KeyEvent deleteMany
   */
  export type KeyEventDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which KeyEvents to delete
     */
    where?: KeyEventWhereInput
    /**
     * Limit how many KeyEvents to delete.
     */
    limit?: number
  }

  /**
   * KeyEvent without action
   */
  export type KeyEventDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the KeyEvent
     */
    select?: KeyEventSelect<ExtArgs> | null
    /**
     * Omit specific fields from the KeyEvent
     */
    omit?: KeyEventOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: KeyEventInclude<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const HollowKeyScalarFieldEnum: {
    id: 'id',
    userId: 'userId',
    name: 'name',
    agentId: 'agentId',
    agentName: 'agentName',
    provider: 'provider',
    allowedIntent: 'allowedIntent',
    status: 'status',
    timesUsed: 'timesUsed',
    lastUsedAt: 'lastUsedAt',
    expiresAt: 'expiresAt',
    createdAt: 'createdAt'
  };

  export type HollowKeyScalarFieldEnum = (typeof HollowKeyScalarFieldEnum)[keyof typeof HollowKeyScalarFieldEnum]


  export const KeyShardScalarFieldEnum: {
    id: 'id',
    hollowKeyId: 'hollowKeyId',
    shardIndex: 'shardIndex',
    vaultLocation: 'vaultLocation',
    shardHash: 'shardHash',
    createdAt: 'createdAt'
  };

  export type KeyShardScalarFieldEnum = (typeof KeyShardScalarFieldEnum)[keyof typeof KeyShardScalarFieldEnum]


  export const KeyEventScalarFieldEnum: {
    id: 'id',
    hollowKeyId: 'hollowKeyId',
    eventType: 'eventType',
    traceId: 'traceId',
    agentId: 'agentId',
    metadata: 'metadata',
    createdAt: 'createdAt'
  };

  export type KeyEventScalarFieldEnum = (typeof KeyEventScalarFieldEnum)[keyof typeof KeyEventScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const NullableJsonNullValueInput: {
    DbNull: typeof DbNull,
    JsonNull: typeof JsonNull
  };

  export type NullableJsonNullValueInput = (typeof NullableJsonNullValueInput)[keyof typeof NullableJsonNullValueInput]


  export const QueryMode: {
    default: 'default',
    insensitive: 'insensitive'
  };

  export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  export const JsonNullValueFilter: {
    DbNull: typeof DbNull,
    JsonNull: typeof JsonNull,
    AnyNull: typeof AnyNull
  };

  export type JsonNullValueFilter = (typeof JsonNullValueFilter)[keyof typeof JsonNullValueFilter]


  /**
   * Field references
   */


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'String[]'
   */
  export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String[]'>
    


  /**
   * Reference to a field of type 'KeyStatus'
   */
  export type EnumKeyStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'KeyStatus'>
    


  /**
   * Reference to a field of type 'KeyStatus[]'
   */
  export type ListEnumKeyStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'KeyStatus[]'>
    


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>
    


  /**
   * Reference to a field of type 'Json'
   */
  export type JsonFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Json'>
    


  /**
   * Reference to a field of type 'QueryMode'
   */
  export type EnumQueryModeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'QueryMode'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    


  /**
   * Reference to a field of type 'Float[]'
   */
  export type ListFloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float[]'>
    
  /**
   * Deep Input Types
   */


  export type HollowKeyWhereInput = {
    AND?: HollowKeyWhereInput | HollowKeyWhereInput[]
    OR?: HollowKeyWhereInput[]
    NOT?: HollowKeyWhereInput | HollowKeyWhereInput[]
    id?: StringFilter<"HollowKey"> | string
    userId?: StringFilter<"HollowKey"> | string
    name?: StringFilter<"HollowKey"> | string
    agentId?: StringFilter<"HollowKey"> | string
    agentName?: StringFilter<"HollowKey"> | string
    provider?: StringFilter<"HollowKey"> | string
    allowedIntent?: StringFilter<"HollowKey"> | string
    status?: EnumKeyStatusFilter<"HollowKey"> | $Enums.KeyStatus
    timesUsed?: IntFilter<"HollowKey"> | number
    lastUsedAt?: DateTimeFilter<"HollowKey"> | Date | string
    expiresAt?: DateTimeNullableFilter<"HollowKey"> | Date | string | null
    createdAt?: DateTimeFilter<"HollowKey"> | Date | string
    shards?: KeyShardListRelationFilter
    events?: KeyEventListRelationFilter
  }

  export type HollowKeyOrderByWithRelationInput = {
    id?: SortOrder
    userId?: SortOrder
    name?: SortOrder
    agentId?: SortOrder
    agentName?: SortOrder
    provider?: SortOrder
    allowedIntent?: SortOrder
    status?: SortOrder
    timesUsed?: SortOrder
    lastUsedAt?: SortOrder
    expiresAt?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    shards?: KeyShardOrderByRelationAggregateInput
    events?: KeyEventOrderByRelationAggregateInput
  }

  export type HollowKeyWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: HollowKeyWhereInput | HollowKeyWhereInput[]
    OR?: HollowKeyWhereInput[]
    NOT?: HollowKeyWhereInput | HollowKeyWhereInput[]
    userId?: StringFilter<"HollowKey"> | string
    name?: StringFilter<"HollowKey"> | string
    agentId?: StringFilter<"HollowKey"> | string
    agentName?: StringFilter<"HollowKey"> | string
    provider?: StringFilter<"HollowKey"> | string
    allowedIntent?: StringFilter<"HollowKey"> | string
    status?: EnumKeyStatusFilter<"HollowKey"> | $Enums.KeyStatus
    timesUsed?: IntFilter<"HollowKey"> | number
    lastUsedAt?: DateTimeFilter<"HollowKey"> | Date | string
    expiresAt?: DateTimeNullableFilter<"HollowKey"> | Date | string | null
    createdAt?: DateTimeFilter<"HollowKey"> | Date | string
    shards?: KeyShardListRelationFilter
    events?: KeyEventListRelationFilter
  }, "id">

  export type HollowKeyOrderByWithAggregationInput = {
    id?: SortOrder
    userId?: SortOrder
    name?: SortOrder
    agentId?: SortOrder
    agentName?: SortOrder
    provider?: SortOrder
    allowedIntent?: SortOrder
    status?: SortOrder
    timesUsed?: SortOrder
    lastUsedAt?: SortOrder
    expiresAt?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    _count?: HollowKeyCountOrderByAggregateInput
    _avg?: HollowKeyAvgOrderByAggregateInput
    _max?: HollowKeyMaxOrderByAggregateInput
    _min?: HollowKeyMinOrderByAggregateInput
    _sum?: HollowKeySumOrderByAggregateInput
  }

  export type HollowKeyScalarWhereWithAggregatesInput = {
    AND?: HollowKeyScalarWhereWithAggregatesInput | HollowKeyScalarWhereWithAggregatesInput[]
    OR?: HollowKeyScalarWhereWithAggregatesInput[]
    NOT?: HollowKeyScalarWhereWithAggregatesInput | HollowKeyScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"HollowKey"> | string
    userId?: StringWithAggregatesFilter<"HollowKey"> | string
    name?: StringWithAggregatesFilter<"HollowKey"> | string
    agentId?: StringWithAggregatesFilter<"HollowKey"> | string
    agentName?: StringWithAggregatesFilter<"HollowKey"> | string
    provider?: StringWithAggregatesFilter<"HollowKey"> | string
    allowedIntent?: StringWithAggregatesFilter<"HollowKey"> | string
    status?: EnumKeyStatusWithAggregatesFilter<"HollowKey"> | $Enums.KeyStatus
    timesUsed?: IntWithAggregatesFilter<"HollowKey"> | number
    lastUsedAt?: DateTimeWithAggregatesFilter<"HollowKey"> | Date | string
    expiresAt?: DateTimeNullableWithAggregatesFilter<"HollowKey"> | Date | string | null
    createdAt?: DateTimeWithAggregatesFilter<"HollowKey"> | Date | string
  }

  export type KeyShardWhereInput = {
    AND?: KeyShardWhereInput | KeyShardWhereInput[]
    OR?: KeyShardWhereInput[]
    NOT?: KeyShardWhereInput | KeyShardWhereInput[]
    id?: StringFilter<"KeyShard"> | string
    hollowKeyId?: StringFilter<"KeyShard"> | string
    shardIndex?: IntFilter<"KeyShard"> | number
    vaultLocation?: StringFilter<"KeyShard"> | string
    shardHash?: StringFilter<"KeyShard"> | string
    createdAt?: DateTimeFilter<"KeyShard"> | Date | string
    hollowKey?: XOR<HollowKeyScalarRelationFilter, HollowKeyWhereInput>
  }

  export type KeyShardOrderByWithRelationInput = {
    id?: SortOrder
    hollowKeyId?: SortOrder
    shardIndex?: SortOrder
    vaultLocation?: SortOrder
    shardHash?: SortOrder
    createdAt?: SortOrder
    hollowKey?: HollowKeyOrderByWithRelationInput
  }

  export type KeyShardWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: KeyShardWhereInput | KeyShardWhereInput[]
    OR?: KeyShardWhereInput[]
    NOT?: KeyShardWhereInput | KeyShardWhereInput[]
    hollowKeyId?: StringFilter<"KeyShard"> | string
    shardIndex?: IntFilter<"KeyShard"> | number
    vaultLocation?: StringFilter<"KeyShard"> | string
    shardHash?: StringFilter<"KeyShard"> | string
    createdAt?: DateTimeFilter<"KeyShard"> | Date | string
    hollowKey?: XOR<HollowKeyScalarRelationFilter, HollowKeyWhereInput>
  }, "id">

  export type KeyShardOrderByWithAggregationInput = {
    id?: SortOrder
    hollowKeyId?: SortOrder
    shardIndex?: SortOrder
    vaultLocation?: SortOrder
    shardHash?: SortOrder
    createdAt?: SortOrder
    _count?: KeyShardCountOrderByAggregateInput
    _avg?: KeyShardAvgOrderByAggregateInput
    _max?: KeyShardMaxOrderByAggregateInput
    _min?: KeyShardMinOrderByAggregateInput
    _sum?: KeyShardSumOrderByAggregateInput
  }

  export type KeyShardScalarWhereWithAggregatesInput = {
    AND?: KeyShardScalarWhereWithAggregatesInput | KeyShardScalarWhereWithAggregatesInput[]
    OR?: KeyShardScalarWhereWithAggregatesInput[]
    NOT?: KeyShardScalarWhereWithAggregatesInput | KeyShardScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"KeyShard"> | string
    hollowKeyId?: StringWithAggregatesFilter<"KeyShard"> | string
    shardIndex?: IntWithAggregatesFilter<"KeyShard"> | number
    vaultLocation?: StringWithAggregatesFilter<"KeyShard"> | string
    shardHash?: StringWithAggregatesFilter<"KeyShard"> | string
    createdAt?: DateTimeWithAggregatesFilter<"KeyShard"> | Date | string
  }

  export type KeyEventWhereInput = {
    AND?: KeyEventWhereInput | KeyEventWhereInput[]
    OR?: KeyEventWhereInput[]
    NOT?: KeyEventWhereInput | KeyEventWhereInput[]
    id?: StringFilter<"KeyEvent"> | string
    hollowKeyId?: StringFilter<"KeyEvent"> | string
    eventType?: StringFilter<"KeyEvent"> | string
    traceId?: StringNullableFilter<"KeyEvent"> | string | null
    agentId?: StringNullableFilter<"KeyEvent"> | string | null
    metadata?: JsonNullableFilter<"KeyEvent">
    createdAt?: DateTimeFilter<"KeyEvent"> | Date | string
    hollowKey?: XOR<HollowKeyScalarRelationFilter, HollowKeyWhereInput>
  }

  export type KeyEventOrderByWithRelationInput = {
    id?: SortOrder
    hollowKeyId?: SortOrder
    eventType?: SortOrder
    traceId?: SortOrderInput | SortOrder
    agentId?: SortOrderInput | SortOrder
    metadata?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    hollowKey?: HollowKeyOrderByWithRelationInput
  }

  export type KeyEventWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: KeyEventWhereInput | KeyEventWhereInput[]
    OR?: KeyEventWhereInput[]
    NOT?: KeyEventWhereInput | KeyEventWhereInput[]
    hollowKeyId?: StringFilter<"KeyEvent"> | string
    eventType?: StringFilter<"KeyEvent"> | string
    traceId?: StringNullableFilter<"KeyEvent"> | string | null
    agentId?: StringNullableFilter<"KeyEvent"> | string | null
    metadata?: JsonNullableFilter<"KeyEvent">
    createdAt?: DateTimeFilter<"KeyEvent"> | Date | string
    hollowKey?: XOR<HollowKeyScalarRelationFilter, HollowKeyWhereInput>
  }, "id">

  export type KeyEventOrderByWithAggregationInput = {
    id?: SortOrder
    hollowKeyId?: SortOrder
    eventType?: SortOrder
    traceId?: SortOrderInput | SortOrder
    agentId?: SortOrderInput | SortOrder
    metadata?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    _count?: KeyEventCountOrderByAggregateInput
    _max?: KeyEventMaxOrderByAggregateInput
    _min?: KeyEventMinOrderByAggregateInput
  }

  export type KeyEventScalarWhereWithAggregatesInput = {
    AND?: KeyEventScalarWhereWithAggregatesInput | KeyEventScalarWhereWithAggregatesInput[]
    OR?: KeyEventScalarWhereWithAggregatesInput[]
    NOT?: KeyEventScalarWhereWithAggregatesInput | KeyEventScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"KeyEvent"> | string
    hollowKeyId?: StringWithAggregatesFilter<"KeyEvent"> | string
    eventType?: StringWithAggregatesFilter<"KeyEvent"> | string
    traceId?: StringNullableWithAggregatesFilter<"KeyEvent"> | string | null
    agentId?: StringNullableWithAggregatesFilter<"KeyEvent"> | string | null
    metadata?: JsonNullableWithAggregatesFilter<"KeyEvent">
    createdAt?: DateTimeWithAggregatesFilter<"KeyEvent"> | Date | string
  }

  export type HollowKeyCreateInput = {
    id?: string
    userId: string
    name?: string
    agentId: string
    agentName: string
    provider: string
    allowedIntent: string
    status?: $Enums.KeyStatus
    timesUsed?: number
    lastUsedAt?: Date | string
    expiresAt?: Date | string | null
    createdAt?: Date | string
    shards?: KeyShardCreateNestedManyWithoutHollowKeyInput
    events?: KeyEventCreateNestedManyWithoutHollowKeyInput
  }

  export type HollowKeyUncheckedCreateInput = {
    id?: string
    userId: string
    name?: string
    agentId: string
    agentName: string
    provider: string
    allowedIntent: string
    status?: $Enums.KeyStatus
    timesUsed?: number
    lastUsedAt?: Date | string
    expiresAt?: Date | string | null
    createdAt?: Date | string
    shards?: KeyShardUncheckedCreateNestedManyWithoutHollowKeyInput
    events?: KeyEventUncheckedCreateNestedManyWithoutHollowKeyInput
  }

  export type HollowKeyUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    agentId?: StringFieldUpdateOperationsInput | string
    agentName?: StringFieldUpdateOperationsInput | string
    provider?: StringFieldUpdateOperationsInput | string
    allowedIntent?: StringFieldUpdateOperationsInput | string
    status?: EnumKeyStatusFieldUpdateOperationsInput | $Enums.KeyStatus
    timesUsed?: IntFieldUpdateOperationsInput | number
    lastUsedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    expiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    shards?: KeyShardUpdateManyWithoutHollowKeyNestedInput
    events?: KeyEventUpdateManyWithoutHollowKeyNestedInput
  }

  export type HollowKeyUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    agentId?: StringFieldUpdateOperationsInput | string
    agentName?: StringFieldUpdateOperationsInput | string
    provider?: StringFieldUpdateOperationsInput | string
    allowedIntent?: StringFieldUpdateOperationsInput | string
    status?: EnumKeyStatusFieldUpdateOperationsInput | $Enums.KeyStatus
    timesUsed?: IntFieldUpdateOperationsInput | number
    lastUsedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    expiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    shards?: KeyShardUncheckedUpdateManyWithoutHollowKeyNestedInput
    events?: KeyEventUncheckedUpdateManyWithoutHollowKeyNestedInput
  }

  export type HollowKeyCreateManyInput = {
    id?: string
    userId: string
    name?: string
    agentId: string
    agentName: string
    provider: string
    allowedIntent: string
    status?: $Enums.KeyStatus
    timesUsed?: number
    lastUsedAt?: Date | string
    expiresAt?: Date | string | null
    createdAt?: Date | string
  }

  export type HollowKeyUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    agentId?: StringFieldUpdateOperationsInput | string
    agentName?: StringFieldUpdateOperationsInput | string
    provider?: StringFieldUpdateOperationsInput | string
    allowedIntent?: StringFieldUpdateOperationsInput | string
    status?: EnumKeyStatusFieldUpdateOperationsInput | $Enums.KeyStatus
    timesUsed?: IntFieldUpdateOperationsInput | number
    lastUsedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    expiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type HollowKeyUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    agentId?: StringFieldUpdateOperationsInput | string
    agentName?: StringFieldUpdateOperationsInput | string
    provider?: StringFieldUpdateOperationsInput | string
    allowedIntent?: StringFieldUpdateOperationsInput | string
    status?: EnumKeyStatusFieldUpdateOperationsInput | $Enums.KeyStatus
    timesUsed?: IntFieldUpdateOperationsInput | number
    lastUsedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    expiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type KeyShardCreateInput = {
    id?: string
    shardIndex: number
    vaultLocation: string
    shardHash: string
    createdAt?: Date | string
    hollowKey: HollowKeyCreateNestedOneWithoutShardsInput
  }

  export type KeyShardUncheckedCreateInput = {
    id?: string
    hollowKeyId: string
    shardIndex: number
    vaultLocation: string
    shardHash: string
    createdAt?: Date | string
  }

  export type KeyShardUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    shardIndex?: IntFieldUpdateOperationsInput | number
    vaultLocation?: StringFieldUpdateOperationsInput | string
    shardHash?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    hollowKey?: HollowKeyUpdateOneRequiredWithoutShardsNestedInput
  }

  export type KeyShardUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    hollowKeyId?: StringFieldUpdateOperationsInput | string
    shardIndex?: IntFieldUpdateOperationsInput | number
    vaultLocation?: StringFieldUpdateOperationsInput | string
    shardHash?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type KeyShardCreateManyInput = {
    id?: string
    hollowKeyId: string
    shardIndex: number
    vaultLocation: string
    shardHash: string
    createdAt?: Date | string
  }

  export type KeyShardUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    shardIndex?: IntFieldUpdateOperationsInput | number
    vaultLocation?: StringFieldUpdateOperationsInput | string
    shardHash?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type KeyShardUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    hollowKeyId?: StringFieldUpdateOperationsInput | string
    shardIndex?: IntFieldUpdateOperationsInput | number
    vaultLocation?: StringFieldUpdateOperationsInput | string
    shardHash?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type KeyEventCreateInput = {
    id?: string
    eventType: string
    traceId?: string | null
    agentId?: string | null
    metadata?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    hollowKey: HollowKeyCreateNestedOneWithoutEventsInput
  }

  export type KeyEventUncheckedCreateInput = {
    id?: string
    hollowKeyId: string
    eventType: string
    traceId?: string | null
    agentId?: string | null
    metadata?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
  }

  export type KeyEventUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    eventType?: StringFieldUpdateOperationsInput | string
    traceId?: NullableStringFieldUpdateOperationsInput | string | null
    agentId?: NullableStringFieldUpdateOperationsInput | string | null
    metadata?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    hollowKey?: HollowKeyUpdateOneRequiredWithoutEventsNestedInput
  }

  export type KeyEventUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    hollowKeyId?: StringFieldUpdateOperationsInput | string
    eventType?: StringFieldUpdateOperationsInput | string
    traceId?: NullableStringFieldUpdateOperationsInput | string | null
    agentId?: NullableStringFieldUpdateOperationsInput | string | null
    metadata?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type KeyEventCreateManyInput = {
    id?: string
    hollowKeyId: string
    eventType: string
    traceId?: string | null
    agentId?: string | null
    metadata?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
  }

  export type KeyEventUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    eventType?: StringFieldUpdateOperationsInput | string
    traceId?: NullableStringFieldUpdateOperationsInput | string | null
    agentId?: NullableStringFieldUpdateOperationsInput | string | null
    metadata?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type KeyEventUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    hollowKeyId?: StringFieldUpdateOperationsInput | string
    eventType?: StringFieldUpdateOperationsInput | string
    traceId?: NullableStringFieldUpdateOperationsInput | string | null
    agentId?: NullableStringFieldUpdateOperationsInput | string | null
    metadata?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type EnumKeyStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.KeyStatus | EnumKeyStatusFieldRefInput<$PrismaModel>
    in?: $Enums.KeyStatus[] | ListEnumKeyStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.KeyStatus[] | ListEnumKeyStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumKeyStatusFilter<$PrismaModel> | $Enums.KeyStatus
  }

  export type IntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type DateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type KeyShardListRelationFilter = {
    every?: KeyShardWhereInput
    some?: KeyShardWhereInput
    none?: KeyShardWhereInput
  }

  export type KeyEventListRelationFilter = {
    every?: KeyEventWhereInput
    some?: KeyEventWhereInput
    none?: KeyEventWhereInput
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type KeyShardOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type KeyEventOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type HollowKeyCountOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    name?: SortOrder
    agentId?: SortOrder
    agentName?: SortOrder
    provider?: SortOrder
    allowedIntent?: SortOrder
    status?: SortOrder
    timesUsed?: SortOrder
    lastUsedAt?: SortOrder
    expiresAt?: SortOrder
    createdAt?: SortOrder
  }

  export type HollowKeyAvgOrderByAggregateInput = {
    timesUsed?: SortOrder
  }

  export type HollowKeyMaxOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    name?: SortOrder
    agentId?: SortOrder
    agentName?: SortOrder
    provider?: SortOrder
    allowedIntent?: SortOrder
    status?: SortOrder
    timesUsed?: SortOrder
    lastUsedAt?: SortOrder
    expiresAt?: SortOrder
    createdAt?: SortOrder
  }

  export type HollowKeyMinOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    name?: SortOrder
    agentId?: SortOrder
    agentName?: SortOrder
    provider?: SortOrder
    allowedIntent?: SortOrder
    status?: SortOrder
    timesUsed?: SortOrder
    lastUsedAt?: SortOrder
    expiresAt?: SortOrder
    createdAt?: SortOrder
  }

  export type HollowKeySumOrderByAggregateInput = {
    timesUsed?: SortOrder
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type EnumKeyStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.KeyStatus | EnumKeyStatusFieldRefInput<$PrismaModel>
    in?: $Enums.KeyStatus[] | ListEnumKeyStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.KeyStatus[] | ListEnumKeyStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumKeyStatusWithAggregatesFilter<$PrismaModel> | $Enums.KeyStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumKeyStatusFilter<$PrismaModel>
    _max?: NestedEnumKeyStatusFilter<$PrismaModel>
  }

  export type IntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type DateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type HollowKeyScalarRelationFilter = {
    is?: HollowKeyWhereInput
    isNot?: HollowKeyWhereInput
  }

  export type KeyShardCountOrderByAggregateInput = {
    id?: SortOrder
    hollowKeyId?: SortOrder
    shardIndex?: SortOrder
    vaultLocation?: SortOrder
    shardHash?: SortOrder
    createdAt?: SortOrder
  }

  export type KeyShardAvgOrderByAggregateInput = {
    shardIndex?: SortOrder
  }

  export type KeyShardMaxOrderByAggregateInput = {
    id?: SortOrder
    hollowKeyId?: SortOrder
    shardIndex?: SortOrder
    vaultLocation?: SortOrder
    shardHash?: SortOrder
    createdAt?: SortOrder
  }

  export type KeyShardMinOrderByAggregateInput = {
    id?: SortOrder
    hollowKeyId?: SortOrder
    shardIndex?: SortOrder
    vaultLocation?: SortOrder
    shardHash?: SortOrder
    createdAt?: SortOrder
  }

  export type KeyShardSumOrderByAggregateInput = {
    shardIndex?: SortOrder
  }

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }
  export type JsonNullableFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<JsonNullableFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonNullableFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonNullableFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonNullableFilterBase<$PrismaModel>>, 'path'>>

  export type JsonNullableFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type KeyEventCountOrderByAggregateInput = {
    id?: SortOrder
    hollowKeyId?: SortOrder
    eventType?: SortOrder
    traceId?: SortOrder
    agentId?: SortOrder
    metadata?: SortOrder
    createdAt?: SortOrder
  }

  export type KeyEventMaxOrderByAggregateInput = {
    id?: SortOrder
    hollowKeyId?: SortOrder
    eventType?: SortOrder
    traceId?: SortOrder
    agentId?: SortOrder
    createdAt?: SortOrder
  }

  export type KeyEventMinOrderByAggregateInput = {
    id?: SortOrder
    hollowKeyId?: SortOrder
    eventType?: SortOrder
    traceId?: SortOrder
    agentId?: SortOrder
    createdAt?: SortOrder
  }

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }
  export type JsonNullableWithAggregatesFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, 'path'>>

  export type JsonNullableWithAggregatesFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedJsonNullableFilter<$PrismaModel>
    _max?: NestedJsonNullableFilter<$PrismaModel>
  }

  export type KeyShardCreateNestedManyWithoutHollowKeyInput = {
    create?: XOR<KeyShardCreateWithoutHollowKeyInput, KeyShardUncheckedCreateWithoutHollowKeyInput> | KeyShardCreateWithoutHollowKeyInput[] | KeyShardUncheckedCreateWithoutHollowKeyInput[]
    connectOrCreate?: KeyShardCreateOrConnectWithoutHollowKeyInput | KeyShardCreateOrConnectWithoutHollowKeyInput[]
    createMany?: KeyShardCreateManyHollowKeyInputEnvelope
    connect?: KeyShardWhereUniqueInput | KeyShardWhereUniqueInput[]
  }

  export type KeyEventCreateNestedManyWithoutHollowKeyInput = {
    create?: XOR<KeyEventCreateWithoutHollowKeyInput, KeyEventUncheckedCreateWithoutHollowKeyInput> | KeyEventCreateWithoutHollowKeyInput[] | KeyEventUncheckedCreateWithoutHollowKeyInput[]
    connectOrCreate?: KeyEventCreateOrConnectWithoutHollowKeyInput | KeyEventCreateOrConnectWithoutHollowKeyInput[]
    createMany?: KeyEventCreateManyHollowKeyInputEnvelope
    connect?: KeyEventWhereUniqueInput | KeyEventWhereUniqueInput[]
  }

  export type KeyShardUncheckedCreateNestedManyWithoutHollowKeyInput = {
    create?: XOR<KeyShardCreateWithoutHollowKeyInput, KeyShardUncheckedCreateWithoutHollowKeyInput> | KeyShardCreateWithoutHollowKeyInput[] | KeyShardUncheckedCreateWithoutHollowKeyInput[]
    connectOrCreate?: KeyShardCreateOrConnectWithoutHollowKeyInput | KeyShardCreateOrConnectWithoutHollowKeyInput[]
    createMany?: KeyShardCreateManyHollowKeyInputEnvelope
    connect?: KeyShardWhereUniqueInput | KeyShardWhereUniqueInput[]
  }

  export type KeyEventUncheckedCreateNestedManyWithoutHollowKeyInput = {
    create?: XOR<KeyEventCreateWithoutHollowKeyInput, KeyEventUncheckedCreateWithoutHollowKeyInput> | KeyEventCreateWithoutHollowKeyInput[] | KeyEventUncheckedCreateWithoutHollowKeyInput[]
    connectOrCreate?: KeyEventCreateOrConnectWithoutHollowKeyInput | KeyEventCreateOrConnectWithoutHollowKeyInput[]
    createMany?: KeyEventCreateManyHollowKeyInputEnvelope
    connect?: KeyEventWhereUniqueInput | KeyEventWhereUniqueInput[]
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type EnumKeyStatusFieldUpdateOperationsInput = {
    set?: $Enums.KeyStatus
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null
  }

  export type KeyShardUpdateManyWithoutHollowKeyNestedInput = {
    create?: XOR<KeyShardCreateWithoutHollowKeyInput, KeyShardUncheckedCreateWithoutHollowKeyInput> | KeyShardCreateWithoutHollowKeyInput[] | KeyShardUncheckedCreateWithoutHollowKeyInput[]
    connectOrCreate?: KeyShardCreateOrConnectWithoutHollowKeyInput | KeyShardCreateOrConnectWithoutHollowKeyInput[]
    upsert?: KeyShardUpsertWithWhereUniqueWithoutHollowKeyInput | KeyShardUpsertWithWhereUniqueWithoutHollowKeyInput[]
    createMany?: KeyShardCreateManyHollowKeyInputEnvelope
    set?: KeyShardWhereUniqueInput | KeyShardWhereUniqueInput[]
    disconnect?: KeyShardWhereUniqueInput | KeyShardWhereUniqueInput[]
    delete?: KeyShardWhereUniqueInput | KeyShardWhereUniqueInput[]
    connect?: KeyShardWhereUniqueInput | KeyShardWhereUniqueInput[]
    update?: KeyShardUpdateWithWhereUniqueWithoutHollowKeyInput | KeyShardUpdateWithWhereUniqueWithoutHollowKeyInput[]
    updateMany?: KeyShardUpdateManyWithWhereWithoutHollowKeyInput | KeyShardUpdateManyWithWhereWithoutHollowKeyInput[]
    deleteMany?: KeyShardScalarWhereInput | KeyShardScalarWhereInput[]
  }

  export type KeyEventUpdateManyWithoutHollowKeyNestedInput = {
    create?: XOR<KeyEventCreateWithoutHollowKeyInput, KeyEventUncheckedCreateWithoutHollowKeyInput> | KeyEventCreateWithoutHollowKeyInput[] | KeyEventUncheckedCreateWithoutHollowKeyInput[]
    connectOrCreate?: KeyEventCreateOrConnectWithoutHollowKeyInput | KeyEventCreateOrConnectWithoutHollowKeyInput[]
    upsert?: KeyEventUpsertWithWhereUniqueWithoutHollowKeyInput | KeyEventUpsertWithWhereUniqueWithoutHollowKeyInput[]
    createMany?: KeyEventCreateManyHollowKeyInputEnvelope
    set?: KeyEventWhereUniqueInput | KeyEventWhereUniqueInput[]
    disconnect?: KeyEventWhereUniqueInput | KeyEventWhereUniqueInput[]
    delete?: KeyEventWhereUniqueInput | KeyEventWhereUniqueInput[]
    connect?: KeyEventWhereUniqueInput | KeyEventWhereUniqueInput[]
    update?: KeyEventUpdateWithWhereUniqueWithoutHollowKeyInput | KeyEventUpdateWithWhereUniqueWithoutHollowKeyInput[]
    updateMany?: KeyEventUpdateManyWithWhereWithoutHollowKeyInput | KeyEventUpdateManyWithWhereWithoutHollowKeyInput[]
    deleteMany?: KeyEventScalarWhereInput | KeyEventScalarWhereInput[]
  }

  export type KeyShardUncheckedUpdateManyWithoutHollowKeyNestedInput = {
    create?: XOR<KeyShardCreateWithoutHollowKeyInput, KeyShardUncheckedCreateWithoutHollowKeyInput> | KeyShardCreateWithoutHollowKeyInput[] | KeyShardUncheckedCreateWithoutHollowKeyInput[]
    connectOrCreate?: KeyShardCreateOrConnectWithoutHollowKeyInput | KeyShardCreateOrConnectWithoutHollowKeyInput[]
    upsert?: KeyShardUpsertWithWhereUniqueWithoutHollowKeyInput | KeyShardUpsertWithWhereUniqueWithoutHollowKeyInput[]
    createMany?: KeyShardCreateManyHollowKeyInputEnvelope
    set?: KeyShardWhereUniqueInput | KeyShardWhereUniqueInput[]
    disconnect?: KeyShardWhereUniqueInput | KeyShardWhereUniqueInput[]
    delete?: KeyShardWhereUniqueInput | KeyShardWhereUniqueInput[]
    connect?: KeyShardWhereUniqueInput | KeyShardWhereUniqueInput[]
    update?: KeyShardUpdateWithWhereUniqueWithoutHollowKeyInput | KeyShardUpdateWithWhereUniqueWithoutHollowKeyInput[]
    updateMany?: KeyShardUpdateManyWithWhereWithoutHollowKeyInput | KeyShardUpdateManyWithWhereWithoutHollowKeyInput[]
    deleteMany?: KeyShardScalarWhereInput | KeyShardScalarWhereInput[]
  }

  export type KeyEventUncheckedUpdateManyWithoutHollowKeyNestedInput = {
    create?: XOR<KeyEventCreateWithoutHollowKeyInput, KeyEventUncheckedCreateWithoutHollowKeyInput> | KeyEventCreateWithoutHollowKeyInput[] | KeyEventUncheckedCreateWithoutHollowKeyInput[]
    connectOrCreate?: KeyEventCreateOrConnectWithoutHollowKeyInput | KeyEventCreateOrConnectWithoutHollowKeyInput[]
    upsert?: KeyEventUpsertWithWhereUniqueWithoutHollowKeyInput | KeyEventUpsertWithWhereUniqueWithoutHollowKeyInput[]
    createMany?: KeyEventCreateManyHollowKeyInputEnvelope
    set?: KeyEventWhereUniqueInput | KeyEventWhereUniqueInput[]
    disconnect?: KeyEventWhereUniqueInput | KeyEventWhereUniqueInput[]
    delete?: KeyEventWhereUniqueInput | KeyEventWhereUniqueInput[]
    connect?: KeyEventWhereUniqueInput | KeyEventWhereUniqueInput[]
    update?: KeyEventUpdateWithWhereUniqueWithoutHollowKeyInput | KeyEventUpdateWithWhereUniqueWithoutHollowKeyInput[]
    updateMany?: KeyEventUpdateManyWithWhereWithoutHollowKeyInput | KeyEventUpdateManyWithWhereWithoutHollowKeyInput[]
    deleteMany?: KeyEventScalarWhereInput | KeyEventScalarWhereInput[]
  }

  export type HollowKeyCreateNestedOneWithoutShardsInput = {
    create?: XOR<HollowKeyCreateWithoutShardsInput, HollowKeyUncheckedCreateWithoutShardsInput>
    connectOrCreate?: HollowKeyCreateOrConnectWithoutShardsInput
    connect?: HollowKeyWhereUniqueInput
  }

  export type HollowKeyUpdateOneRequiredWithoutShardsNestedInput = {
    create?: XOR<HollowKeyCreateWithoutShardsInput, HollowKeyUncheckedCreateWithoutShardsInput>
    connectOrCreate?: HollowKeyCreateOrConnectWithoutShardsInput
    upsert?: HollowKeyUpsertWithoutShardsInput
    connect?: HollowKeyWhereUniqueInput
    update?: XOR<XOR<HollowKeyUpdateToOneWithWhereWithoutShardsInput, HollowKeyUpdateWithoutShardsInput>, HollowKeyUncheckedUpdateWithoutShardsInput>
  }

  export type HollowKeyCreateNestedOneWithoutEventsInput = {
    create?: XOR<HollowKeyCreateWithoutEventsInput, HollowKeyUncheckedCreateWithoutEventsInput>
    connectOrCreate?: HollowKeyCreateOrConnectWithoutEventsInput
    connect?: HollowKeyWhereUniqueInput
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type HollowKeyUpdateOneRequiredWithoutEventsNestedInput = {
    create?: XOR<HollowKeyCreateWithoutEventsInput, HollowKeyUncheckedCreateWithoutEventsInput>
    connectOrCreate?: HollowKeyCreateOrConnectWithoutEventsInput
    upsert?: HollowKeyUpsertWithoutEventsInput
    connect?: HollowKeyWhereUniqueInput
    update?: XOR<XOR<HollowKeyUpdateToOneWithWhereWithoutEventsInput, HollowKeyUpdateWithoutEventsInput>, HollowKeyUncheckedUpdateWithoutEventsInput>
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedEnumKeyStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.KeyStatus | EnumKeyStatusFieldRefInput<$PrismaModel>
    in?: $Enums.KeyStatus[] | ListEnumKeyStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.KeyStatus[] | ListEnumKeyStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumKeyStatusFilter<$PrismaModel> | $Enums.KeyStatus
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NestedDateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedEnumKeyStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.KeyStatus | EnumKeyStatusFieldRefInput<$PrismaModel>
    in?: $Enums.KeyStatus[] | ListEnumKeyStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.KeyStatus[] | ListEnumKeyStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumKeyStatusWithAggregatesFilter<$PrismaModel> | $Enums.KeyStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumKeyStatusFilter<$PrismaModel>
    _max?: NestedEnumKeyStatusFilter<$PrismaModel>
  }

  export type NestedIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type NestedFloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type NestedDateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }
  export type NestedJsonNullableFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<NestedJsonNullableFilterBase<$PrismaModel>>, Exclude<keyof Required<NestedJsonNullableFilterBase<$PrismaModel>>, 'path'>>,
        Required<NestedJsonNullableFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<NestedJsonNullableFilterBase<$PrismaModel>>, 'path'>>

  export type NestedJsonNullableFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type KeyShardCreateWithoutHollowKeyInput = {
    id?: string
    shardIndex: number
    vaultLocation: string
    shardHash: string
    createdAt?: Date | string
  }

  export type KeyShardUncheckedCreateWithoutHollowKeyInput = {
    id?: string
    shardIndex: number
    vaultLocation: string
    shardHash: string
    createdAt?: Date | string
  }

  export type KeyShardCreateOrConnectWithoutHollowKeyInput = {
    where: KeyShardWhereUniqueInput
    create: XOR<KeyShardCreateWithoutHollowKeyInput, KeyShardUncheckedCreateWithoutHollowKeyInput>
  }

  export type KeyShardCreateManyHollowKeyInputEnvelope = {
    data: KeyShardCreateManyHollowKeyInput | KeyShardCreateManyHollowKeyInput[]
    skipDuplicates?: boolean
  }

  export type KeyEventCreateWithoutHollowKeyInput = {
    id?: string
    eventType: string
    traceId?: string | null
    agentId?: string | null
    metadata?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
  }

  export type KeyEventUncheckedCreateWithoutHollowKeyInput = {
    id?: string
    eventType: string
    traceId?: string | null
    agentId?: string | null
    metadata?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
  }

  export type KeyEventCreateOrConnectWithoutHollowKeyInput = {
    where: KeyEventWhereUniqueInput
    create: XOR<KeyEventCreateWithoutHollowKeyInput, KeyEventUncheckedCreateWithoutHollowKeyInput>
  }

  export type KeyEventCreateManyHollowKeyInputEnvelope = {
    data: KeyEventCreateManyHollowKeyInput | KeyEventCreateManyHollowKeyInput[]
    skipDuplicates?: boolean
  }

  export type KeyShardUpsertWithWhereUniqueWithoutHollowKeyInput = {
    where: KeyShardWhereUniqueInput
    update: XOR<KeyShardUpdateWithoutHollowKeyInput, KeyShardUncheckedUpdateWithoutHollowKeyInput>
    create: XOR<KeyShardCreateWithoutHollowKeyInput, KeyShardUncheckedCreateWithoutHollowKeyInput>
  }

  export type KeyShardUpdateWithWhereUniqueWithoutHollowKeyInput = {
    where: KeyShardWhereUniqueInput
    data: XOR<KeyShardUpdateWithoutHollowKeyInput, KeyShardUncheckedUpdateWithoutHollowKeyInput>
  }

  export type KeyShardUpdateManyWithWhereWithoutHollowKeyInput = {
    where: KeyShardScalarWhereInput
    data: XOR<KeyShardUpdateManyMutationInput, KeyShardUncheckedUpdateManyWithoutHollowKeyInput>
  }

  export type KeyShardScalarWhereInput = {
    AND?: KeyShardScalarWhereInput | KeyShardScalarWhereInput[]
    OR?: KeyShardScalarWhereInput[]
    NOT?: KeyShardScalarWhereInput | KeyShardScalarWhereInput[]
    id?: StringFilter<"KeyShard"> | string
    hollowKeyId?: StringFilter<"KeyShard"> | string
    shardIndex?: IntFilter<"KeyShard"> | number
    vaultLocation?: StringFilter<"KeyShard"> | string
    shardHash?: StringFilter<"KeyShard"> | string
    createdAt?: DateTimeFilter<"KeyShard"> | Date | string
  }

  export type KeyEventUpsertWithWhereUniqueWithoutHollowKeyInput = {
    where: KeyEventWhereUniqueInput
    update: XOR<KeyEventUpdateWithoutHollowKeyInput, KeyEventUncheckedUpdateWithoutHollowKeyInput>
    create: XOR<KeyEventCreateWithoutHollowKeyInput, KeyEventUncheckedCreateWithoutHollowKeyInput>
  }

  export type KeyEventUpdateWithWhereUniqueWithoutHollowKeyInput = {
    where: KeyEventWhereUniqueInput
    data: XOR<KeyEventUpdateWithoutHollowKeyInput, KeyEventUncheckedUpdateWithoutHollowKeyInput>
  }

  export type KeyEventUpdateManyWithWhereWithoutHollowKeyInput = {
    where: KeyEventScalarWhereInput
    data: XOR<KeyEventUpdateManyMutationInput, KeyEventUncheckedUpdateManyWithoutHollowKeyInput>
  }

  export type KeyEventScalarWhereInput = {
    AND?: KeyEventScalarWhereInput | KeyEventScalarWhereInput[]
    OR?: KeyEventScalarWhereInput[]
    NOT?: KeyEventScalarWhereInput | KeyEventScalarWhereInput[]
    id?: StringFilter<"KeyEvent"> | string
    hollowKeyId?: StringFilter<"KeyEvent"> | string
    eventType?: StringFilter<"KeyEvent"> | string
    traceId?: StringNullableFilter<"KeyEvent"> | string | null
    agentId?: StringNullableFilter<"KeyEvent"> | string | null
    metadata?: JsonNullableFilter<"KeyEvent">
    createdAt?: DateTimeFilter<"KeyEvent"> | Date | string
  }

  export type HollowKeyCreateWithoutShardsInput = {
    id?: string
    userId: string
    name?: string
    agentId: string
    agentName: string
    provider: string
    allowedIntent: string
    status?: $Enums.KeyStatus
    timesUsed?: number
    lastUsedAt?: Date | string
    expiresAt?: Date | string | null
    createdAt?: Date | string
    events?: KeyEventCreateNestedManyWithoutHollowKeyInput
  }

  export type HollowKeyUncheckedCreateWithoutShardsInput = {
    id?: string
    userId: string
    name?: string
    agentId: string
    agentName: string
    provider: string
    allowedIntent: string
    status?: $Enums.KeyStatus
    timesUsed?: number
    lastUsedAt?: Date | string
    expiresAt?: Date | string | null
    createdAt?: Date | string
    events?: KeyEventUncheckedCreateNestedManyWithoutHollowKeyInput
  }

  export type HollowKeyCreateOrConnectWithoutShardsInput = {
    where: HollowKeyWhereUniqueInput
    create: XOR<HollowKeyCreateWithoutShardsInput, HollowKeyUncheckedCreateWithoutShardsInput>
  }

  export type HollowKeyUpsertWithoutShardsInput = {
    update: XOR<HollowKeyUpdateWithoutShardsInput, HollowKeyUncheckedUpdateWithoutShardsInput>
    create: XOR<HollowKeyCreateWithoutShardsInput, HollowKeyUncheckedCreateWithoutShardsInput>
    where?: HollowKeyWhereInput
  }

  export type HollowKeyUpdateToOneWithWhereWithoutShardsInput = {
    where?: HollowKeyWhereInput
    data: XOR<HollowKeyUpdateWithoutShardsInput, HollowKeyUncheckedUpdateWithoutShardsInput>
  }

  export type HollowKeyUpdateWithoutShardsInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    agentId?: StringFieldUpdateOperationsInput | string
    agentName?: StringFieldUpdateOperationsInput | string
    provider?: StringFieldUpdateOperationsInput | string
    allowedIntent?: StringFieldUpdateOperationsInput | string
    status?: EnumKeyStatusFieldUpdateOperationsInput | $Enums.KeyStatus
    timesUsed?: IntFieldUpdateOperationsInput | number
    lastUsedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    expiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    events?: KeyEventUpdateManyWithoutHollowKeyNestedInput
  }

  export type HollowKeyUncheckedUpdateWithoutShardsInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    agentId?: StringFieldUpdateOperationsInput | string
    agentName?: StringFieldUpdateOperationsInput | string
    provider?: StringFieldUpdateOperationsInput | string
    allowedIntent?: StringFieldUpdateOperationsInput | string
    status?: EnumKeyStatusFieldUpdateOperationsInput | $Enums.KeyStatus
    timesUsed?: IntFieldUpdateOperationsInput | number
    lastUsedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    expiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    events?: KeyEventUncheckedUpdateManyWithoutHollowKeyNestedInput
  }

  export type HollowKeyCreateWithoutEventsInput = {
    id?: string
    userId: string
    name?: string
    agentId: string
    agentName: string
    provider: string
    allowedIntent: string
    status?: $Enums.KeyStatus
    timesUsed?: number
    lastUsedAt?: Date | string
    expiresAt?: Date | string | null
    createdAt?: Date | string
    shards?: KeyShardCreateNestedManyWithoutHollowKeyInput
  }

  export type HollowKeyUncheckedCreateWithoutEventsInput = {
    id?: string
    userId: string
    name?: string
    agentId: string
    agentName: string
    provider: string
    allowedIntent: string
    status?: $Enums.KeyStatus
    timesUsed?: number
    lastUsedAt?: Date | string
    expiresAt?: Date | string | null
    createdAt?: Date | string
    shards?: KeyShardUncheckedCreateNestedManyWithoutHollowKeyInput
  }

  export type HollowKeyCreateOrConnectWithoutEventsInput = {
    where: HollowKeyWhereUniqueInput
    create: XOR<HollowKeyCreateWithoutEventsInput, HollowKeyUncheckedCreateWithoutEventsInput>
  }

  export type HollowKeyUpsertWithoutEventsInput = {
    update: XOR<HollowKeyUpdateWithoutEventsInput, HollowKeyUncheckedUpdateWithoutEventsInput>
    create: XOR<HollowKeyCreateWithoutEventsInput, HollowKeyUncheckedCreateWithoutEventsInput>
    where?: HollowKeyWhereInput
  }

  export type HollowKeyUpdateToOneWithWhereWithoutEventsInput = {
    where?: HollowKeyWhereInput
    data: XOR<HollowKeyUpdateWithoutEventsInput, HollowKeyUncheckedUpdateWithoutEventsInput>
  }

  export type HollowKeyUpdateWithoutEventsInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    agentId?: StringFieldUpdateOperationsInput | string
    agentName?: StringFieldUpdateOperationsInput | string
    provider?: StringFieldUpdateOperationsInput | string
    allowedIntent?: StringFieldUpdateOperationsInput | string
    status?: EnumKeyStatusFieldUpdateOperationsInput | $Enums.KeyStatus
    timesUsed?: IntFieldUpdateOperationsInput | number
    lastUsedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    expiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    shards?: KeyShardUpdateManyWithoutHollowKeyNestedInput
  }

  export type HollowKeyUncheckedUpdateWithoutEventsInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    agentId?: StringFieldUpdateOperationsInput | string
    agentName?: StringFieldUpdateOperationsInput | string
    provider?: StringFieldUpdateOperationsInput | string
    allowedIntent?: StringFieldUpdateOperationsInput | string
    status?: EnumKeyStatusFieldUpdateOperationsInput | $Enums.KeyStatus
    timesUsed?: IntFieldUpdateOperationsInput | number
    lastUsedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    expiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    shards?: KeyShardUncheckedUpdateManyWithoutHollowKeyNestedInput
  }

  export type KeyShardCreateManyHollowKeyInput = {
    id?: string
    shardIndex: number
    vaultLocation: string
    shardHash: string
    createdAt?: Date | string
  }

  export type KeyEventCreateManyHollowKeyInput = {
    id?: string
    eventType: string
    traceId?: string | null
    agentId?: string | null
    metadata?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
  }

  export type KeyShardUpdateWithoutHollowKeyInput = {
    id?: StringFieldUpdateOperationsInput | string
    shardIndex?: IntFieldUpdateOperationsInput | number
    vaultLocation?: StringFieldUpdateOperationsInput | string
    shardHash?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type KeyShardUncheckedUpdateWithoutHollowKeyInput = {
    id?: StringFieldUpdateOperationsInput | string
    shardIndex?: IntFieldUpdateOperationsInput | number
    vaultLocation?: StringFieldUpdateOperationsInput | string
    shardHash?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type KeyShardUncheckedUpdateManyWithoutHollowKeyInput = {
    id?: StringFieldUpdateOperationsInput | string
    shardIndex?: IntFieldUpdateOperationsInput | number
    vaultLocation?: StringFieldUpdateOperationsInput | string
    shardHash?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type KeyEventUpdateWithoutHollowKeyInput = {
    id?: StringFieldUpdateOperationsInput | string
    eventType?: StringFieldUpdateOperationsInput | string
    traceId?: NullableStringFieldUpdateOperationsInput | string | null
    agentId?: NullableStringFieldUpdateOperationsInput | string | null
    metadata?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type KeyEventUncheckedUpdateWithoutHollowKeyInput = {
    id?: StringFieldUpdateOperationsInput | string
    eventType?: StringFieldUpdateOperationsInput | string
    traceId?: NullableStringFieldUpdateOperationsInput | string | null
    agentId?: NullableStringFieldUpdateOperationsInput | string | null
    metadata?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type KeyEventUncheckedUpdateManyWithoutHollowKeyInput = {
    id?: StringFieldUpdateOperationsInput | string
    eventType?: StringFieldUpdateOperationsInput | string
    traceId?: NullableStringFieldUpdateOperationsInput | string | null
    agentId?: NullableStringFieldUpdateOperationsInput | string | null
    metadata?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }



  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}