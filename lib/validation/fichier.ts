/**
 * Bornes sur les justificatifs envoyés par les clients.
 *
 * L'attribut `accept` d'un `<input type="file">` n'est qu'une suggestion
 * pour le sélecteur de fichiers : il se contourne en deux clics. Sans
 * contrôle, un compte peut déposer un fichier de plusieurs gigaoctets et
 * saturer à lui seul le quota de stockage.
 *
 * Ce module est la première barrière, côté navigateur, pour donner un
 * message utile. La barrière qui compte est celle du bucket lui-même
 * (migration 0005), parce qu'elle, on ne peut pas la contourner.
 */

export const TAILLE_MAX_OCTETS = 10 * 1024 * 1024;

export const TYPES_ACCEPTES = [
  "image/jpeg",
  "image/png",
  "image/heic",
  "image/heif",
  "image/webp",
  "application/pdf",
] as const;

export interface ResultatValidationFichier {
  valide: boolean;
  message?: string;
}

function formaterMo(octets: number): string {
  return `${Math.round((octets / (1024 * 1024)) * 10) / 10} Mo`;
}

export function validerFichier(fichier: {
  name: string;
  size: number;
  type: string;
}): ResultatValidationFichier {
  if (fichier.size === 0) {
    return { valide: false, message: "Ce fichier est vide." };
  }

  if (fichier.size > TAILLE_MAX_OCTETS) {
    return {
      valide: false,
      message: `Fichier trop lourd (${formaterMo(fichier.size)}). Maximum ${formaterMo(
        TAILLE_MAX_OCTETS
      )} — une photo de votre carte d'embarquement suffit.`,
    };
  }

  // Certains navigateurs ne renseignent pas le type MIME (HEIC sur d'anciens
  // iOS, notamment). On se rabat alors sur l'extension plutôt que de rejeter
  // un justificatif parfaitement valable.
  const type = fichier.type || typeDepuisExtension(fichier.name);

  if (!TYPES_ACCEPTES.includes(type as (typeof TYPES_ACCEPTES)[number])) {
    return {
      valide: false,
      message: "Formats acceptés : photo (JPG, PNG, HEIC, WEBP) ou PDF.",
    };
  }

  return { valide: true };
}

const TYPE_PAR_EXTENSION: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  heic: "image/heic",
  heif: "image/heif",
  webp: "image/webp",
  pdf: "application/pdf",
};

export function typeDepuisExtension(nom: string): string {
  const extension = nom.split(".").pop()?.toLowerCase() ?? "";
  return TYPE_PAR_EXTENSION[extension] ?? "";
}

/**
 * Nom de fichier sûr pour une clé de stockage.
 *
 * Le nom fourni par l'utilisateur finissait tel quel dans le chemin du
 * bucket. Un nom contenant des slashs déplacerait le fichier dans une
 * arborescence inattendue, et un nom très long ou accentué casse
 * silencieusement certains clients S3. On ne garde donc qu'un jeu de
 * caractères sûr, et on conserve l'extension parce qu'elle sert à
 * l'ouverture du document.
 */
export function nomFichierSur(nom: string): string {
  const dernierPoint = nom.lastIndexOf(".");
  const base = dernierPoint > 0 ? nom.slice(0, dernierPoint) : nom;
  const extensionBrute = dernierPoint > 0 ? nom.slice(dernierPoint + 1) : "";

  const baseSure = base
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^[-.]+|[-.]+$/g, "")
    .slice(0, 60);

  const extensionSure = extensionBrute
    .replace(/[^a-zA-Z0-9]/g, "")
    .slice(0, 8)
    .toLowerCase();

  const nomFinal = baseSure || "justificatif";
  return extensionSure ? `${nomFinal}.${extensionSure}` : nomFinal;
}
