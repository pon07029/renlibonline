import Link from "next/link";
import { sequenceDisplayName } from "@/lib/sequence-title";
import { sequences } from "@/lib/sequences";

const featured = sequences[0];
const totalNodes = sequences.reduce((sum, sequence) => sum + sequence.nodeCount, 0);
const totalBranches = sequences.reduce((sum, sequence) => sum + sequence.branchCount, 0);

export default function Home() {
  return (
    <main data-testid="home-shell" className="home-shell">
      <header className="home-topbar">
        <div className="brand-mark">
          <span className="brand-dot" aria-hidden="true" />
          <span>Renlib Online</span>
        </div>
        {featured && (
          <Link href={`/practice/${featured.id}`} className="btn btn-ghost">
            바로 연습
          </Link>
        )}
      </header>

      <section className="home-hero">
        <div>
          <p className="eyebrow">RENJU TRAINER</p>
          <h1 className="home-title">렌주 무적수 연습</h1>
          <p className="home-copy">
            흑을 직접 두며 필승 수순을 반복합니다. 백의 여러 응수 분기와 다음 정답을
            한 화면에서 확인하며 차분하게 익힐 수 있습니다.
          </p>
          <div className="hero-actions">
            {featured && (
              <Link href={`/practice/${featured.id}`} className="btn btn-primary">
                첫 수순 시작하기
              </Link>
            )}
            <a href="#library" className="btn btn-ghost">
              라이브러리 보기
            </a>
          </div>
          <div className="stats-row" aria-label="라이브러리 요약">
            <Stat value={`${sequences.length}개`} label="공개 수순" />
            <Stat value={totalNodes.toLocaleString("ko-KR")} label="착수 노드" />
            <Stat value={totalBranches.toLocaleString("ko-KR")} label="분기" />
          </div>
        </div>

        <aside className="preview-panel" aria-label="보드 미리보기">
          <BoardPreview />
          <p className="preview-caption">수순 번호와 마지막 착수를 중심으로 학습합니다.</p>
        </aside>
      </section>

      <section className="feature-grid" aria-label="학습 기능">
        <Feature title="수순 번호" body="착수 순서를 돌 위에 직접 표시해 흐름을 놓치지 않습니다." />
        <Feature title="분기 대응" body="백의 후보 응수를 확인하고 변화도를 따라가며 반복합니다." />
        <Feature title="정답 확인" body="막히는 지점에서는 다음 정답 수를 즉시 확인할 수 있습니다." />
      </section>

      <section id="library" style={{ scrollMarginTop: 24 }}>
        <div className="section-head">
          <div>
            <h2 className="section-title">무적수 라이브러리</h2>
            <p className="section-subtitle">현재 공개된 필승 정석을 선택해 연습하세요.</p>
          </div>
          <span className="badge">{sequences.length}개 수순</span>
        </div>

        <div className="library-grid">
          {sequences.map((sequence) => (
            <Link key={sequence.id} href={`/practice/${sequence.id}`} className="card library-card">
              <div className="library-card-title">{sequenceDisplayName(sequence)}</div>
              <div className="badge-row">
                <Badge>최대 {sequence.maxDepth}수</Badge>
                <Badge>{sequence.nodeCount.toLocaleString("ko-KR")}수</Badge>
                {sequence.branchCount > 0 && <Badge accent>분기 {sequence.branchCount.toLocaleString("ko-KR")}</Badge>}
              </div>
            </Link>
          ))}
        </div>
      </section>

      <footer className="site-footer">Renlib .lib 데이터 기반</footer>
    </main>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <span className="stat-pill">
      <span className="stat-value">{value}</span>
      <span className="stat-label">{label}</span>
    </span>
  );
}

function Feature({ title, body }: { title: string; body: string }) {
  return (
    <article className="card feature-card">
      <h2 className="feature-title">{title}</h2>
      <p className="feature-body">{body}</p>
    </article>
  );
}

function Badge({ children, accent }: { children: React.ReactNode; accent?: boolean }) {
  return <span className={accent ? "badge badge-accent" : "badge"}>{children}</span>;
}

function BoardPreview() {
  const N = 9;
  const C = 30;
  const P = C;
  const D = P * 2 + C * (N - 1);
  const cx = (i: number) => P + i * C;
  const stones: { x: number; y: number; b: boolean; n: number }[] = [
    { x: 4, y: 4, b: true, n: 1 },
    { x: 4, y: 3, b: false, n: 2 },
    { x: 5, y: 3, b: true, n: 3 },
    { x: 3, y: 4, b: false, n: 4 },
    { x: 5, y: 5, b: true, n: 5 },
  ];
  return (
    <svg
      width={D}
      height={D}
      viewBox={`0 0 ${D} ${D}`}
      role="img"
      aria-label="렌주 수순 미리보기"
      style={{ width: "min(300px, 76vw)", height: "auto", display: "block" }}
    >
      <defs>
        <linearGradient id="pwood" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ead29a" />
          <stop offset="100%" stopColor="#dbb773" />
        </linearGradient>
        <radialGradient id="pblack" cx="38%" cy="34%" r="72%">
          <stop offset="0%" stopColor="#5e6461" />
          <stop offset="45%" stopColor="#252928" />
          <stop offset="100%" stopColor="#050606" />
        </radialGradient>
        <radialGradient id="pwhite" cx="38%" cy="34%" r="78%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="72%" stopColor="#f4f5f3" />
          <stop offset="100%" stopColor="#d9dedb" />
        </radialGradient>
      </defs>
      <rect x={0} y={0} width={D} height={D} rx={8} fill="url(#pwood)" />
      {Array.from({ length: N }).map((_, i) => (
        <g key={i}>
          <line x1={cx(0)} y1={cx(i)} x2={cx(N - 1)} y2={cx(i)} stroke="#806033" strokeWidth={1} opacity={0.62} />
          <line x1={cx(i)} y1={cx(0)} x2={cx(i)} y2={cx(N - 1)} stroke="#806033" strokeWidth={1} opacity={0.62} />
        </g>
      ))}
      <circle cx={cx(4)} cy={cx(4)} r={2.6} fill="#6c4f27" opacity={0.75} />
      {stones.map((stone) => (
        <g key={stone.n}>
          <circle
            cx={cx(stone.x)}
            cy={cx(stone.y)}
            r={C * 0.42}
            fill={stone.b ? "url(#pblack)" : "url(#pwhite)"}
            stroke={stone.b ? "none" : "#cbd2ce"}
            strokeWidth={stone.b ? 0 : 0.75}
          />
          <text
            x={cx(stone.x)}
            y={cx(stone.y)}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={C * 0.37}
            fontWeight={750}
            fill={stone.b ? "#f8faf9" : "#1b1f1d"}
          >
            {stone.n}
          </text>
        </g>
      ))}
    </svg>
  );
}
