// Stand-in for the kit's ../../types/mod.ts so the module can be bundled outside the kit for e2e.
export enum ModuleType { HOT_WALLET = 'HOT_WALLET' }
export type ModuleInterface = Record<string, unknown>
