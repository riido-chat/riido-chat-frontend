import { Fragment } from 'react';
import { Link } from 'react-router';

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/common/breadcrumb';

export type BreadcrumbEntry = {
  label: string;
  /** 값이 있으면 상위 경로로 이동하는 링크가 된다. 현재 위치인 마지막 항목에는 두지 않는다. */
  to?: string;
};

type ConsoleTopBarProps = {
  breadcrumb: BreadcrumbEntry[];
  user?: string;
};

export default function ConsoleTopBar({ breadcrumb, user = '관리자 (ADMIN)' }: ConsoleTopBarProps) {
  return (
    <header className="border-line-normal text-label text-label-alternative flex h-14 shrink-0 items-center justify-between border-b px-7">
      <Breadcrumb className="min-w-0">
        <BreadcrumbList className="text-label text-label-alternative flex-nowrap gap-1">
          {breadcrumb.map((entry, index) => {
            const isCurrent = index === breadcrumb.length - 1;

            return (
              <Fragment key={`${index}-${entry.label}`}>
                {index > 0 && <BreadcrumbSeparator>{'>'}</BreadcrumbSeparator>}
                <BreadcrumbItem className="min-w-0">
                  {isCurrent || !entry.to ? (
                    <BreadcrumbPage className="text-label-alternative truncate" title={entry.label}>
                      {entry.label}
                    </BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink
                      className="hover:text-label-normal truncate"
                      render={<Link to={entry.to} />}
                    >
                      {entry.label}
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
              </Fragment>
            );
          })}
        </BreadcrumbList>
      </Breadcrumb>
      <p className="shrink-0 pl-4">{user}</p>
    </header>
  );
}
