import { Link, useNavigate } from 'react-router';

import {
  ConsoleTable,
  ConsoleTableBody,
  ConsoleTableCell,
  ConsoleTableHead,
} from '@/components/console/ConsoleTable';
import { SearchIndexStatusBadge } from '@/components/console/StatusBadge';
import { formatSearchIndexVersion } from '@/lib/console';
import type { DocumentGroupSummary } from '@/types/console.types';

const getDetailPath = (groupId: string) => `/console/document-groups/${groupId}`;

/** 문서 그룹 목록 표. 행은 항상 클릭할 수 있고 문서 그룹 상세로 이동한다. */
export default function DocumentGroupTable({ groups }: { groups: DocumentGroupSummary[] }) {
  const navigate = useNavigate();

  return (
    <ConsoleTable>
      <colgroup>
        <col />
        <col className="w-57.5" />
        <col className="w-27.5" />
        <col className="w-57.5" />
        <col className="w-53.5" />
      </colgroup>
      <thead>
        <tr>
          <ConsoleTableHead>문서 그룹명</ConsoleTableHead>
          <ConsoleTableHead>사용하는 기능</ConsoleTableHead>
          <ConsoleTableHead>문서 수</ConsoleTableHead>
          <ConsoleTableHead>검색 반영 상태</ConsoleTableHead>
          <ConsoleTableHead>검색 버전</ConsoleTableHead>
        </tr>
      </thead>
      <ConsoleTableBody>
        {groups.map((group) => (
          <tr
            key={group.id}
            onClick={() => navigate(getDetailPath(group.id))}
            className="hover:bg-rc-gray-50 cursor-pointer transition-colors"
          >
            <ConsoleTableCell className="truncate">
              <Link
                to={getDetailPath(group.id)}
                title={group.name}
                onClick={(event) => event.stopPropagation()}
                className="focus-visible:ring-button-primary-enabled rounded-sm outline-none focus-visible:ring-2"
              >
                {group.name}
              </Link>
            </ConsoleTableCell>
            <ConsoleTableCell className="text-label-assistive truncate">
              {group.feature}
            </ConsoleTableCell>
            <ConsoleTableCell>{group.documentCount}</ConsoleTableCell>
            <ConsoleTableCell>
              <SearchIndexStatusBadge status={group.searchIndexStatus} />
            </ConsoleTableCell>
            <ConsoleTableCell className="truncate">
              {formatSearchIndexVersion(group.searchIndexVersion)}
            </ConsoleTableCell>
          </tr>
        ))}
      </ConsoleTableBody>
    </ConsoleTable>
  );
}
