import type { ReactNode } from "react";
import { MarcaShell } from "@estudio/marca";
import config from "./marca.config";

export default function LayoutMarca({ children }: { children: ReactNode }) {
  return <MarcaShell config={config}>{children}</MarcaShell>;
}
