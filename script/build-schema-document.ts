import { z } from "zod"
import { CryptHunterConfigSchema } from "../packages/omop-opencode/src/config/schema"

export function createCryptHunterJsonSchema(): Record<string, unknown> {
  const jsonSchema = z.toJSONSchema(CryptHunterConfigSchema, {
    target: "draft-7",
    unrepresentable: "any",
  }) as Record<string, unknown>

  return {
    $schema: "http://json-schema.org/draft-07/schema#",
    $id: "https://raw.githubusercontent.com/cryptdefender323/crypthunter/dev/assets/crypthunter.schema.json",
    title: "CryptHunter Configuration",
    description: "Configuration schema for crypthunter plugin",
    ...jsonSchema,
  }
}
