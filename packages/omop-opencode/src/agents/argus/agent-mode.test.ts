import { expect, test } from "bun:test"
import { createArgusAgent } from "./agent"

test("Argus remains selectable and is callable for delegated task execution", () => {
  const agent = createArgusAgent({})

  expect(agent.mode).toBe("all")
})
