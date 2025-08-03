import "../../__integration__/setup/integration.setup.js";
import { ClickUpService } from "../../services/clickup.service.js";
import { handleGetSpaces, handleCreateSpace } from "../../tools/space.tools.js";
import { testCleanup } from "../setup/clickup.cleanup.js";
import { createTestEntity } from "../setup/integration.setup.js";

describe("Workspace Tools - Tests d'Intégration", () => {
  let clickUpService: ClickUpService;
  let testWorkspaceId: string;

  beforeAll(async () => {
    clickUpService = new ClickUpService();
    
    // Récupérer les équipes pour obtenir un workspace
    const teams = await clickUpService.getTeams();
    expect(teams.length).toBeGreaterThan(0);
    testWorkspaceId = teams[0].id;
  });

  afterAll(async () => {
    await testCleanup.cleanupAll();
  });

  describe("handleGetSpaces", () => {
    it("devrait récupérer les espaces d'un workspace", async () => {
      // Arrange
      const params = {
        team_id: testWorkspaceId,
      };

      // Act
      const result = await handleGetSpaces(clickUpService, params);

      // Assert
      expect(result).toBeDefined();
      expect(result.content).toBeDefined();
      
      const spaces = JSON.parse(result.content[0].text);
      expect(Array.isArray(spaces)).toBe(true);
      
      if (spaces.length > 0) {
        const firstSpace = spaces[0];
        expect(firstSpace).toHaveProperty("id");
        expect(firstSpace).toHaveProperty("name");
        expect(typeof firstSpace.id).toBe("string");
        expect(typeof firstSpace.name).toBe("string");
      }

      console.log(`✅ Espaces trouvés: ${spaces.length}`);
      if (spaces.length > 0) {
        console.log(`   Premier espace: ${spaces[0].name} (ID: ${spaces[0].id})`);
      }
    });

    it("devrait échouer avec un team_id invalide", async () => {
      // Arrange
      const params = {
        team_id: "workspace_inexistant",
      };

      // Act & Assert
      await expect(handleGetSpaces(clickUpService, params)).rejects.toThrow();
    });
  });

  describe("handleCreateSpace", () => {
    it("devrait créer un nouvel espace avec succès", async () => {
      // Arrange
      const spaceName = createTestEntity("Space");
      const params = {
        team_id: testWorkspaceId,
        name: spaceName,
      };

      // Act
      const result = await handleCreateSpace(clickUpService, params);

      // Assert
      expect(result).toBeDefined();
      expect(result.content).toBeDefined();
      
      const createdSpace = JSON.parse(result.content[0].text);
      expect(createdSpace).toHaveProperty("id");
      expect(createdSpace.name).toBe(spaceName);

      // Tracker pour nettoyage
      testCleanup.trackCreatedEntity("space", createdSpace.id);

      console.log(`✅ Espace créé: ${createdSpace.name} (ID: ${createdSpace.id})`);
    });

    it("devrait créer un espace avec des options avancées", async () => {
      // Arrange
      const spaceName = createTestEntity("AdvancedSpace");
      const params = {
        team_id: testWorkspaceId,
        name: spaceName,
        multiple_assignees: true,
        features: {
          due_dates: {
            enabled: true,
            start_date: false,
            remap_due_dates: false,
            remap_closed_due_date: false,
          },
          time_tracking: {
            enabled: true,
          },
        },
      };

      // Act
      const result = await handleCreateSpace(clickUpService, params);

      // Assert
      expect(result).toBeDefined();
      const createdSpace = JSON.parse(result.content[0].text);
      expect(createdSpace.name).toBe(spaceName);
      expect(createdSpace.multiple_assignees).toBe(true);

      // Tracker pour nettoyage
      testCleanup.trackCreatedEntity("space", createdSpace.id);

      console.log(`✅ Espace avancé créé: ${createdSpace.name} avec fonctionnalités`);
    });

    it("devrait échouer avec un team_id invalide", async () => {
      // Arrange
      const params = {
        team_id: "workspace_inexistant",
        name: createTestEntity("FailSpace"),
      };

      // Act & Assert
      await expect(handleCreateSpace(clickUpService, params)).rejects.toThrow();
    });

    it("devrait échouer avec un nom manquant", async () => {
      // Arrange
      const params = {
        team_id: testWorkspaceId,
        // name manquant
      };

      // Act & Assert
      await expect(handleCreateSpace(clickUpService, params as any)).rejects.toThrow();
    });
  });
});