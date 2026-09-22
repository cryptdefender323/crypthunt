import { getPaneDimensions as getPaneDimensionsCore } from "@omop/tmux-core"
import type { PaneDimensions } from "@omop/tmux-core"

export async function getPaneDimensions(
	paneId: string,
): Promise<PaneDimensions | null> {
  const [{ getTmuxPath }, { runTmuxCommand }] = await Promise.all([
    import("../../../tools/interactive-bash/tmux-path-resolver"),
    import("../runner"),
  ])
	return getPaneDimensionsCore(paneId, { getTmuxPath, runTmuxCommand })
}

export type { PaneDimensions }
