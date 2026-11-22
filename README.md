# Calendrier de l'Avent ❤

Une petite application (PWA) à installer sur l'iPhone de Mélissa : un salon de Noël avec une cheminée qui crépite, un sapin, une chaussette à son nom et un calendrier en bois de 25 cases.

- Avant le 1er décembre : un chrono jusqu'au 1er décembre à minuit.
- Du 1er au 24 décembre : la case du jour s'ouvre à **10h**, le 25 à **20h**.
- Chaque jour, une notification « Ouvre ta case !! 🎁 ».

Adresse de l'app : **https://diiriix.github.io/calendrier/**

## Fichiers

| Fichier | Rôle |
|---|---|
| `js/config.js` | **Les réglages et les 25 cadeaux** (c'est le seul fichier à modifier) |
| `images/` | Les photos des cadeaux (ex. `images/jour-01.jpg`) |
| `index.html`, `css/`, `js/app.js`, `js/dessins.js` | L'application |
| `img/decor.svg`, `img/avant.svg`, `js/scene.js` | Le salon : cheminée, sapin, chaussette, feu animé |
| `sw.js`, `manifest.webmanifest`, `icons/` | Installation sur téléphone, hors ligne, notifications |
| `.github/workflows/notification.yml`, `outils/envoyer-notification.mjs` | Envoi automatique des notifications |

## Mise en ligne (une seule fois)

1. Sur github.com, dans le dépôt : **Settings → Pages**.
2. *Source* : **Deploy from a branch**, branche **main**, dossier **/ (root)**, puis **Save**.
3. Après 1 à 2 minutes, l'app est en ligne sur https://diiriix.github.io/calendrier/

## Installer sur l'iPhone

1. Ouvrir https://diiriix.github.io/calendrier/ dans **Safari**.
2. Bouton **Partager** → **Sur l'écran d'accueil** → **Ajouter**.
3. Ouvrir l'app **depuis son icône** (pas depuis Safari).

## Notifications

Il faut iOS 16.4 ou plus récent, et l'app installée sur l'écran d'accueil.

1. **Settings → Secrets and variables → Actions → New repository secret**
   - Nom : `VAPID_PRIVATE_KEY`, valeur : la clé privée (donnée à part, ne jamais la mettre dans le code).
2. Dans l'app installée, toucher **Activer les notifications**, autoriser, puis **Copier le code**.
3. Nouveau secret : nom `ABONNEMENTS`, valeur : le code copié.
   Plusieurs téléphones ? Mettre les codes à la suite, ou entre crochets `[code1, code2]`.
4. Test : onglet **Actions → Notification du calendrier → Run workflow**.

Ensuite, c'est automatique : 10h (heure de Paris) du 1er au 24 décembre, 20h le 25.

## Mode test

- Ajouter `#test` à la fin de l'adresse affiche un bouton « Mode test » pour simuler une date (chrono, passage à minuit, ouverture à 10h ou 20h…).
- `modeTest: true` dans `js/config.js` affiche ce bouton pour tout le monde et rend toutes les cases ouvrables.

## Modifier un cadeau

Dans `js/config.js` :

```js
{ titre: "Un petit chocolat", dessin: "chocolat",
  texte: "Décembre commence enfin !…" },
```

Pour une photo à la place du dessin : `image: "images/jour-01.jpg"`. La liste des dessins disponibles est en haut de la liste des cadeaux.
