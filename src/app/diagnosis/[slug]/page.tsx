import { notFound } from "next/navigation";
import DiagnosisClient from "@/components/DiagnosisClient";
import { DIAGNOSES, getDiagnosis } from "@/diagnoses";

/** 業種別など、各診断を /diagnosis/<slug> で開くページ */
export function generateStaticParams() {
  return DIAGNOSES.map((d) => ({ slug: d.slug }));
}

export default function DiagnosisPage({
  params,
}: {
  params: { slug: string };
}) {
  const diagnosis = getDiagnosis(params.slug);
  if (!diagnosis) notFound();
  return <DiagnosisClient diagnosis={diagnosis} />;
}
