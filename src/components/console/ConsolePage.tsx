import ConsoleTopBar, { type BreadcrumbEntry } from '@/components/console/ConsoleTopBar';

type ConsolePageProps = {
  breadcrumb: BreadcrumbEntry[];
  children: React.ReactNode;
};

/** 상단 바와 본문 여백을 함께 두는 운영콘솔 화면 공통 골격 */
export default function ConsolePage({ breadcrumb, children }: ConsolePageProps) {
  return (
    <>
      <ConsoleTopBar breadcrumb={breadcrumb} />
      <div className="flex min-h-0 flex-1 flex-col gap-6 px-8 py-6">{children}</div>
    </>
  );
}
