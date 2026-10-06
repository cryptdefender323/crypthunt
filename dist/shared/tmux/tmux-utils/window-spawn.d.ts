import type { SpawnTmuxWindowDeps, TmuxConfig } from "@omop/tmux-core";
import type { SpawnPaneResult } from "../types";
export declare function spawnTmuxWindow(sessionId: string, description: string, config: TmuxConfig, serverUrl: string, _directory: string, depsInput?: Partial<SpawnTmuxWindowDeps>): Promise<SpawnPaneResult>;
