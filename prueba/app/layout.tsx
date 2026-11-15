import type { ReactNode } from "react";
import "./tokens.css";
import "@estudio/marca/portal.css";

export default function Raiz({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  );
}
