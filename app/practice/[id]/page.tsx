import { notFound } from "next/navigation";
import Link from "next/link";
import { getSequence, sequences } from "@/lib/sequences";
import { PracticeSessionLoader } from "@/components/PracticeSessionLoader";

export function generateStaticParams() {
  return sequences.map((s) => ({ id: s.id }));
}

export default async function Practice({ params }: PageProps<"/practice/[id]">) {
  const { id } = await params;
  const sequence = getSequence(id);
  if (!sequence) notFound();
  return (
    <main className="practice-page">
      <Link href="/" className="back-link">
        ← 목록
      </Link>
      <PracticeSessionLoader sequence={sequence} />
    </main>
  );
}
