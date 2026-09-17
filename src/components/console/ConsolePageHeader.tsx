type ConsolePageHeaderProps = {
  title: string;
  /** 제목 아래 설명 한 줄. 질문 로그 화면은 설명 문구를 두지 않으므로 생략할 수 있다. */
  description?: string;
  /** 화면 오른쪽에 놓이는 액션 영역 */
  actions?: React.ReactNode;
};

export default function ConsolePageHeader({ title, description, actions }: ConsolePageHeaderProps) {
  return (
    <div className="flex w-full items-start justify-between gap-4">
      <div className="flex min-w-0 flex-col gap-1">
        <h1 className="text-heading text-label-normal font-semibold">{title}</h1>
        {description && <p className="text-label text-label-alternative">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-col items-end gap-2">{actions}</div>}
    </div>
  );
}
