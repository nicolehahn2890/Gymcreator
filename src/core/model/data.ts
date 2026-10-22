// Laedt die Daten aus data/. Die Kern-Funktionen bekommen sie immer als Parameter.
import exercisesJson from '../../../data/exercises.json';
import goalsJson from '../../../data/goals.json';
import templatesJson from '../../../data/templates.json';
import type { ExercisesData, GoalsData, PlanData, TemplatesData } from './types';

export const planData: PlanData = {
  goals: goalsJson as unknown as GoalsData,
  templates: templatesJson as unknown as TemplatesData,
};

export const exerciseData = exercisesJson as unknown as ExercisesData;
