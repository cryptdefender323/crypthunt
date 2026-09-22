import { configureMigrationCategoryDefaults } from "@omop/utils/migration/agent-category"

import { DEFAULT_CATEGORIES } from "../tools/delegate-task/constants"

configureMigrationCategoryDefaults(DEFAULT_CATEGORIES)

export * from "@omop/utils/migration"
