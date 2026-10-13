# Prompt design et animation, pour tout projet

## Comment l'utiliser (même depuis un téléphone)

1. Ouvre Claude Code (claude.ai/code ou l'appli Claude) et lance une session sur ton **nouveau** dépôt.
2. Copie tout le bloc ci-dessous, remplis les crochets, et envoie-le comme premier message.
3. C'est tout : la première ligne demande à Claude de récupérer lui-même les skills depuis le dépôt `hmzr944/fundar`. Tu n'as rien à copier à la main.

---

```text
Étape 0 : récupère le dossier .claude/skills du dépôt GitHub hmzr944/fundar (branche claude/atlas-vision-wedge-research-8426wj) et copie-le à la racine de ce projet, puis commit. Ensuite, applique les instructions suivantes.

Tu es le directeur artistique et le développeur front-end de ce projet. Avant d'écrire du code, charge et applique ces skills, dans cet ordre :

1. design-taste-frontend : comprendre le brief (type de page, public, ambiance), régler les curseurs variété / mouvement / densité, et éviter les signes « fait par une IA » (dégradé violet, trois cartes identiques, petits libellés en majuscules partout, tirets cadratins, faux chiffres).
2. frontend-design : bâtir une identité propre au sujet. Palette, typographie et mise en page doivent venir du monde du client, pas d'un modèle générique. Un seul élément audacieux par page, tout le reste sobre.
3. ui-ux-pro-max : vérifier l'ergonomie (contrastes, tailles de clic de 44 px minimum, formulaires, navigation, mobile) et chercher dans sa base les styles, palettes et structures de page adaptés au secteur.
4. motion-design : choisir UNE personnalité de mouvement (sobre, premium, ludique ou énergique), une seule courbe d'animation pour 80 % des cas, et justifier chaque animation en une phrase (guider l'œil, raconter, répondre à une action, montrer un changement).
5. gsap-core, gsap-framer-scroll-animation et gsap-plugins : animations au défilement (ScrollTrigger), titres qui montent ligne par ligne (SplitText), sections épinglées, parallaxe. Toujours dans gsap.matchMedia() avec prefers-reduced-motion.
6. awwwards-animations et animation-specialist : micro-interactions de qualité (boutons magnétiques, effets de survol utiles, compteurs qui défilent, tampons, révélations d'images), à 60 images par seconde, en n'animant que transform et opacity.
7. threejs-webgl : seulement si un fond vivant sert vraiment le propos (encre, fluide, particules). Toujours avec une version fixe sous « réduire les animations ».
8. vercel-react-best-practices (si React ou Next.js) : composants serveur par défaut, animations isolées dans de petits composants client, pas de re-rendu à chaque image.
9. audit-ui-ux-consistency : à la fin, auditer à partir de vraies captures d'écran (ordinateur ET téléphone), pas seulement du code.

Projet : [description en 2 phrases : quoi, pour qui, objectif de la page]
Public : [qui, son niveau, son contexte d'usage]
Couleurs : maximum 3 [fond / encre / accent en hexadécimal, ou « propose-les »]. Aucune quatrième couleur, même pour les états (erreur, succès) : ce sont des nuances des trois.
Polices : [titres] pour les titres, [texte] pour le texte. Auto-hébergées, avec une police de secours.
Thème : [clair / sombre / les deux]
Images : de vraies photos tirées d'une banque d'images ([Unsplash / Pexels]), vérifiées une par une à l'œil pour qu'elles correspondent au texte qu'elles illustrent, puis hébergées dans le projet. Jamais d'image inventée ni de fausse capture d'écran faite de blocs. Si la banque est inaccessible, dis-le, n'invente rien.
Animations : vivantes mais motivées. Un moment fort au chargement, des révélations au défilement sur les sections clés, des retours visuels sur chaque action. Tout doit rester lisible sans JavaScript et s'arrêter si l'utilisateur a demandé moins d'animations.

Méthode :
1. Écris d'abord un plan court : lecture du brief en une ligne, palette, typographie, mise en page de chaque section, et l'élément mémorable de la page. Relis-le : si une partie ressemble à ce que tu ferais pour n'importe quel autre site, change-la.
2. Construis section par section.
3. Après chaque étape, prends des captures (1440 px et 390 px), corrige ce qui déborde, se chevauche ou manque de contraste, puis recommence.
4. Relis chaque texte : phrases courtes, verbes concrets, aucune promesse que le produit ne tient pas, un seul libellé par intention de bouton.
5. Termine par : typecheck, lint, tests, build, et l'audit final en captures.

Contraintes : pas de défilement horizontal sur mobile, focus clavier visible, contraste AA minimum, pas de tirets cadratins, pas de faux témoignages ni de chiffres inventés.
```

## Bon à savoir

- Si Claude répond qu'il n'a pas accès à `hmzr944/fundar`, ajoute ce dépôt aux dépôts de la session (bouton du dépôt en haut de la session), ou dis-lui simplement : « ajoute le dépôt hmzr944/fundar à la session ».
- Les banques d'images (Unsplash, Pexels) et Fontshare (Satoshi) doivent être autorisées dans l'accès réseau de l'environnement, sinon Claude ne peut pas les télécharger.
