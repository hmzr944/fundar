/** A legal identity field, or a visible warning when the operator has not configured it. */
export function LegalValue({ value, label }: { value: string | null; label: string }) {
  return value ? <>{value}</> : <span className="font-medium text-danger">[{label} non renseigné]</span>;
}
