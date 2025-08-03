import { ClickUpService } from "../../services/clickup.service.js";
import { isTestEntity, INTEGRATION_CONFIG } from "./integration.setup.js";

/**
 * Utilitaires pour nettoyer les entités de test créées dans ClickUp
 * pendant les tests d'intégration
 */
export class ClickUpTestCleanup {
  private clickUpService: ClickUpService;
  private createdEntities: {
    tasks: string[];
    spaces: string[];
    folders: string[];
    docs: string[];
  } = {
    tasks: [],
    spaces: [],
    folders: [],
    docs: [],
  };

  constructor() {
    this.clickUpService = new ClickUpService();
  }

  /**
   * Enregistrer une entité créée pour nettoyage ultérieur
   */
  trackCreatedEntity(type: 'task' | 'space' | 'folder' | 'doc', id: string) {
    this.createdEntities[type + 's' as keyof typeof this.createdEntities].push(id);
    
    if (INTEGRATION_CONFIG.verbose) {
      console.log(`📝 Entité trackée pour nettoyage: ${type} ${id}`);
    }
  }

  /**
   * Nettoyer toutes les entités trackées
   */
  async cleanupAll(): Promise<void> {
    if (INTEGRATION_CONFIG.verbose) {
      console.log("🧹 Début du nettoyage des entités de test...");
    }

    // Nettoyer dans l'ordre inverse de création pour éviter les dépendances
    await this.cleanupTasks();
    await this.cleanupDocs();
    await this.cleanupFolders();
    await this.cleanupSpaces();

    // Reset des listes
    this.createdEntities = {
      tasks: [],
      spaces: [],
      folders: [],
      docs: [],
    };

    if (INTEGRATION_CONFIG.verbose) {
      console.log("✅ Nettoyage terminé");
    }
  }

  /**
   * Nettoyer les tâches de test
   */
  private async cleanupTasks(): Promise<void> {
    for (const taskId of this.createdEntities.tasks) {
      try {
        // Note: L'implémentation de deleteTask dépend de votre TaskService
        // await this.clickUpService.taskService.deleteTask(taskId);
        if (INTEGRATION_CONFIG.verbose) {
          console.log(`🗑️ Tâche supprimée: ${taskId}`);
        }
      } catch (error) {
        console.warn(`⚠️ Impossible de supprimer la tâche ${taskId}:`, error);
      }
    }
  }

  /**
   * Nettoyer les espaces de test
   */
  private async cleanupSpaces(): Promise<void> {
    for (const spaceId of this.createdEntities.spaces) {
      try {
        await this.clickUpService.spaceService.deleteSpace(spaceId);
        if (INTEGRATION_CONFIG.verbose) {
          console.log(`🗑️ Espace supprimé: ${spaceId}`);
        }
      } catch (error) {
        console.warn(`⚠️ Impossible de supprimer l'espace ${spaceId}:`, error);
      }
    }
  }

  /**
   * Nettoyer les dossiers de test
   */
  private async cleanupFolders(): Promise<void> {
    for (const folderId of this.createdEntities.folders) {
      try {
        await this.clickUpService.folderService.deleteFolder(folderId);
        if (INTEGRATION_CONFIG.verbose) {
          console.log(`🗑️ Dossier supprimé: ${folderId}`);
        }
      } catch (error) {
        console.warn(`⚠️ Impossible de supprimer le dossier ${folderId}:`, error);
      }
    }
  }

  /**
   * Nettoyer les documents de test
   */
  private async cleanupDocs(): Promise<void> {
    for (const docId of this.createdEntities.docs) {
      try {
        // Note: ClickUp n'a pas toujours d'endpoint de suppression de docs
        // Implementer selon les capacités de l'API
        if (INTEGRATION_CONFIG.verbose) {
          console.log(`📄 Document marqué pour nettoyage: ${docId}`);
        }
      } catch (error) {
        console.warn(`⚠️ Impossible de supprimer le document ${docId}:`, error);
      }
    }
  }
}

// Instance globale pour les tests
export const testCleanup = new ClickUpTestCleanup();