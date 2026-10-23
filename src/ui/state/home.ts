import { createContext } from 'react';

/** Zurueck auf die Startseite "Heute"; der Wert kommt aus App.tsx. */
export const HomeContext = createContext<() => void>(() => undefined);
