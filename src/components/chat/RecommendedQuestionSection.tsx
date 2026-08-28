import RecommnededQuestionItemList from '@/components/chat/RecommendedQuestionItemList';
import { Button } from '@/components/common/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/common/tabs';
import { cn } from '@/lib/utils';
import { mockRecommendedQuestionTabs } from '@/mocks/recommendedQuestions';

type RecommendedQuestionSectionProps = {
  onQuestionSelect: (question: string) => void;
  isExpanded: boolean;
  onExpand: () => void;
};

export default function RecommendedQuestionSection({
  onQuestionSelect,
  isExpanded,
  onExpand,
}: RecommendedQuestionSectionProps) {
  return (
    <div className={cn('mt-12 mb-4 flex flex-col gap-8', !isExpanded && 'mt-auto')}>
      <section className={cn('flex flex-col gap-2', !isExpanded && 'text-center')}>
        <span className="text-title-2 text-label-normal font-bold whitespace-pre-line">
          {isExpanded
            ? `뤼이도를 잘 활용하실 수 있도록 \n 질문을 추천해드려요`
            : '뤼이도를 어떻게 이용해볼까요?'}
        </span>
        {!isExpanded && (
          <span className="text-headline text-label-alternative font-medium">
            추천 질문으로 뤼이도를 시작해보세요.
          </span>
        )}
      </section>

      <section>
        <Tabs defaultValue={mockRecommendedQuestionTabs[0].value}>
          <TabsList className={isExpanded ? '' : 'self-center'}>
            {mockRecommendedQuestionTabs.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value}>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {mockRecommendedQuestionTabs.map((tab) => (
            <TabsContent key={tab.value} value={tab.value}>
              <RecommnededQuestionItemList
                questions={isExpanded ? tab.questions : tab.questions.slice(0, 3)}
                onQuestionSelect={onQuestionSelect}
              />
            </TabsContent>
          ))}

          {!isExpanded && (
            <Button variant="ghost" className="w-fit self-center" onClick={onExpand}>
              추천 질문 더보기
            </Button>
          )}
        </Tabs>
      </section>
    </div>
  );
}
