export type RecommendedQuestionTab = {
  value: string;
  label: string;
  questions: string[];
};

export const mockRecommendedQuestionTabs: RecommendedQuestionTab[] = [
  {
    value: 'workspace-team',
    label: '워크스페이스·팀',
    questions: [
      '워크스페이스는 무엇인가요?',
      '팀에서 나가려면 어떻게 하나요?',
      '워크스페이스 멤버를 비활성화하면 데이터는 남나요?',
      '관리자와 멤버는 각각 무엇을 할 수 있나요?',
      '팀원마다 요금제를 따로 결제해야 하나요?',
    ],
  },
  {
    value: 'task-management',
    label: '작업 관리',
    questions: [
      '프로젝트, 목표, 작업은 어떤 계층 구조로 구성되나요?',
      '백로그는 무엇인가요?',
      '작업은 어떤 보기 형태로 볼 수 있나요?',
      '팀의 진행 상황을 한눈에 확인할 수 있나요?',
      '서로 관련된 작업을 연결하려면 어떻게 하나요?',
    ],
  },
  {
    value: 'sprint-meeting',
    label: '스프린트·미팅',
    questions: [
      '스프린트는 무엇이고, 팀에서 쓰면 어떤 점이 좋나요?',
      '스프린트 기간은 몇 주까지 설정할 수 있나요?',
      '스프린트는 어디에서 활성화하고 설정하나요?',
      '반복 미팅은 어떻게 설정하나요?',
      '미팅 보드는 어떻게 작성하나요?',
    ],
  },
  {
    value: 'integration-ai',
    label: '연동·AI',
    questions: [
      '슬랙을 연동하면 어떤 기능을 쓸 수 있나요?',
      '뤼이도와 GitHub를 연동하려면 어떻게 하나요?',
      'MCP 서버는 어떤 AI 툴에 연결할 수 있나요?',
      'AI로 프로젝트 일정을 자동 생성하려면 어떻게 하나요?',
      '구글 캘린더를 연동하면 미팅 일정이 동기화되나요?',
    ],
  },
];
