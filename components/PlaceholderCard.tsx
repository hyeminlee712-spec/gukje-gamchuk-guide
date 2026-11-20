// 아직 만들지 않은 영역을 "준비 중"으로 보여 주는 안내 카드.
// 뼈대 단계(작업 1)에서만 쓰고, 해당 기능을 만들 때 실제 화면으로 바꾼다.
type PlaceholderCardProps = {
  title: string;
  description: string;
  workNumber: number; // PLAN.md에서 이 영역을 만들 작업 번호
};

export default function PlaceholderCard({
  title,
  description,
  workNumber,
}: PlaceholderCardProps) {
  return (
    <section className="rounded-lg border border-dashed border-foreground/30 p-4">
      <div className="mb-1 flex items-center gap-2">
        <h2 className="font-semibold">{title}</h2>
        <span className="rounded bg-foreground/10 px-2 py-0.5 text-xs">
          준비 중 · 작업 {workNumber}
        </span>
      </div>
      <p className="text-sm text-foreground/70">{description}</p>
    </section>
  );
}
