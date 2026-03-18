import { createContext, useContext, useState, type ReactNode } from "react";

/**
 * Zero-routing inbox navigation.
 *
 * InboxPanel writes a target here — NO window.location, NO setLocation, NO router.
 * App.tsx reads it and renders the target page directly from React state.
 * InvestigationRoom reads it to set active channel / target message.
 * A 404 is physically impossible.
 */

export type InboxNavTarget = {
  page: "investigation-room";
  channel?: string;
  message?: string;
} | null;

interface InboxNavContextValue {
  navTarget:         InboxNavTarget;
  navigateViaInbox:  (target: InboxNavTarget) => void;
  clearInboxNav:     () => void;
}

const InboxNavContext = createContext<InboxNavContextValue>({
  navTarget:        null,
  navigateViaInbox: () => {},
  clearInboxNav:    () => {},
});

export function InboxNavProvider({ children }: { children: ReactNode }) {
  const [navTarget, setNavTarget] = useState<InboxNavTarget>(null);
  return (
    <InboxNavContext.Provider value={{
      navTarget,
      navigateViaInbox: setNavTarget,
      clearInboxNav:    () => setNavTarget(null),
    }}>
      {children}
    </InboxNavContext.Provider>
  );
}

export function useInboxNav(): InboxNavContextValue {
  return useContext(InboxNavContext);
}
