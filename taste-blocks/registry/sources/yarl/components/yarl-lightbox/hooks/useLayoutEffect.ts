import * as React from "react";

import { hasWindow } from "../utils.js";

export const useLayoutEffect = hasWindow() ? React.useLayoutEffect : React.useEffect;
