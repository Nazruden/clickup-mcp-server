# 🚀 CI/CD Pipeline Documentation

Ce document décrit le pipeline CI/CD mis en place pour le projet ClickUp MCP Server.

## 📋 Vue d'ensemble

Notre pipeline CI/CD utilise **GitHub Actions** pour automatiser :
- ✅ Tests et validation qualité
- 🔒 Analyse de sécurité
- 📦 Build et packaging
- 🚀 Publication automatique sur NPM
- 📋 Gestion des releases

## 🔄 Workflows

### 1. 🧪 CI - Tests & Quality (`ci.yml`)

**Déclenché par :** Push et PR sur `main` et `develop`

**Actions :**
- Tests sur Node.js 18, 20, 22
- Audit de sécurité des dépendances
- Lint et vérifications TypeScript
- Build du projet
- Couverture de tests
- Upload vers Codecov

### 2. 🚀 CD - Publish to NPM (`publish.yml`)

**Déclenché par :** 
- Release GitHub (automatique)
- Manuel via `workflow_dispatch`

**Actions :**
- Validation des tests
- Vérification de cohérence des versions
- Build de production
- Publication sur NPM avec scope `@nazruden`
- Mise à jour des notes de release

### 3. 🏷️ Release Management (`release.yml`)

**Déclenché par :** Push sur `main`

**Actions :**
- Création automatique de tags
- Génération de changelog
- Création de GitHub Release
- Déclenchement de la publication NPM

### 4. 🔍 PR - Review & Validation (`pr.yml`)

**Déclenché par :** Ouverture/Mise à jour de PR

**Actions :**
- Analyse de la taille de la PR
- Validation des messages de commit (Conventional Commits)
- Détection des breaking changes
- Tests et coverage
- Audit de sécurité

### 5. 🔍 CodeQL Security Analysis (`codeql.yml`)

**Déclenché par :** 
- Push sur branches principales
- Schedule hebdomadaire
- PRs

**Actions :**
- Analyse statique de sécurité
- Détection de vulnérabilités
- Rapport de sécurité GitHub

## 🔧 Configuration

### Secrets GitHub nécessaires

```bash
# Pour publication NPM
NPM_TOKEN=npm_xxx...

# Pour analyse Snyk (optionnel)
SNYK_TOKEN=xxx...

# Token GitHub (automatique)
GITHUB_TOKEN=xxx...
```

### Variables d'environnement

Le projet utilise les variables suivantes :
- `NODE_ENV`: development/production
- `CLICKUP_PERSONAL_TOKEN`: Token d'API ClickUp
- `PORT`: Port du serveur (défaut: 3000)

## 📦 Publication NPM

### Processus automatique

1. **Bump de version** avec les scripts :
   ```bash
   npm run release:patch   # 1.1.0 → 1.1.1
   npm run release:minor   # 1.1.0 → 1.2.0
   npm run release:major   # 1.1.0 → 2.0.0
   ```

2. **Le script automatise :**
   - Tests et build
   - Mise à jour du CHANGELOG
   - Commit et tag Git
   - Push vers GitHub
   - Déclenchement automatique de la publication NPM

### Publication manuelle

En cas de besoin, publication manuelle possible :

```bash
# Build et tests
npm run ci:validate

# Publication
npm publish --access public
```

## 🔍 Conventional Commits

Le projet utilise les **Conventional Commits** pour :
- Génération automatique du CHANGELOG
- Détermination automatique du type de version
- Amélioration de la lisibilité de l'historique

**Format :**
```
type(scope): description

feat(api): add new endpoint for tasks
fix(auth): resolve token validation issue
docs(readme): update installation instructions
```

**Types supportés :**
- `feat`: Nouvelle fonctionnalité
- `fix`: Correction de bug
- `docs`: Documentation
- `style`: Formatage/style
- `refactor`: Refactoring
- `test`: Tests
- `chore`: Maintenance

## 🛡️ Sécurité

### Analyses automatiques

- **npm audit** : Vulnérabilités des dépendances
- **CodeQL** : Analyse statique de sécurité
- **Snyk** : Scan de sécurité avancé (optionnel)
- **Dependabot** : Mises à jour automatiques des dépendances

### Bonnes pratiques

- Secrets stockés dans GitHub Secrets
- Tokens avec permissions minimales
- Validation des inputs utilisateur
- Audit régulier des dépendances

## 📊 Monitoring

### Métriques suivies

- **Test Coverage** : Couverture des tests via Codecov
- **Build Status** : Statut des builds via badges GitHub
- **Security Alerts** : Alertes de sécurité GitHub
- **Package Size** : Taille du package NPM

### Badges disponibles

```markdown
![Tests](https://github.com/nazruden/clickup-mcp-server/workflows/CI/badge.svg)
![Coverage](https://codecov.io/gh/nazruden/clickup-mcp-server/branch/main/graph/badge.svg)
![npm version](https://badge.fury.io/js/@nazruden%2Fclickup-server.svg)
```

## 🚀 Déploiement

### Environnements

- **Development** : Branche `develop`
- **Staging** : PRs vers `main`
- **Production** : Branche `main` + Release

### Processus de release

1. Développement sur branche feature
2. PR vers `develop` pour validation
3. PR de `develop` vers `main`
4. Release automatique depuis `main`
5. Publication NPM automatique

## 📞 Support

En cas de problème avec le CI/CD :

1. Vérifier les logs GitHub Actions
2. S'assurer que les secrets sont configurés
3. Valider le format des commits
4. Contacter @nazruden pour support

---

**Pipeline Version :** 1.0
**Last Updated :** 2024-08-02