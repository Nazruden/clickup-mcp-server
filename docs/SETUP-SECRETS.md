# 🔐 Configuration des Secrets GitHub

Ce guide explique comment configurer les secrets nécessaires pour le CI/CD.

## 🎯 Secrets requis

### 1. NPM_TOKEN (Obligatoire pour publication)

**Étapes :**

1. **Créer un token NPM :**
   ```bash
   npm login
   npm token create --type=automation
   ```

2. **Ajouter le secret GitHub :**
   - Aller sur `Settings` > `Secrets and variables` > `Actions`
   - Cliquer `New repository secret`
   - Nom : `NPM_TOKEN`
   - Valeur : `npm_xxxxxxxxxxxxxxxxxxxxxxxxxx`

### 2. SNYK_TOKEN (Optionnel - pour scan sécurité avancé)

**Étapes :**

1. **Créer un compte Snyk :**
   - Aller sur [snyk.io](https://snyk.io)
   - S'inscrire avec GitHub

2. **Récupérer le token :**
   - Dashboard Snyk > Account Settings > API Token

3. **Ajouter le secret GitHub :**
   - Nom : `SNYK_TOKEN`
   - Valeur : Token Snyk

## ✅ Vérification

### Tester la configuration NPM

```bash
# Vérifier que vous êtes connecté
npm whoami

# Tester les permissions
npm access ls-packages @nazruden
```

### Tester le pipeline

1. **Push vers main :**
   ```bash
   git add .
   git commit -m "feat: setup CI/CD pipeline"
   git push origin main
   ```

2. **Vérifier les workflows :**
   - Aller sur l'onglet `Actions`
   - Vérifier que les workflows se lancent
   - Vérifier les logs en cas d'erreur

## 📦 Configuration du package NPM

### 1. S'assurer que le package est public

Dans `package.json` :
```json
{
  "name": "@nazruden/clickup-server",
  "publishConfig": {
    "access": "public"
  }
}
```

### 2. Vérifier les permissions

```bash
# Vérifier les permissions sur le scope
npm access ls-packages @nazruden

# Donner les permissions si nécessaire
npm access grant read-write @nazruden:developers @nazruden/clickup-server
```

## 🚀 Première publication

### Option 1: Release automatique

```bash
# Bump version et création automatique de release
npm run release:patch
```

### Option 2: Publication manuelle

```bash
# Build et tests
npm run ci:validate

# Publication
npm publish --access public
```

## 🔧 Dépannage

### Erreur "401 Unauthorized" lors de la publication

```bash
# Vérifier le token
npm token list

# Recréer un token si nécessaire
npm token create --type=automation

# Mettre à jour le secret GitHub
```

### Erreur "403 Forbidden" sur le scope

```bash
# Vérifier les permissions
npm access ls-packages @nazruden

# Ou créer l'organisation si elle n'existe pas
npm org add @nazruden username
```

### Workflow qui échoue

1. **Vérifier les secrets :**
   - Settings > Secrets and variables > Actions
   - S'assurer que `NPM_TOKEN` est présent

2. **Vérifier les logs :**
   - Actions > Workflow échoué > Logs détaillés

3. **Retenter manuellement :**
   - Actions > Workflow > Re-run jobs

## 📞 Support

En cas de problème :

1. Vérifier la [documentation NPM](https://docs.npmjs.com/creating-and-publishing-an-org-scoped-package)
2. Consulter les [GitHub Actions docs](https://docs.github.com/en/actions)
3. Ouvrir une issue sur le repository

---

**Last Updated :** 2024-08-02