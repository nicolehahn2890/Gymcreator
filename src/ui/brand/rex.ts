import type { GoalId } from '../../core/model/types';
import apfel from './rex/rex-apfel.webp';
import apfelIcon from './rex/rex-apfel-icon.webp';
import sanduhr from './rex/rex-sanduhr.webp';
import sanduhrIcon from './rex/rex-sanduhr-icon.webp';
import vform from './rex/rex-vform.webp';
import vformIcon from './rex/rex-vform-icon.webp';

/** Rex je Ziel: volles Motiv mit Hintergrund fuer die Zielwahl, freigestellt als Icon fuer die Einstellungen. */
export const REX: Record<GoalId, { full: string; icon: string }> = {
  vform: { full: vform, icon: vformIcon },
  sanduhr: { full: sanduhr, icon: sanduhrIcon },
  apfel: { full: apfel, icon: apfelIcon },
};
