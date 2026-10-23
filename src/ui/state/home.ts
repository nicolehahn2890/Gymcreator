import { createContext } from 'react';

/** Zurueck auf die Startseite (Reiter "Plan"); der Wert kommt aus App.tsx. */
export const HomeContext = createContext<() => void>(() => undefined);
