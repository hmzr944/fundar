/**
 * Traduction des échecs d'envoi du lien de connexion.
 *
 * Le parcours affichait « Impossible d'envoyer le lien. Réessayez. » quoi
 * qu'il arrive. Quand la vraie cause est un quota d'emails dépassé, ce
 * conseil est exactement le contraire de ce qu'il faut faire : chaque
 * tentative repousse l'échéance. Un passager qui vient de signer son
 * mandat abandonne là, en croyant le service cassé.
 */
export interface ErreurEnvoi {
  status?: number;
  code?: string;
  message?: string;
}

export function messageErreurEnvoi(erreur: ErreurEnvoi | null): string | null {
  if (!erreur) return null;

  const code = erreur.code ?? "";
  const texte = (erreur.message ?? "").toLowerCase();

  if (
    erreur.status === 429 ||
    code === "over_email_send_rate_limit" ||
    texte.includes("rate limit")
  ) {
    return "Trop de liens demandés en peu de temps. Attendez une heure avant de réessayer — inutile de recommencer d'ici là, vos informations sont conservées.";
  }

  if (code === "email_address_invalid" || texte.includes("invalid email")) {
    return "Cette adresse email semble incorrecte. Vérifiez-la et réessayez.";
  }

  if (code === "signup_disabled" || texte.includes("signups not allowed")) {
    return "Les inscriptions sont momentanément fermées. Écrivez-nous, nous ouvrirons votre dossier à la main.";
  }

  // Sans motif reconnu, on reste honnête : on ne sait pas, et on le dit,
  // plutôt que d'inventer une cause qui enverrait sur une fausse piste.
  return "L'envoi du lien a échoué. Si cela se reproduit, écrivez-nous : votre dossier n'est pas perdu.";
}
