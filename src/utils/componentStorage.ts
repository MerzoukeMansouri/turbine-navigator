import { ComponentDeployment, ComponentVersionInfo, COMPONENT_DEPLOYMENTS_KEY, Environment } from '../types';

export const componentStorage = {
  async saveComponentDeployments(deployments: ComponentDeployment[]): Promise<void> {
    const existing = await this.getComponentDeployments();

    // Create a map for quick lookup: namespace+environment -> ComponentDeployment[]
    const existingMap = new Map<string, ComponentDeployment[]>();

    for (const deployment of existing) {
      const key = `${deployment.namespace}-${deployment.environment}`;
      if (!existingMap.has(key)) {
        existingMap.set(key, []);
      }
      existingMap.get(key)!.push(deployment);
    }

    // Replace old data for the same namespace+environment combination
    for (const deployment of deployments) {
      const key = `${deployment.namespace}-${deployment.environment}`;
      existingMap.set(key, deployments.filter(
        d => d.namespace === deployment.namespace && d.environment === deployment.environment
      ));
    }

    // Flatten back to array
    const updated: ComponentDeployment[] = [];
    for (const deploymentList of existingMap.values()) {
      updated.push(...deploymentList);
    }

    await chrome.storage.local.set({ [COMPONENT_DEPLOYMENTS_KEY]: updated });
  },

  async getComponentDeployments(): Promise<ComponentDeployment[]> {
    const result = await chrome.storage.local.get(COMPONENT_DEPLOYMENTS_KEY);
    return result[COMPONENT_DEPLOYMENTS_KEY] || [];
  },

  async getNamespaceComponents(): Promise<Map<string, {
    components: Map<string, Map<Environment, ComponentVersionInfo>>;
    environments: Set<Environment>;
  }>> {
    const deployments = await this.getComponentDeployments();
    const namespaceData = new Map<string, {
      components: Map<string, Map<Environment, ComponentVersionInfo>>;
      environments: Set<Environment>;
    }>();

    for (const deployment of deployments) {
      if (!namespaceData.has(deployment.namespace)) {
        namespaceData.set(deployment.namespace, {
          components: new Map(),
          environments: new Set(),
        });
      }

      const nsData = namespaceData.get(deployment.namespace)!;
      nsData.environments.add(deployment.environment);

      if (!nsData.components.has(deployment.componentName)) {
        nsData.components.set(deployment.componentName, new Map());
      }

      const componentVersions = nsData.components.get(deployment.componentName)!;
      componentVersions.set(deployment.environment, {
        version: deployment.version,
        lastUpdated: deployment.lastUpdated,
      });
    }

    return namespaceData;
  },

  async clearComponentData(): Promise<void> {
    await chrome.storage.local.remove(COMPONENT_DEPLOYMENTS_KEY);
  },
};
