import * as React from "react";

import { ComponentProps } from "../types.js";
import { createModule } from "../config.js";
import { MODULE_ROOT } from "../consts.js";

export function Root({ children }: ComponentProps) {
  return <>{children}</>;
}

export const RootModule = createModule(MODULE_ROOT, Root);
