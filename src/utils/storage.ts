import { TurbineEnvironment, STORAGE_KEY, MAX_RECENT_ITEMS } from '../types';

export const storage = {
  async getRecentEnvironments(): Promise<TurbineEnvironment[]> {
    const result = await chrome.storage.local.get(STORAGE_KEY);
    return result[STORAGE_KEY] || [];
  },

  async addEnvironment(env: TurbineEnvironment): Promise<void> {
    const environments = await this.getRecentEnvironments();

    // Find existing entry for this namespace
    const existing = environments.find(e => e.namespace === env.namespace);

    // Merge qa/uat1 preference: keep existing determined preference if new one is undetermined
    if (existing?.qaUat1Preference && existing.qaUat1Preference !== 'undetermined' && env.qaUat1Preference === 'undetermined') {
      env.qaUat1Preference = existing.qaUat1Preference;
    }

    // Remove duplicate if exists (same namespace = same service)
    const filtered = environments.filter(e => e.namespace !== env.namespace);

    // Add new environment at the beginning
    const updated = [env, ...filtered].slice(0, MAX_RECENT_ITEMS);

    await chrome.storage.local.set({ [STORAGE_KEY]: updated });
  },

  async removeEnvironment(id: string): Promise<void> {
    const environments = await this.getRecentEnvironments();
    const updated = environments.filter(e => e.id !== id);
    await chrome.storage.local.set({ [STORAGE_KEY]: updated });
  },

  async clearAll(): Promise<void> {
    await chrome.storage.local.remove(STORAGE_KEY);
  },
};
