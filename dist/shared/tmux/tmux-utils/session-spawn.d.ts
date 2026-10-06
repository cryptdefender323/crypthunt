import { getIsolatedSessionName } from "@omop/tmux-core";
import type { SpawnTmuxSessionDeps, TmuxConfig } from "@omop/tmux-core";
import type { SpawnPaneResult } from "../types";
export declare function spawnTmuxSession(sessionId: string, description: string, config: TmuxConfig, serverUrl: string, _directory: string, sourcePaneId?: string, depsInput?: Partial<SpawnTmuxSessionDeps>, managerId?: string): Promise<SpawnPaneResult>;
export { getIsolatedSessionName };
