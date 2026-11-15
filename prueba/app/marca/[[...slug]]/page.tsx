import { MarcaPagina, marcaMetadata, marcaParams } from "@estudio/marca";
import config from "../marca.config";

type Props = { params: Promise<{ slug?: string[] }> };

export const generateStaticParams = () => marcaParams(config);
export async function generateMetadata({ params }: Props) {
  return marcaMetadata(config, (await params).slug);
}

export default async function Pagina({ params }: Props) {
  return <MarcaPagina config={config} slug={(await params).slug} />;
}
