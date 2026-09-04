import { NavLink } from 'react-router';

import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { label: '문서 관리', to: '/console/document-groups' },
  { label: '질문 로그', to: '/console/question-logs' },
];

/**
 * 운영콘솔 좌측 고정 내비게이션.
 * ADMIN 권한이 아닐 때는 상위에서 렌더하지 않으므로 비활성 상태를 두지 않는다.
 */
export default function ConsoleGnb() {
  return (
    <nav
      aria-label="운영콘솔 주요 메뉴"
      className="bg-background-secondary border-line-normal flex w-58 shrink-0 flex-col gap-6 border-r p-4"
    >
      <p className="text-body-2 text-label-normal font-semibold">뤼이도 운영콘솔</p>
      <ul className="flex flex-col gap-1">
        {NAV_ITEMS.map(({ label, to }) => (
          <li key={to}>
            <NavLink
              to={to}
              className={({ isActive }) =>
                cn(
                  'text-label flex h-10 items-center rounded-lg px-3 transition-colors',
                  isActive
                    ? 'bg-background-tertiary text-label-normal font-medium'
                    : 'text-label-alternative hover:bg-rc-gray-50 hover:text-label-normal',
                )
              }
            >
              {label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
