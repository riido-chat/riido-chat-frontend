import { NavLink } from 'react-router';

import { cn } from '@/lib/utils';

type NavItem = {
  label: string;
  to: string;
  /** 2depth 항목. 상위 항목 자체도 화면으로 이어지므로 상위는 정확히 일치할 때만 칠한다. */
  children?: NavItem[];
};

const NAV_ITEMS: NavItem[] = [
  { label: '문서 관리', to: '/document-groups' },
  {
    label: '질문 로그',
    to: '/question-logs',
    children: [
      { label: '문서 목록', to: '/question-logs/documents' },
      { label: '질문 목록', to: '/question-logs/questions' },
    ],
  },
];

/**
 * 운영콘솔 좌측 고정 내비게이션.
 * ADMIN 권한이 아닐 때는 상위에서 렌더하지 않으므로 비활성 상태를 두지 않는다.
 */
export default function ConsoleGnb() {
  const renderItem = ({ label, to, children }: NavItem, isChild = false) => (
    <li key={to} className="flex flex-col gap-1">
      <NavLink
        to={to}
        end={children !== undefined}
        className={({ isActive }) =>
          cn(
            'text-label flex h-10 items-center rounded-lg transition-colors',
            isChild ? 'px-6' : 'px-3',
            isActive
              ? 'bg-rc-gray-200 text-label-normal font-medium'
              : 'text-label-alternative hover:bg-rc-gray-100 hover:text-label-normal',
          )
        }
      >
        {label}
      </NavLink>
      {children && (
        <ul className="flex flex-col gap-1">{children.map((child) => renderItem(child, true))}</ul>
      )}
    </li>
  );

  return (
    <nav
      aria-label="운영콘솔 주요 메뉴"
      className="bg-background-secondary border-line-normal flex w-58 shrink-0 flex-col gap-6 border-r p-4"
    >
      <p className="text-body-2 text-label-normal font-semibold">뤼이도 운영콘솔</p>
      <ul className="flex flex-col gap-1">{NAV_ITEMS.map((item) => renderItem(item))}</ul>
    </nav>
  );
}
