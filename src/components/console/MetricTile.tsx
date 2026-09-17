type MetricTileProps = {
  label: string;
  /** 숫자와 단위를 함께 적은 값. 숫자만 단독으로 쓰지 않는다. */
  value: string;
  /** 값 아래 한 줄 내역. 대시보드의 답변 불가 타일만 쓴다. */
  detail?: string;
};

/** 지표 타일 한 장. 기간 라벨과 증감 표시는 두지 않고, 한 줄에 여러 장을 같은 폭으로 늘어놓는다. */
export default function MetricTile({ label, value, detail }: MetricTileProps) {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-1 whitespace-nowrap">
      <p className="text-label text-label-assistive font-medium">{label}</p>
      <p className="text-title-2 text-label-strong font-bold">{value}</p>
      {detail && <p className="text-label text-label-assistive font-medium">{detail}</p>}
    </div>
  );
}
