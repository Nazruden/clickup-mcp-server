import "../../__integration__/setup/integration.setup.js";
import { ClickUpService } from "../../services/clickup.service.js";
import { handleCreateTask, handleUpdateTask } from "../../tools/task.tools.js";
import { testCleanup } from "../setup/clickup.cleanup.js";
import { createTestEntity } from "../setup/integration.setup.js";

describe("Task Tools - Tests d'Intégration", () => {
  let clickUpService: ClickUpService;
  let testWorkspaceId: string;
  let testSpaceId: string;
  let testListId: string;

  beforeAll(async () => {
    clickUpService = new ClickUpService();
    
    // Récupérer les équipes pour obtenir un workspace
    const teams = await clickUpService.getTeams();
    expect(teams.length).toBeGreaterThan(0);
    testWorkspaceId = teams[0].id;

    // Récupérer les espaces du workspace
    const spacesResponse = await clickUpService.spaceService.getSpaces({
      team_id: testWorkspaceId,
    });
    const spaces = spacesResponse.spaces;
    expect(spaces.length).toBeGreaterThan(0);
    testSpaceId = spaces[0].id;

    // Récupérer les dossiers de l'espace pour trouver une liste
    const foldersResponse = await clickUpService.folderService.getFolders({
      space_id: testSpaceId,
    });
    const folders = foldersResponse.folders;
    
    if (folders.length > 0) {
      const lists = await clickUpService.getLists(folders[0].id);
      expect(lists.length).toBeGreaterThan(0);
      testListId = lists[0].id;
    } else {
      // Si pas de dossiers, utiliser les listes directes de l'espace
      // (Cette logique dépend de votre structure ClickUp)
      throw new Error("Aucune liste trouvée pour les tests. Créez au moins une liste dans votre espace de test.");
    }
  });

  afterAll(async () => {
    await testCleanup.cleanupAll();
  });

  describe("handleCreateTask", () => {
    it("devrait créer une nouvelle tâche avec succès", async () => {
      // Arrange
      const taskName = createTestEntity("Task");
      const taskData = {
        list_id: testListId,
        name: taskName,
        description: "Tâche créée pendant les tests d'intégration",
      };

      // Act
      const result = await handleCreateTask(clickUpService, taskData);

      // Assert
      expect(result).toBeDefined();
      expect(result.content).toBeDefined();
      
      const createdTask = JSON.parse(result.content[0].text);
      expect(createdTask).toHaveProperty("id");
      expect(createdTask.name).toBe(taskName);
      expect(createdTask.list).toBeDefined();
      expect(createdTask.list.id).toBe(testListId);

      // Tracker pour nettoyage
      testCleanup.trackCreatedEntity("task", createdTask.id);

      console.log(`✅ Tâche créée: ${createdTask.name} (ID: ${createdTask.id})`);
    });

    it("devrait échouer avec un list_id invalide", async () => {
      // Arrange
      const taskData = {
        list_id: "liste_inexistante",
        name: createTestEntity("FailTask"),
      };

      // Act & Assert
      await expect(handleCreateTask(clickUpService, taskData)).rejects.toThrow();
    });

    it("devrait créer une tâche avec des champs optionnels", async () => {
      // Arrange
      const taskName = createTestEntity("ComplexTask");
      const taskData = {
        list_id: testListId,
        name: taskName,
        description: "Tâche avec champs avancés",
        priority: 2, // High priority
        due_date: Date.now() + (7 * 24 * 60 * 60 * 1000), // Dans 7 jours
        tags: ["test", "integration"],
      };

      // Act
      const result = await handleCreateTask(clickUpService, taskData);

      // Assert
      expect(result).toBeDefined();
      const createdTask = JSON.parse(result.content[0].text);
      expect(createdTask.name).toBe(taskName);
      expect(createdTask.priority).toBeDefined();
      
      // Tracker pour nettoyage
      testCleanup.trackCreatedEntity("task", createdTask.id);

      console.log(`✅ Tâche complexe créée: ${createdTask.name} avec priorité ${createdTask.priority?.priority}`);
    });
  });

  describe("handleUpdateTask", () => {
    let createdTaskId: string;

    beforeEach(async () => {
      // Créer une tâche pour les tests de mise à jour
      const taskName = createTestEntity("UpdateTask");
      const result = await handleCreateTask(clickUpService, {
        list_id: testListId,
        name: taskName,
      });
      
      const createdTask = JSON.parse(result.content[0].text);
      createdTaskId = createdTask.id;
      testCleanup.trackCreatedEntity("task", createdTaskId);
    });

    it("devrait mettre à jour le nom d'une tâche", async () => {
      // Arrange
      const newName = createTestEntity("UpdatedTask");
      const updateData = {
        task_id: createdTaskId,
        name: newName,
      };

      // Act
      const result = await handleUpdateTask(clickUpService, updateData);

      // Assert
      expect(result).toBeDefined();
      const updatedTask = JSON.parse(result.content[0].text);
      expect(updatedTask.name).toBe(newName);
      expect(updatedTask.id).toBe(createdTaskId);

      console.log(`✅ Tâche mise à jour: ${updatedTask.name}`);
    });

    it("devrait échouer avec un task_id invalide", async () => {
      // Arrange
      const updateData = {
        task_id: "tache_inexistante",
        name: "Nouveau nom",
      };

      // Act & Assert
      await expect(handleUpdateTask(clickUpService, updateData)).rejects.toThrow();
    });
  });
});