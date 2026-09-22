import { describe, expect, test } from "bun:test"
import { mkdtempSync, rmSync } from "fs"
import { tmpdir } from "os"
import { join } from "path"
import * as connectedProvidersCache from "./connected-providers-cache"
import { __resetModelCache } from "./model-availability"

describe("__resetModelCache", () => {
	test("#given process-written cache then files deleted #when __resetModelCache #then hasProviderModelsCache is false", () => {
		// given
		const tempDir = mkdtempSync(join(tmpdir(), "omop-reset-cache-"))
		const prev = process.env.XDG_CACHE_HOME
		process.env.XDG_CACHE_HOME = tempDir
		try {
			__resetModelCache()
			connectedProvidersCache.writeProviderModelsCache({
				models: { openai: ["gpt-4"] },
				connected: ["openai"],
			})
			expect(connectedProvidersCache.hasProviderModelsCache()).toBe(true)
			rmSync(tempDir, { recursive: true, force: true })
			expect(connectedProvidersCache.hasProviderModelsCache()).toBe(true)

			// when
			__resetModelCache()

			// then
			expect(connectedProvidersCache.hasProviderModelsCache()).toBe(false)
		} finally {
			if (prev === undefined) {
				delete process.env.XDG_CACHE_HOME
			} else {
				process.env.XDG_CACHE_HOME = prev
			}
			rmSync(tempDir, { recursive: true, force: true })
			__resetModelCache()
		}
	})
})