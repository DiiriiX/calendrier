/* ============================================================
   RÉGLAGES DU CALENDRIER
   ============================================================ */
window.CONFIG = {
  annee: 2026,
  heureOuverture: 10,            // chaque case s'ouvre à cette heure (heure du téléphone)
  heuresSpeciales: { 25: 20 },   // exceptions : la case du 25 s'ouvre à 20h
  prenom: "Mélissa",             // brodé sur la chaussette
  pourQui: "pour Mélissa",       // sous-titre sous « Calendrier de l'Avent »
  signature: "Ton chéri",        // signature en bas du parchemin ("" pour aucune)

  // false = vrai fonctionnement : chrono jusqu'au 1er décembre, une case par jour (10h, le 25 à 20h)
  // true  = panneau « Mode test » visible + toutes les cases ouvrables
  // Astuce : ajouter #test à la fin de l'adresse affiche le panneau de test sans rien changer ici.
  modeTest: false,

  notification: {
    titre: "Calendrier de l'Avent",
    texte: "Ouvre ta case !! 🎁"
  },
  // clé publique des notifications (la clé privée est dans les secrets GitHub)
  vapidPublic: ""
};

/* ============================================================
   LES 25 CADEAUX
   ------------------------------------------------------------
   titre  : le nom du cadeau
   texte  : le petit mot écrit sur le parchemin
   image  : (optionnel) une photo, ex. "images/jour-01.jpg"
   dessin : si pas de photo, un dessin à l'encre :
            chocolat | pralines | gateau | cookie | bonbon | tasse | crepe | bonhomme | popcorn
            pas | chalet | masque | des | cloche | bougie | valise | ticket | lettre
            coeur | etoile | sapin | cadeau
   ============================================================ */
window.CADEAUX = [
  /* 1 */ { titre: "Un petit chocolat", dessin: "chocolat",
    texte: "Décembre commence enfin ! Un petit chocolat pour bien démarrer, et plein de douceurs à venir…" },
  /* 2 */ { titre: "Une balade en amoureux", dessin: "pas",
    texte: "Ce bon t'offre une marche main dans la main, rien que nous deux. Tu choisis le jour, j'apporte les câlins." },
  /* 3 */ { titre: "Des petits gâteaux", dessin: "gateau",
    texte: "Quelques petits gâteaux pour adoucir ta journée. À savourer sans modération (ou presque)." },
  /* 4 */ { titre: "Un massage", dessin: "coeur",
    texte: "Bon pour un massage, quand tu veux et aussi longtemps que tu veux. Installe-toi, je m'occupe de tout." },
  /* 5 */ { titre: "Des cookies faits maison", dessin: "cookie",
    texte: "Ce bon t'offre une fournée de cookies préparés par ton chéri. Toi, tu n'as qu'à les goûter." },
  /* 6 */ { titre: "Des petites sucreries", dessin: "bonbon",
    texte: "Un peu de sucre pour te donner le sourire. Attention, je risque de t'en voler une…" },
  /* 7 */ { titre: "Le marché de Noël de Lyon", dessin: "chalet",
    texte: "Ce bon t'offre une sortie au marché de Noël de Lyon : vin chaud, lumières et petits chalets, main dans la main." },
  /* 8 */ { titre: "Un petit chocolat", dessin: "pralines",
    texte: "Parce qu'on n'en a jamais assez… Plus que 17 jours avant Noël !" },
  /* 9 */ { titre: "Une soirée masque", dessin: "masque",
    texte: "Ce soir, soirée masque et détente. On se chouchoute, et interdiction de rire en voyant ma tête !" },
  /* 10 */ { titre: "L'activité de ton choix", dessin: "etoile",
    texte: "Aujourd'hui, c'est toi qui décides ! Choisis une activité, je te suis sans discuter." },
  /* 11 */ { titre: "Une soirée jeux de société", dessin: "des",
    texte: "Ce soir, on sort les jeux de société. Prépare-toi à perdre… ou à me laisser gagner." },
  /* 12 */ { titre: "Une séance de cinéma", dessin: "ticket",
    texte: "Bon pour une sortie au cinéma, le film de ton choix. Popcorn compris, évidemment !" },
  /* 13 */ { titre: "Une petite balade", dessin: "sapin",
    texte: "Une petite balade avec ton chéri, pour prendre l'air et profiter l'un de l'autre." },
  /* 14 */ { titre: "Un petit chocolat", dessin: "chocolat",
    texte: "Encore un petit chocolat ! Plus que 11 jours avant Noël." },
  /* 15 */ { titre: "Un repas mystère", dessin: "cloche",
    texte: "Ce midi, un repas mystère t'attend. Je ne t'en dis pas plus : laisse-toi surprendre !" },
  /* 16 */ { titre: "Film de Noël sous le plaid", dessin: "popcorn",
    texte: "Ce soir : plaid, popcorn et film de Noël, blottis l'un contre l'autre." },
  /* 17 */ { titre: "Soirée crêpes", dessin: "crepe",
    texte: "Ce soir, on fait des crêpes ! Sucre, Nutella ou confiture : c'est toi qui choisis." },
  /* 18 */ { titre: "Atelier biscuits de Noël", dessin: "bonhomme",
    texte: "Ce soir, atelier biscuits ou pain d'épices. Tablier obligatoire, farine sur le nez en option." },
  /* 19 */ { titre: "Des chocolats Lindt", dessin: "pralines",
    texte: "Tes chocolats Lindt, pour fondre de plaisir. Plus que 6 jours avant Noël !" },
  /* 20 */ { titre: "Un chocolat chaud", dessin: "tasse",
    texte: "Un bon chocolat chaud bien crémeux, pour te réchauffer les mains et le cœur." },
  /* 21 */ { titre: "Des petites sucreries", dessin: "bonbon",
    texte: "Encore un peu de douceur, parce que tu le mérites." },
  /* 22 */ { titre: "Des petits mots doux", dessin: "lettre",
    texte: "Des petits mots doux rien que pour toi, à lire et relire quand je ne suis pas là." },
  /* 23 */ { titre: "Un moment bien-être", dessin: "bougie",
    texte: "Bon pour un moment bien-être rien que pour toi : détente, douceur et chouchoutage garantis." },
  /* 24 */ { titre: "Un gros chocolat", dessin: "chocolat",
    texte: "C'est la veille de Noël ! Un gros chocolat pour patienter… Demain, c'est le grand jour." },
  /* 25 */ { titre: "Un voyage en amoureux", dessin: "valise",
    texte: "Joyeux Noël mon amour ! Prépare ta valise : je t'emmène en voyage en amoureux, quelque part en France. La destination ? Surprise… Je t'aime." }
];
