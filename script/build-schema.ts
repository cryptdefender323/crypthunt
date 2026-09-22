#!/usr/bin/env bun
import { createCryptHunterJsonSchema } from "./build-schema-document"

const SCHEMA_OUTPUT_PATH = "assets/crypthunter.schema.json"
const DIST_SCHEMA_OUTPUT_PATH = "dist/crypthunter.schema.json"

async function main() {
  console.log("Generating JSON Schema...")

  const finalSchema = createCryptHunterJsonSchema()
  await Bun.write(SCHEMA_OUTPUT_PATH, JSON.stringify(finalSchema, null, 2))
  await Bun.write(DIST_SCHEMA_OUTPUT_PATH, JSON.stringify(finalSchema, null, 2))

  console.log(`✓ JSON Schema generated: ${SCHEMA_OUTPUT_PATH}`)
}

main()
