export { getBuiltinTemplate, GENERIC_GB, PKU, THESIS_TEMPLATES, THU, ZJU } from "./builtins";
export {
  createRecordFromTemplate,
  deleteCustomRecord,
  listAllTemplates,
  loadCustomRecords,
  materializeCustom,
  resolveTemplate,
  upsertCustomRecord,
  type CustomTemplateRecord,
} from "./custom";

import { resolveTemplate } from "./custom";

/** Resolve built-in or custom template by id. */
export function getTemplate(id: string) {
  return resolveTemplate(id);
}
