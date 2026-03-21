
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
 * Model SandboxLog
 * 
 */
export type SandboxLog = $Result.DefaultSelection<Prisma.$SandboxLogPayload>

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient({
 *   adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL })
 * })
 * // Fetch zero or more SandboxLogs
 * const sandboxLogs = await prisma.sandboxLog.findMany()
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
   * // Fetch zero or more SandboxLogs
   * const sandboxLogs = await prisma.sandboxLog.findMany()
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
   * `prisma.sandboxLog`: Exposes CRUD operations for the **SandboxLog** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more SandboxLogs
    * const sandboxLogs = await prisma.sandboxLog.findMany()
    * ```
    */
  get sandboxLog(): Prisma.SandboxLogDelegate<ExtArgs, ClientOptions>;
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
    SandboxLog: 'SandboxLog'
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
      modelProps: "sandboxLog"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      SandboxLog: {
        payload: Prisma.$SandboxLogPayload<ExtArgs>
        fields: Prisma.SandboxLogFieldRefs
        operations: {
          findUnique: {
            args: Prisma.SandboxLogFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SandboxLogPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.SandboxLogFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SandboxLogPayload>
          }
          findFirst: {
            args: Prisma.SandboxLogFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SandboxLogPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.SandboxLogFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SandboxLogPayload>
          }
          findMany: {
            args: Prisma.SandboxLogFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SandboxLogPayload>[]
          }
          create: {
            args: Prisma.SandboxLogCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SandboxLogPayload>
          }
          createMany: {
            args: Prisma.SandboxLogCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.SandboxLogCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SandboxLogPayload>[]
          }
          delete: {
            args: Prisma.SandboxLogDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SandboxLogPayload>
          }
          update: {
            args: Prisma.SandboxLogUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SandboxLogPayload>
          }
          deleteMany: {
            args: Prisma.SandboxLogDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.SandboxLogUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.SandboxLogUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SandboxLogPayload>[]
          }
          upsert: {
            args: Prisma.SandboxLogUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SandboxLogPayload>
          }
          aggregate: {
            args: Prisma.SandboxLogAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateSandboxLog>
          }
          groupBy: {
            args: Prisma.SandboxLogGroupByArgs<ExtArgs>
            result: $Utils.Optional<SandboxLogGroupByOutputType>[]
          }
          count: {
            args: Prisma.SandboxLogCountArgs<ExtArgs>
            result: $Utils.Optional<SandboxLogCountAggregateOutputType> | number
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
    sandboxLog?: SandboxLogOmit
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
   * Models
   */

  /**
   * Model SandboxLog
   */

  export type AggregateSandboxLog = {
    _count: SandboxLogCountAggregateOutputType | null
    _avg: SandboxLogAvgAggregateOutputType | null
    _sum: SandboxLogSumAggregateOutputType | null
    _min: SandboxLogMinAggregateOutputType | null
    _max: SandboxLogMaxAggregateOutputType | null
  }

  export type SandboxLogAvgAggregateOutputType = {
    exitCode: number | null
    durationMs: number | null
  }

  export type SandboxLogSumAggregateOutputType = {
    exitCode: number | null
    durationMs: number | null
  }

  export type SandboxLogMinAggregateOutputType = {
    id: string | null
    sandboxId: string | null
    agentId: string | null
    userId: string | null
    image: string | null
    intent: string | null
    stdout: string | null
    stderr: string | null
    exitCode: number | null
    status: string | null
    durationMs: number | null
    executedAt: Date | null
  }

  export type SandboxLogMaxAggregateOutputType = {
    id: string | null
    sandboxId: string | null
    agentId: string | null
    userId: string | null
    image: string | null
    intent: string | null
    stdout: string | null
    stderr: string | null
    exitCode: number | null
    status: string | null
    durationMs: number | null
    executedAt: Date | null
  }

  export type SandboxLogCountAggregateOutputType = {
    id: number
    sandboxId: number
    agentId: number
    userId: number
    image: number
    command: number
    intent: number
    stdout: number
    stderr: number
    exitCode: number
    status: number
    durationMs: number
    executedAt: number
    _all: number
  }


  export type SandboxLogAvgAggregateInputType = {
    exitCode?: true
    durationMs?: true
  }

  export type SandboxLogSumAggregateInputType = {
    exitCode?: true
    durationMs?: true
  }

  export type SandboxLogMinAggregateInputType = {
    id?: true
    sandboxId?: true
    agentId?: true
    userId?: true
    image?: true
    intent?: true
    stdout?: true
    stderr?: true
    exitCode?: true
    status?: true
    durationMs?: true
    executedAt?: true
  }

  export type SandboxLogMaxAggregateInputType = {
    id?: true
    sandboxId?: true
    agentId?: true
    userId?: true
    image?: true
    intent?: true
    stdout?: true
    stderr?: true
    exitCode?: true
    status?: true
    durationMs?: true
    executedAt?: true
  }

  export type SandboxLogCountAggregateInputType = {
    id?: true
    sandboxId?: true
    agentId?: true
    userId?: true
    image?: true
    command?: true
    intent?: true
    stdout?: true
    stderr?: true
    exitCode?: true
    status?: true
    durationMs?: true
    executedAt?: true
    _all?: true
  }

  export type SandboxLogAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which SandboxLog to aggregate.
     */
    where?: SandboxLogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SandboxLogs to fetch.
     */
    orderBy?: SandboxLogOrderByWithRelationInput | SandboxLogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: SandboxLogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SandboxLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SandboxLogs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned SandboxLogs
    **/
    _count?: true | SandboxLogCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: SandboxLogAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: SandboxLogSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: SandboxLogMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: SandboxLogMaxAggregateInputType
  }

  export type GetSandboxLogAggregateType<T extends SandboxLogAggregateArgs> = {
        [P in keyof T & keyof AggregateSandboxLog]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateSandboxLog[P]>
      : GetScalarType<T[P], AggregateSandboxLog[P]>
  }




  export type SandboxLogGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: SandboxLogWhereInput
    orderBy?: SandboxLogOrderByWithAggregationInput | SandboxLogOrderByWithAggregationInput[]
    by: SandboxLogScalarFieldEnum[] | SandboxLogScalarFieldEnum
    having?: SandboxLogScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: SandboxLogCountAggregateInputType | true
    _avg?: SandboxLogAvgAggregateInputType
    _sum?: SandboxLogSumAggregateInputType
    _min?: SandboxLogMinAggregateInputType
    _max?: SandboxLogMaxAggregateInputType
  }

  export type SandboxLogGroupByOutputType = {
    id: string
    sandboxId: string
    agentId: string
    userId: string
    image: string
    command: string[]
    intent: string
    stdout: string | null
    stderr: string | null
    exitCode: number | null
    status: string
    durationMs: number
    executedAt: Date
    _count: SandboxLogCountAggregateOutputType | null
    _avg: SandboxLogAvgAggregateOutputType | null
    _sum: SandboxLogSumAggregateOutputType | null
    _min: SandboxLogMinAggregateOutputType | null
    _max: SandboxLogMaxAggregateOutputType | null
  }

  type GetSandboxLogGroupByPayload<T extends SandboxLogGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<SandboxLogGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof SandboxLogGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], SandboxLogGroupByOutputType[P]>
            : GetScalarType<T[P], SandboxLogGroupByOutputType[P]>
        }
      >
    >


  export type SandboxLogSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    sandboxId?: boolean
    agentId?: boolean
    userId?: boolean
    image?: boolean
    command?: boolean
    intent?: boolean
    stdout?: boolean
    stderr?: boolean
    exitCode?: boolean
    status?: boolean
    durationMs?: boolean
    executedAt?: boolean
  }, ExtArgs["result"]["sandboxLog"]>

  export type SandboxLogSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    sandboxId?: boolean
    agentId?: boolean
    userId?: boolean
    image?: boolean
    command?: boolean
    intent?: boolean
    stdout?: boolean
    stderr?: boolean
    exitCode?: boolean
    status?: boolean
    durationMs?: boolean
    executedAt?: boolean
  }, ExtArgs["result"]["sandboxLog"]>

  export type SandboxLogSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    sandboxId?: boolean
    agentId?: boolean
    userId?: boolean
    image?: boolean
    command?: boolean
    intent?: boolean
    stdout?: boolean
    stderr?: boolean
    exitCode?: boolean
    status?: boolean
    durationMs?: boolean
    executedAt?: boolean
  }, ExtArgs["result"]["sandboxLog"]>

  export type SandboxLogSelectScalar = {
    id?: boolean
    sandboxId?: boolean
    agentId?: boolean
    userId?: boolean
    image?: boolean
    command?: boolean
    intent?: boolean
    stdout?: boolean
    stderr?: boolean
    exitCode?: boolean
    status?: boolean
    durationMs?: boolean
    executedAt?: boolean
  }

  export type SandboxLogOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "sandboxId" | "agentId" | "userId" | "image" | "command" | "intent" | "stdout" | "stderr" | "exitCode" | "status" | "durationMs" | "executedAt", ExtArgs["result"]["sandboxLog"]>

  export type $SandboxLogPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "SandboxLog"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      sandboxId: string
      agentId: string
      userId: string
      image: string
      command: string[]
      intent: string
      stdout: string | null
      stderr: string | null
      exitCode: number | null
      status: string
      durationMs: number
      executedAt: Date
    }, ExtArgs["result"]["sandboxLog"]>
    composites: {}
  }

  type SandboxLogGetPayload<S extends boolean | null | undefined | SandboxLogDefaultArgs> = $Result.GetResult<Prisma.$SandboxLogPayload, S>

  type SandboxLogCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<SandboxLogFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: SandboxLogCountAggregateInputType | true
    }

  export interface SandboxLogDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['SandboxLog'], meta: { name: 'SandboxLog' } }
    /**
     * Find zero or one SandboxLog that matches the filter.
     * @param {SandboxLogFindUniqueArgs} args - Arguments to find a SandboxLog
     * @example
     * // Get one SandboxLog
     * const sandboxLog = await prisma.sandboxLog.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends SandboxLogFindUniqueArgs>(args: SelectSubset<T, SandboxLogFindUniqueArgs<ExtArgs>>): Prisma__SandboxLogClient<$Result.GetResult<Prisma.$SandboxLogPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one SandboxLog that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {SandboxLogFindUniqueOrThrowArgs} args - Arguments to find a SandboxLog
     * @example
     * // Get one SandboxLog
     * const sandboxLog = await prisma.sandboxLog.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends SandboxLogFindUniqueOrThrowArgs>(args: SelectSubset<T, SandboxLogFindUniqueOrThrowArgs<ExtArgs>>): Prisma__SandboxLogClient<$Result.GetResult<Prisma.$SandboxLogPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first SandboxLog that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SandboxLogFindFirstArgs} args - Arguments to find a SandboxLog
     * @example
     * // Get one SandboxLog
     * const sandboxLog = await prisma.sandboxLog.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends SandboxLogFindFirstArgs>(args?: SelectSubset<T, SandboxLogFindFirstArgs<ExtArgs>>): Prisma__SandboxLogClient<$Result.GetResult<Prisma.$SandboxLogPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first SandboxLog that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SandboxLogFindFirstOrThrowArgs} args - Arguments to find a SandboxLog
     * @example
     * // Get one SandboxLog
     * const sandboxLog = await prisma.sandboxLog.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends SandboxLogFindFirstOrThrowArgs>(args?: SelectSubset<T, SandboxLogFindFirstOrThrowArgs<ExtArgs>>): Prisma__SandboxLogClient<$Result.GetResult<Prisma.$SandboxLogPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more SandboxLogs that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SandboxLogFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all SandboxLogs
     * const sandboxLogs = await prisma.sandboxLog.findMany()
     * 
     * // Get first 10 SandboxLogs
     * const sandboxLogs = await prisma.sandboxLog.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const sandboxLogWithIdOnly = await prisma.sandboxLog.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends SandboxLogFindManyArgs>(args?: SelectSubset<T, SandboxLogFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SandboxLogPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a SandboxLog.
     * @param {SandboxLogCreateArgs} args - Arguments to create a SandboxLog.
     * @example
     * // Create one SandboxLog
     * const SandboxLog = await prisma.sandboxLog.create({
     *   data: {
     *     // ... data to create a SandboxLog
     *   }
     * })
     * 
     */
    create<T extends SandboxLogCreateArgs>(args: SelectSubset<T, SandboxLogCreateArgs<ExtArgs>>): Prisma__SandboxLogClient<$Result.GetResult<Prisma.$SandboxLogPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many SandboxLogs.
     * @param {SandboxLogCreateManyArgs} args - Arguments to create many SandboxLogs.
     * @example
     * // Create many SandboxLogs
     * const sandboxLog = await prisma.sandboxLog.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends SandboxLogCreateManyArgs>(args?: SelectSubset<T, SandboxLogCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many SandboxLogs and returns the data saved in the database.
     * @param {SandboxLogCreateManyAndReturnArgs} args - Arguments to create many SandboxLogs.
     * @example
     * // Create many SandboxLogs
     * const sandboxLog = await prisma.sandboxLog.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many SandboxLogs and only return the `id`
     * const sandboxLogWithIdOnly = await prisma.sandboxLog.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends SandboxLogCreateManyAndReturnArgs>(args?: SelectSubset<T, SandboxLogCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SandboxLogPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a SandboxLog.
     * @param {SandboxLogDeleteArgs} args - Arguments to delete one SandboxLog.
     * @example
     * // Delete one SandboxLog
     * const SandboxLog = await prisma.sandboxLog.delete({
     *   where: {
     *     // ... filter to delete one SandboxLog
     *   }
     * })
     * 
     */
    delete<T extends SandboxLogDeleteArgs>(args: SelectSubset<T, SandboxLogDeleteArgs<ExtArgs>>): Prisma__SandboxLogClient<$Result.GetResult<Prisma.$SandboxLogPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one SandboxLog.
     * @param {SandboxLogUpdateArgs} args - Arguments to update one SandboxLog.
     * @example
     * // Update one SandboxLog
     * const sandboxLog = await prisma.sandboxLog.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends SandboxLogUpdateArgs>(args: SelectSubset<T, SandboxLogUpdateArgs<ExtArgs>>): Prisma__SandboxLogClient<$Result.GetResult<Prisma.$SandboxLogPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more SandboxLogs.
     * @param {SandboxLogDeleteManyArgs} args - Arguments to filter SandboxLogs to delete.
     * @example
     * // Delete a few SandboxLogs
     * const { count } = await prisma.sandboxLog.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends SandboxLogDeleteManyArgs>(args?: SelectSubset<T, SandboxLogDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more SandboxLogs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SandboxLogUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many SandboxLogs
     * const sandboxLog = await prisma.sandboxLog.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends SandboxLogUpdateManyArgs>(args: SelectSubset<T, SandboxLogUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more SandboxLogs and returns the data updated in the database.
     * @param {SandboxLogUpdateManyAndReturnArgs} args - Arguments to update many SandboxLogs.
     * @example
     * // Update many SandboxLogs
     * const sandboxLog = await prisma.sandboxLog.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more SandboxLogs and only return the `id`
     * const sandboxLogWithIdOnly = await prisma.sandboxLog.updateManyAndReturn({
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
    updateManyAndReturn<T extends SandboxLogUpdateManyAndReturnArgs>(args: SelectSubset<T, SandboxLogUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SandboxLogPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one SandboxLog.
     * @param {SandboxLogUpsertArgs} args - Arguments to update or create a SandboxLog.
     * @example
     * // Update or create a SandboxLog
     * const sandboxLog = await prisma.sandboxLog.upsert({
     *   create: {
     *     // ... data to create a SandboxLog
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the SandboxLog we want to update
     *   }
     * })
     */
    upsert<T extends SandboxLogUpsertArgs>(args: SelectSubset<T, SandboxLogUpsertArgs<ExtArgs>>): Prisma__SandboxLogClient<$Result.GetResult<Prisma.$SandboxLogPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of SandboxLogs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SandboxLogCountArgs} args - Arguments to filter SandboxLogs to count.
     * @example
     * // Count the number of SandboxLogs
     * const count = await prisma.sandboxLog.count({
     *   where: {
     *     // ... the filter for the SandboxLogs we want to count
     *   }
     * })
    **/
    count<T extends SandboxLogCountArgs>(
      args?: Subset<T, SandboxLogCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], SandboxLogCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a SandboxLog.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SandboxLogAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends SandboxLogAggregateArgs>(args: Subset<T, SandboxLogAggregateArgs>): Prisma.PrismaPromise<GetSandboxLogAggregateType<T>>

    /**
     * Group by SandboxLog.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SandboxLogGroupByArgs} args - Group by arguments.
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
      T extends SandboxLogGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: SandboxLogGroupByArgs['orderBy'] }
        : { orderBy?: SandboxLogGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, SandboxLogGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetSandboxLogGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the SandboxLog model
   */
  readonly fields: SandboxLogFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for SandboxLog.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__SandboxLogClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
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
   * Fields of the SandboxLog model
   */
  interface SandboxLogFieldRefs {
    readonly id: FieldRef<"SandboxLog", 'String'>
    readonly sandboxId: FieldRef<"SandboxLog", 'String'>
    readonly agentId: FieldRef<"SandboxLog", 'String'>
    readonly userId: FieldRef<"SandboxLog", 'String'>
    readonly image: FieldRef<"SandboxLog", 'String'>
    readonly command: FieldRef<"SandboxLog", 'String[]'>
    readonly intent: FieldRef<"SandboxLog", 'String'>
    readonly stdout: FieldRef<"SandboxLog", 'String'>
    readonly stderr: FieldRef<"SandboxLog", 'String'>
    readonly exitCode: FieldRef<"SandboxLog", 'Int'>
    readonly status: FieldRef<"SandboxLog", 'String'>
    readonly durationMs: FieldRef<"SandboxLog", 'Int'>
    readonly executedAt: FieldRef<"SandboxLog", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * SandboxLog findUnique
   */
  export type SandboxLogFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SandboxLog
     */
    select?: SandboxLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SandboxLog
     */
    omit?: SandboxLogOmit<ExtArgs> | null
    /**
     * Filter, which SandboxLog to fetch.
     */
    where: SandboxLogWhereUniqueInput
  }

  /**
   * SandboxLog findUniqueOrThrow
   */
  export type SandboxLogFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SandboxLog
     */
    select?: SandboxLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SandboxLog
     */
    omit?: SandboxLogOmit<ExtArgs> | null
    /**
     * Filter, which SandboxLog to fetch.
     */
    where: SandboxLogWhereUniqueInput
  }

  /**
   * SandboxLog findFirst
   */
  export type SandboxLogFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SandboxLog
     */
    select?: SandboxLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SandboxLog
     */
    omit?: SandboxLogOmit<ExtArgs> | null
    /**
     * Filter, which SandboxLog to fetch.
     */
    where?: SandboxLogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SandboxLogs to fetch.
     */
    orderBy?: SandboxLogOrderByWithRelationInput | SandboxLogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for SandboxLogs.
     */
    cursor?: SandboxLogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SandboxLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SandboxLogs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of SandboxLogs.
     */
    distinct?: SandboxLogScalarFieldEnum | SandboxLogScalarFieldEnum[]
  }

  /**
   * SandboxLog findFirstOrThrow
   */
  export type SandboxLogFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SandboxLog
     */
    select?: SandboxLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SandboxLog
     */
    omit?: SandboxLogOmit<ExtArgs> | null
    /**
     * Filter, which SandboxLog to fetch.
     */
    where?: SandboxLogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SandboxLogs to fetch.
     */
    orderBy?: SandboxLogOrderByWithRelationInput | SandboxLogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for SandboxLogs.
     */
    cursor?: SandboxLogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SandboxLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SandboxLogs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of SandboxLogs.
     */
    distinct?: SandboxLogScalarFieldEnum | SandboxLogScalarFieldEnum[]
  }

  /**
   * SandboxLog findMany
   */
  export type SandboxLogFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SandboxLog
     */
    select?: SandboxLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SandboxLog
     */
    omit?: SandboxLogOmit<ExtArgs> | null
    /**
     * Filter, which SandboxLogs to fetch.
     */
    where?: SandboxLogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SandboxLogs to fetch.
     */
    orderBy?: SandboxLogOrderByWithRelationInput | SandboxLogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing SandboxLogs.
     */
    cursor?: SandboxLogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SandboxLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SandboxLogs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of SandboxLogs.
     */
    distinct?: SandboxLogScalarFieldEnum | SandboxLogScalarFieldEnum[]
  }

  /**
   * SandboxLog create
   */
  export type SandboxLogCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SandboxLog
     */
    select?: SandboxLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SandboxLog
     */
    omit?: SandboxLogOmit<ExtArgs> | null
    /**
     * The data needed to create a SandboxLog.
     */
    data: XOR<SandboxLogCreateInput, SandboxLogUncheckedCreateInput>
  }

  /**
   * SandboxLog createMany
   */
  export type SandboxLogCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many SandboxLogs.
     */
    data: SandboxLogCreateManyInput | SandboxLogCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * SandboxLog createManyAndReturn
   */
  export type SandboxLogCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SandboxLog
     */
    select?: SandboxLogSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the SandboxLog
     */
    omit?: SandboxLogOmit<ExtArgs> | null
    /**
     * The data used to create many SandboxLogs.
     */
    data: SandboxLogCreateManyInput | SandboxLogCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * SandboxLog update
   */
  export type SandboxLogUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SandboxLog
     */
    select?: SandboxLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SandboxLog
     */
    omit?: SandboxLogOmit<ExtArgs> | null
    /**
     * The data needed to update a SandboxLog.
     */
    data: XOR<SandboxLogUpdateInput, SandboxLogUncheckedUpdateInput>
    /**
     * Choose, which SandboxLog to update.
     */
    where: SandboxLogWhereUniqueInput
  }

  /**
   * SandboxLog updateMany
   */
  export type SandboxLogUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update SandboxLogs.
     */
    data: XOR<SandboxLogUpdateManyMutationInput, SandboxLogUncheckedUpdateManyInput>
    /**
     * Filter which SandboxLogs to update
     */
    where?: SandboxLogWhereInput
    /**
     * Limit how many SandboxLogs to update.
     */
    limit?: number
  }

  /**
   * SandboxLog updateManyAndReturn
   */
  export type SandboxLogUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SandboxLog
     */
    select?: SandboxLogSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the SandboxLog
     */
    omit?: SandboxLogOmit<ExtArgs> | null
    /**
     * The data used to update SandboxLogs.
     */
    data: XOR<SandboxLogUpdateManyMutationInput, SandboxLogUncheckedUpdateManyInput>
    /**
     * Filter which SandboxLogs to update
     */
    where?: SandboxLogWhereInput
    /**
     * Limit how many SandboxLogs to update.
     */
    limit?: number
  }

  /**
   * SandboxLog upsert
   */
  export type SandboxLogUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SandboxLog
     */
    select?: SandboxLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SandboxLog
     */
    omit?: SandboxLogOmit<ExtArgs> | null
    /**
     * The filter to search for the SandboxLog to update in case it exists.
     */
    where: SandboxLogWhereUniqueInput
    /**
     * In case the SandboxLog found by the `where` argument doesn't exist, create a new SandboxLog with this data.
     */
    create: XOR<SandboxLogCreateInput, SandboxLogUncheckedCreateInput>
    /**
     * In case the SandboxLog was found with the provided `where` argument, update it with this data.
     */
    update: XOR<SandboxLogUpdateInput, SandboxLogUncheckedUpdateInput>
  }

  /**
   * SandboxLog delete
   */
  export type SandboxLogDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SandboxLog
     */
    select?: SandboxLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SandboxLog
     */
    omit?: SandboxLogOmit<ExtArgs> | null
    /**
     * Filter which SandboxLog to delete.
     */
    where: SandboxLogWhereUniqueInput
  }

  /**
   * SandboxLog deleteMany
   */
  export type SandboxLogDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which SandboxLogs to delete
     */
    where?: SandboxLogWhereInput
    /**
     * Limit how many SandboxLogs to delete.
     */
    limit?: number
  }

  /**
   * SandboxLog without action
   */
  export type SandboxLogDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SandboxLog
     */
    select?: SandboxLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SandboxLog
     */
    omit?: SandboxLogOmit<ExtArgs> | null
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


  export const SandboxLogScalarFieldEnum: {
    id: 'id',
    sandboxId: 'sandboxId',
    agentId: 'agentId',
    userId: 'userId',
    image: 'image',
    command: 'command',
    intent: 'intent',
    stdout: 'stdout',
    stderr: 'stderr',
    exitCode: 'exitCode',
    status: 'status',
    durationMs: 'durationMs',
    executedAt: 'executedAt'
  };

  export type SandboxLogScalarFieldEnum = (typeof SandboxLogScalarFieldEnum)[keyof typeof SandboxLogScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


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


  export type SandboxLogWhereInput = {
    AND?: SandboxLogWhereInput | SandboxLogWhereInput[]
    OR?: SandboxLogWhereInput[]
    NOT?: SandboxLogWhereInput | SandboxLogWhereInput[]
    id?: UuidFilter<"SandboxLog"> | string
    sandboxId?: StringFilter<"SandboxLog"> | string
    agentId?: StringFilter<"SandboxLog"> | string
    userId?: StringFilter<"SandboxLog"> | string
    image?: StringFilter<"SandboxLog"> | string
    command?: StringNullableListFilter<"SandboxLog">
    intent?: StringFilter<"SandboxLog"> | string
    stdout?: StringNullableFilter<"SandboxLog"> | string | null
    stderr?: StringNullableFilter<"SandboxLog"> | string | null
    exitCode?: IntNullableFilter<"SandboxLog"> | number | null
    status?: StringFilter<"SandboxLog"> | string
    durationMs?: IntFilter<"SandboxLog"> | number
    executedAt?: DateTimeFilter<"SandboxLog"> | Date | string
  }

  export type SandboxLogOrderByWithRelationInput = {
    id?: SortOrder
    sandboxId?: SortOrder
    agentId?: SortOrder
    userId?: SortOrder
    image?: SortOrder
    command?: SortOrder
    intent?: SortOrder
    stdout?: SortOrderInput | SortOrder
    stderr?: SortOrderInput | SortOrder
    exitCode?: SortOrderInput | SortOrder
    status?: SortOrder
    durationMs?: SortOrder
    executedAt?: SortOrder
  }

  export type SandboxLogWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: SandboxLogWhereInput | SandboxLogWhereInput[]
    OR?: SandboxLogWhereInput[]
    NOT?: SandboxLogWhereInput | SandboxLogWhereInput[]
    sandboxId?: StringFilter<"SandboxLog"> | string
    agentId?: StringFilter<"SandboxLog"> | string
    userId?: StringFilter<"SandboxLog"> | string
    image?: StringFilter<"SandboxLog"> | string
    command?: StringNullableListFilter<"SandboxLog">
    intent?: StringFilter<"SandboxLog"> | string
    stdout?: StringNullableFilter<"SandboxLog"> | string | null
    stderr?: StringNullableFilter<"SandboxLog"> | string | null
    exitCode?: IntNullableFilter<"SandboxLog"> | number | null
    status?: StringFilter<"SandboxLog"> | string
    durationMs?: IntFilter<"SandboxLog"> | number
    executedAt?: DateTimeFilter<"SandboxLog"> | Date | string
  }, "id">

  export type SandboxLogOrderByWithAggregationInput = {
    id?: SortOrder
    sandboxId?: SortOrder
    agentId?: SortOrder
    userId?: SortOrder
    image?: SortOrder
    command?: SortOrder
    intent?: SortOrder
    stdout?: SortOrderInput | SortOrder
    stderr?: SortOrderInput | SortOrder
    exitCode?: SortOrderInput | SortOrder
    status?: SortOrder
    durationMs?: SortOrder
    executedAt?: SortOrder
    _count?: SandboxLogCountOrderByAggregateInput
    _avg?: SandboxLogAvgOrderByAggregateInput
    _max?: SandboxLogMaxOrderByAggregateInput
    _min?: SandboxLogMinOrderByAggregateInput
    _sum?: SandboxLogSumOrderByAggregateInput
  }

  export type SandboxLogScalarWhereWithAggregatesInput = {
    AND?: SandboxLogScalarWhereWithAggregatesInput | SandboxLogScalarWhereWithAggregatesInput[]
    OR?: SandboxLogScalarWhereWithAggregatesInput[]
    NOT?: SandboxLogScalarWhereWithAggregatesInput | SandboxLogScalarWhereWithAggregatesInput[]
    id?: UuidWithAggregatesFilter<"SandboxLog"> | string
    sandboxId?: StringWithAggregatesFilter<"SandboxLog"> | string
    agentId?: StringWithAggregatesFilter<"SandboxLog"> | string
    userId?: StringWithAggregatesFilter<"SandboxLog"> | string
    image?: StringWithAggregatesFilter<"SandboxLog"> | string
    command?: StringNullableListFilter<"SandboxLog">
    intent?: StringWithAggregatesFilter<"SandboxLog"> | string
    stdout?: StringNullableWithAggregatesFilter<"SandboxLog"> | string | null
    stderr?: StringNullableWithAggregatesFilter<"SandboxLog"> | string | null
    exitCode?: IntNullableWithAggregatesFilter<"SandboxLog"> | number | null
    status?: StringWithAggregatesFilter<"SandboxLog"> | string
    durationMs?: IntWithAggregatesFilter<"SandboxLog"> | number
    executedAt?: DateTimeWithAggregatesFilter<"SandboxLog"> | Date | string
  }

  export type SandboxLogCreateInput = {
    id?: string
    sandboxId: string
    agentId: string
    userId: string
    image: string
    command?: SandboxLogCreatecommandInput | string[]
    intent: string
    stdout?: string | null
    stderr?: string | null
    exitCode?: number | null
    status: string
    durationMs: number
    executedAt?: Date | string
  }

  export type SandboxLogUncheckedCreateInput = {
    id?: string
    sandboxId: string
    agentId: string
    userId: string
    image: string
    command?: SandboxLogCreatecommandInput | string[]
    intent: string
    stdout?: string | null
    stderr?: string | null
    exitCode?: number | null
    status: string
    durationMs: number
    executedAt?: Date | string
  }

  export type SandboxLogUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    sandboxId?: StringFieldUpdateOperationsInput | string
    agentId?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    image?: StringFieldUpdateOperationsInput | string
    command?: SandboxLogUpdatecommandInput | string[]
    intent?: StringFieldUpdateOperationsInput | string
    stdout?: NullableStringFieldUpdateOperationsInput | string | null
    stderr?: NullableStringFieldUpdateOperationsInput | string | null
    exitCode?: NullableIntFieldUpdateOperationsInput | number | null
    status?: StringFieldUpdateOperationsInput | string
    durationMs?: IntFieldUpdateOperationsInput | number
    executedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SandboxLogUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    sandboxId?: StringFieldUpdateOperationsInput | string
    agentId?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    image?: StringFieldUpdateOperationsInput | string
    command?: SandboxLogUpdatecommandInput | string[]
    intent?: StringFieldUpdateOperationsInput | string
    stdout?: NullableStringFieldUpdateOperationsInput | string | null
    stderr?: NullableStringFieldUpdateOperationsInput | string | null
    exitCode?: NullableIntFieldUpdateOperationsInput | number | null
    status?: StringFieldUpdateOperationsInput | string
    durationMs?: IntFieldUpdateOperationsInput | number
    executedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SandboxLogCreateManyInput = {
    id?: string
    sandboxId: string
    agentId: string
    userId: string
    image: string
    command?: SandboxLogCreatecommandInput | string[]
    intent: string
    stdout?: string | null
    stderr?: string | null
    exitCode?: number | null
    status: string
    durationMs: number
    executedAt?: Date | string
  }

  export type SandboxLogUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    sandboxId?: StringFieldUpdateOperationsInput | string
    agentId?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    image?: StringFieldUpdateOperationsInput | string
    command?: SandboxLogUpdatecommandInput | string[]
    intent?: StringFieldUpdateOperationsInput | string
    stdout?: NullableStringFieldUpdateOperationsInput | string | null
    stderr?: NullableStringFieldUpdateOperationsInput | string | null
    exitCode?: NullableIntFieldUpdateOperationsInput | number | null
    status?: StringFieldUpdateOperationsInput | string
    durationMs?: IntFieldUpdateOperationsInput | number
    executedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SandboxLogUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    sandboxId?: StringFieldUpdateOperationsInput | string
    agentId?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    image?: StringFieldUpdateOperationsInput | string
    command?: SandboxLogUpdatecommandInput | string[]
    intent?: StringFieldUpdateOperationsInput | string
    stdout?: NullableStringFieldUpdateOperationsInput | string | null
    stderr?: NullableStringFieldUpdateOperationsInput | string | null
    exitCode?: NullableIntFieldUpdateOperationsInput | number | null
    status?: StringFieldUpdateOperationsInput | string
    durationMs?: IntFieldUpdateOperationsInput | number
    executedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UuidFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedUuidFilter<$PrismaModel> | string
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

  export type StringNullableListFilter<$PrismaModel = never> = {
    equals?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    has?: string | StringFieldRefInput<$PrismaModel> | null
    hasEvery?: string[] | ListStringFieldRefInput<$PrismaModel>
    hasSome?: string[] | ListStringFieldRefInput<$PrismaModel>
    isEmpty?: boolean
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

  export type IntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
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

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type SandboxLogCountOrderByAggregateInput = {
    id?: SortOrder
    sandboxId?: SortOrder
    agentId?: SortOrder
    userId?: SortOrder
    image?: SortOrder
    command?: SortOrder
    intent?: SortOrder
    stdout?: SortOrder
    stderr?: SortOrder
    exitCode?: SortOrder
    status?: SortOrder
    durationMs?: SortOrder
    executedAt?: SortOrder
  }

  export type SandboxLogAvgOrderByAggregateInput = {
    exitCode?: SortOrder
    durationMs?: SortOrder
  }

  export type SandboxLogMaxOrderByAggregateInput = {
    id?: SortOrder
    sandboxId?: SortOrder
    agentId?: SortOrder
    userId?: SortOrder
    image?: SortOrder
    intent?: SortOrder
    stdout?: SortOrder
    stderr?: SortOrder
    exitCode?: SortOrder
    status?: SortOrder
    durationMs?: SortOrder
    executedAt?: SortOrder
  }

  export type SandboxLogMinOrderByAggregateInput = {
    id?: SortOrder
    sandboxId?: SortOrder
    agentId?: SortOrder
    userId?: SortOrder
    image?: SortOrder
    intent?: SortOrder
    stdout?: SortOrder
    stderr?: SortOrder
    exitCode?: SortOrder
    status?: SortOrder
    durationMs?: SortOrder
    executedAt?: SortOrder
  }

  export type SandboxLogSumOrderByAggregateInput = {
    exitCode?: SortOrder
    durationMs?: SortOrder
  }

  export type UuidWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedUuidWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
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

  export type IntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
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

  export type SandboxLogCreatecommandInput = {
    set: string[]
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type SandboxLogUpdatecommandInput = {
    set?: string[]
    push?: string | string[]
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type NullableIntFieldUpdateOperationsInput = {
    set?: number | null
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
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

  export type NestedUuidFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedUuidFilter<$PrismaModel> | string
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

  export type NestedUuidWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedUuidWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
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

  export type NestedIntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }

  export type NestedFloatNullableFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableFilter<$PrismaModel> | number | null
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