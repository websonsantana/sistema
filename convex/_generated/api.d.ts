/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as auth from "../auth.js";
import type * as clients from "../clients.js";
import type * as dashboard from "../dashboard.js";
import type * as employees from "../employees.js";
import type * as http from "../http.js";
import type * as quotes from "../quotes.js";
import type * as receipts from "../receipts.js";
import type * as router from "../router.js";
import type * as services from "../services.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  clients: typeof clients;
  dashboard: typeof dashboard;
  employees: typeof employees;
  http: typeof http;
  quotes: typeof quotes;
  receipts: typeof receipts;
  router: typeof router;
  services: typeof services;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
