import type { GoalId } from '../../core/model/types';
import apfel from './rex/rex-apfel.webp';
import apfelIcon from './rex/rex-apfel-icon.webp';
import happy from './rex/rex-happy.webp';
import kleinerSieg from './rex/rex-kleiner-sieg.webp';
import letsGo from './rex/rex-lets-go.webp';
import love from './rex/rex-love.webp';
import puh from './rex/rex-puh.webp';
import sanduhr from './rex/rex-sanduhr.webp';
import sanduhrIcon from './rex/rex-sanduhr-icon.webp';
import vform from './rex/rex-vform.webp';
import vformIcon from './rex/rex-vform-icon.webp';
import wink from './rex/rex-wink.webp';
import wow from './rex/rex-wow.webp';

/** Rex je Ziel: volles Motiv mit Hintergrund fuer die Zielwahl, freigestellt als Icon fuer die Einstellungen. */
export const REX: Record<GoalId, { full: string; icon: string }> = {
  vform: { full: vform, icon: vformIcon },
  sanduhr: { full: sanduhr, icon: sanduhrIcon },
  apfel: { full: apfel, icon: apfelIcon },
};

/** Rexe fuer RexMoment, aus dem Marketing-Kit verkleinert: Pose (ganzer Rex) und Reaktionen (Kopf). */
export const REX_MOMENT = {
  kleinerSieg,
  letsGo,
  wow,
};

/** Reaktionen fuer "Training geschafft", der Reihe nach. */
const DAY_DONE = [puh, happy, love, wink];

/** Rex fuer einen geschafften Trainingstag: wechselt von Tag zu Tag und von Woche zu Woche, derselbe Tag behaelt seinen Rex. */
export function dayDoneRex(cycle: number, week: number, day: number): string {
  return DAY_DONE[(cycle - 1 + week - 1 + day) % DAY_DONE.length] ?? puh;
}
