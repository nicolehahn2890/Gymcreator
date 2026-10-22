// Laedt die Plan-Daten aus data/. Die Kern-Funktionen bekommen sie immer als Parameter.
import goalsJson from '../../../data/goals.json';
import templatesJson from '../../../data/templates.json';
import type { GoalsData, PlanData, TemplatesData } from './types';

export const planData: PlanData = {
  goals: goalsJson as unknown as GoalsData,
  templates: templatesJson as unknown as TemplatesData,
};
