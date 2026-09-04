import { Outlet } from 'react-router';

import ConsoleGnb from '@/components/console/ConsoleGnb';

/** 운영콘솔 공통 레이아웃. 좌측 고정 내비게이션과 본문 영역으로 나눈다. */
export default function ConsoleLayout() {
  return (
    <div className="bg-background-default flex h-dvh items-stretch">
      <ConsoleGnb />
      <main className="flex min-w-0 flex-1 flex-col overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
