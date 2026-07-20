import * as React from "react";

import { makeUseContext } from "../utils.js";

export type DocumentContextType = {
  getOwnerDocument: (node?: Node | null) => Document;
  getOwnerWindow: (node?: Node | null) => Window;
};

export const DocumentContext = React.createContext<DocumentContextType | null>(null);

export const useDocumentContext = makeUseContext("useDocument", "DocumentContext", DocumentContext);

export type DocumentContextProviderProps = React.PropsWithChildren & {
  nodeRef: React.RefObject<Node | null>;
};

export function DocumentContextProvider({ nodeRef, children }: DocumentContextProviderProps) {
  const context = React.useMemo(() => {
    const getOwnerDocument = (node?: Node | null) => (node || nodeRef.current)?.ownerDocument || document;
    const getOwnerWindow = (node?: Node | null) => getOwnerDocument(node)?.defaultView || window;
    return { getOwnerDocument, getOwnerWindow };
  }, [nodeRef]);

  return <DocumentContext.Provider value={context}>{children}</DocumentContext.Provider>;
}
