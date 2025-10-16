export interface TurbineEnvironment {
  id: string;
  namespace: string;
  environment: string;
  url: string;
  lastVisited: number;
  qaUat1Preference: 'qa' | 'uat1' | 'undetermined';
}

export interface StorageData {
  recentEnvironments: TurbineEnvironment[];
}

export type Environment = 'dev' | 'sit' | 'uat1' | 'qa' | 'prep' | 'prod';

export const ENVIRONMENTS: Environment[] = ['dev', 'sit', 'uat1', 'qa', 'prep', 'prod'];

export const STORAGE_KEY = 'turbine_recent_environments';
export const MAX_RECENT_ITEMS = 15;
