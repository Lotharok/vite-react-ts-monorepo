import { service1 } from "./service1.ts";
import { service2 } from "./service2.ts";

export const handlers = [...service1, ...service2];
