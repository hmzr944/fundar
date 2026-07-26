"use client";

import { forwardRef, useImperativeHandle, useRef } from "react";
import SignaturePad from "react-signature-canvas";

export interface SignatureCanvasHandle {
  /** Retourne un data URL PNG, ou null si rien n'a été signé. */
  obtenirSignature: () => string | null;
  effacer: () => void;
}

const SignatureCanvas = forwardRef<SignatureCanvasHandle>((_props, ref) => {
  const padRef = useRef<SignaturePad>(null);

  useImperativeHandle(ref, () => ({
    obtenirSignature: () => {
      const pad = padRef.current;
      if (!pad || pad.isEmpty()) return null;
      return pad.getTrimmedCanvas().toDataURL("image/png");
    },
    effacer: () => padRef.current?.clear(),
  }));

  return (
    <div style={{ border: "1px solid var(--couleur-bordure)", borderRadius: 8 }}>
      <SignaturePad
        ref={padRef}
        canvasProps={{ width: 320, height: 150, style: { width: "100%", height: 150 } }}
      />
    </div>
  );
});

SignatureCanvas.displayName = "SignatureCanvas";

export default SignatureCanvas;
