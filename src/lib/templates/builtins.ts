import type { ThesisTemplate } from "../../types/thesis";
import { GENERIC_GB } from "./generic-gb";
import { PKU } from "./pku";
import { THU } from "./thu";
import { ZJU } from "./zju";

export const THESIS_TEMPLATES: ThesisTemplate[] = [GENERIC_GB, ZJU, THU, PKU];

export function getBuiltinTemplate(id: string): ThesisTemplate {
  return THESIS_TEMPLATES.find((item) => item.id === id) ?? GENERIC_GB;
}

export { GENERIC_GB, PKU, THU, ZJU };
