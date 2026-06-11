import Link from "next/link";

export default function NotFound() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: "clamp(20px, 6vw, 48px)",
        textAlign: "center",
      }}
    >
      <section style={{ maxWidth: 420 }}>
        <p style={{ margin: "0 0 10px", color: "var(--accent)", fontWeight: 800 }}>404</p>
        <h1 style={{ margin: "0 0 12px", fontSize: "clamp(28px, 7vw, 44px)", lineHeight: 1.12 }}>
          페이지를 찾을 수 없습니다
        </h1>
        <p style={{ margin: "0 0 24px", color: "var(--muted)", lineHeight: 1.6 }}>
          요청한 무적수 페이지가 없거나 아직 라이브러리에 공개되지 않았습니다.
        </p>
        <Link href="/" className="btn btn-primary">
          무적수 라이브러리로 돌아가기
        </Link>
      </section>
    </main>
  );
}
