/**
 * 문서 그룹 요약 카드와 GitBook 수집 결과 모달에서 반복되는 라벨과 값 한 쌍.
 * 라벨은 고정 문구이고 값은 서버 응답값이며, 값이 없을 때의 표기는 넘겨주는 쪽이 정한다.
 */
export default function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex shrink-0 flex-col gap-1 whitespace-nowrap">
      <p className="text-caption text-label-alternative">{label}</p>
      <p className="text-body-1 text-label-normal font-semibold">{value}</p>
    </div>
  );
}
