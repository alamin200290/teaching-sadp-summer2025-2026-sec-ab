import { Clock } from "./types";
export class SystemClock implements Clock { now(): Date { return new Date(); } }
