declare module "$fresh/server.ts" {
  export interface HandlerContext<T extends Record<string, string> = Record<string, string>> {
    params: T;
  }

  export type FreshContext = HandlerContext;

  export interface Handler<T extends Record<string, string> = Record<string, string>> {
    (req: Request, ctx: HandlerContext<T>): Response | Promise<Response>;
  }

  export interface Handlers<T extends Record<string, string> = Record<string, string>> {
    GET?: Handler<T>;
    POST?: Handler<T>;
    PUT?: Handler<T>;
    DELETE?: Handler<T>;
    PATCH?: Handler<T>;
    HEAD?: Handler<T>;
    OPTIONS?: Handler<T>;
  }
}
