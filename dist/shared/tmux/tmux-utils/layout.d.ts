import { applyLayout } from "@omop/tmux-core";
import type { MainPaneWidthOptions } from "@omop/tmux-core";
export declare function enforceMainPaneWidth(mainPaneId: string, windowWidth: number, mainPaneSizeOrOptions?: number | MainPaneWidthOptions): Promise<void>;
export { applyLayout };
export type { MainPaneWidthOptions };
