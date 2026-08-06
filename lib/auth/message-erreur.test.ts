import { describe, expect, it } from "vitest";
import { messageErreurEnvoi } from "./message-erreur";

describe("messageErreurEnvoi", () => {
  it("ne dit rien quand il n'y a pas d'erreur", () => {
    expect(messageErreurEnvoi(null)).toBeNull();
  });

  it("reconnaît le quota d'emails par le code", () => {
    const m = messageErreurEnvoi({ code: "over_email_send_rate_limit" });
    expect(m).toContain("une heure");
  });

  it("reconnaît le quota par le statut HTTP 429", () => {
    // Les versions plus anciennes du client ne remontent pas de code.
    expect(messageErreurEnvoi({ status: 429 })).toContain("une heure");
  });

  it("reconnaît le quota par le texte du message", () => {
    expect(
      messageErreurEnvoi({ message: "Email rate limit exceeded" })
    ).toContain("une heure");
  });

  it("ne conseille jamais de réessayer quand le quota est atteint", () => {
    // C'était le défaut d'origine : chaque tentative repoussait l'échéance.
    const m = messageErreurEnvoi({ code: "over_email_send_rate_limit" })!;
    expect(m.toLowerCase()).toContain("inutile de recommencer");
  });

  it("distingue une adresse invalide", () => {
    expect(messageErreurEnvoi({ code: "email_address_invalid" })).toContain(
      "incorrecte"
    );
  });

  it("reste honnête sur une cause inconnue", () => {
    const m = messageErreurEnvoi({ code: "quelque_chose_de_nouveau" })!;
    expect(m).toContain("échoué");
    expect(m).toContain("pas perdu");
  });
});
