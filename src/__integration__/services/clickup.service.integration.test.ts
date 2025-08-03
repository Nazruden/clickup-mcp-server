import "../../__integration__/setup/integration.setup.js";
import { ClickUpService } from "../../services/clickup.service.js";
import { testCleanup } from "../setup/clickup.cleanup.js";

describe("ClickUpService - Tests d'Intégration", () => {
  let clickUpService: ClickUpService;

  beforeAll(() => {
    clickUpService = new ClickUpService();
  });

  afterAll(async () => {
    // Nettoyage des entités créées pendant les tests
    await testCleanup.cleanupAll();
  });

  describe("getTeams", () => {
    it("devrait récupérer les équipes/workspaces de l'utilisateur", async () => {
      // Act
      const teams = await clickUpService.getTeams();

      // Assert
      expect(teams).toBeDefined();
      expect(Array.isArray(teams)).toBe(true);
      
      if (teams.length > 0) {
        const firstTeam = teams[0];
        expect(firstTeam).toHaveProperty("id");
        expect(firstTeam).toHaveProperty("name");
        
        // Vérifier les types
        expect(typeof firstTeam.id).toBe("string");
        expect(typeof firstTeam.name).toBe("string");
      }

      console.log(`✅ Équipes trouvées: ${teams.length}`);
      if (teams.length > 0) {
        console.log(`   Premier team: ${teams[0].name} (ID: ${teams[0].id})`);
      }
    });

    it("devrait gérer le cas où l'utilisateur n'a pas d'équipes", async () => {
      // Ce test vérifie que la méthode ne plante pas même si pas d'équipes
      const teams = await clickUpService.getTeams();
      
      // Même sans équipes, la réponse devrait être un tableau
      expect(Array.isArray(teams)).toBe(true);
    });

    it("devrait échouer avec un token invalide", async () => {
      // Créer un service avec un token invalide
      const originalToken = process.env.CLICKUP_PERSONAL_TOKEN;
      process.env.CLICKUP_PERSONAL_TOKEN = "token_invalide";
      
      try {
        const invalidService = new ClickUpService();
        
        // Should throw an error
        await expect(invalidService.getTeams()).rejects.toThrow();
      } finally {
        // Restaurer le token original
        process.env.CLICKUP_PERSONAL_TOKEN = originalToken;
      }
    });
  });
});