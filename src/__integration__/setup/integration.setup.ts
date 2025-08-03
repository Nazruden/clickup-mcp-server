import dotenv from "dotenv";
import path from "path";

// Charger les variables d'environnement pour les tests d'intégration
dotenv.config({
  path: path.resolve(__dirname, "../../../.env.integration"),
});

// Configuration globale pour les tests d'intégration
export const INTEGRATION_CONFIG = {
  // Token ClickUp pour les tests
  clickupToken: process.env.CLICKUP_PERSONAL_TOKEN_INTEGRATION || 
                process.env.CLICKUP_PERSONAL_TOKEN ||
                "pk_158599501_WA3U7UY7WLZETXIG4YESSK1MC06B8IOP",
  
  // Préfixe pour identifier les entités de test
  testPrefix: "TEST_MCP_",
  
  // Timeout pour les appels API (plus long que les tests unitaires)
  apiTimeout: 10000,
  
  // Workspace de test (optionnel, déterminé par le token)
  testWorkspaceId: process.env.CLICKUP_TEST_WORKSPACE_ID,
  
  // Mode verbeux pour debugging
  verbose: process.env.INTEGRATION_VERBOSE === "true",
};

// Setup global pour tous les tests d'intégration
beforeAll(() => {
  // Vérifier que le token est disponible
  if (!INTEGRATION_CONFIG.clickupToken || INTEGRATION_CONFIG.clickupToken.includes("your_")) {
    throw new Error(
      "Token ClickUp manquant ! Définissez CLICKUP_PERSONAL_TOKEN ou CLICKUP_PERSONAL_TOKEN_INTEGRATION"
    );
  }
  
  // Configuration Jest pour les tests d'intégration
  jest.setTimeout(INTEGRATION_CONFIG.apiTimeout);
  
  if (INTEGRATION_CONFIG.verbose) {
    console.log("🚀 Configuration tests d'intégration :");
    console.log(`  - Token: ${INTEGRATION_CONFIG.clickupToken.substring(0, 20)}...`);
    console.log(`  - Préfixe test: ${INTEGRATION_CONFIG.testPrefix}`);
    console.log(`  - Timeout: ${INTEGRATION_CONFIG.apiTimeout}ms`);
  }
});

// Helper pour marquer les entités créées pendant les tests
export function createTestEntity(name: string): string {
  return `${INTEGRATION_CONFIG.testPrefix}${name}_${Date.now()}`;
}

// Helper pour vérifier si une entité est un artefact de test
export function isTestEntity(name: string): boolean {
  return name.startsWith(INTEGRATION_CONFIG.testPrefix);
}

export default INTEGRATION_CONFIG;