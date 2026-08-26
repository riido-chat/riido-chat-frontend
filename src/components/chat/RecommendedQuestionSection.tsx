import RecommnededQuestionItemList from '@/components/chat/RecommendedQuestionItemList';
import { Button } from '@/components/common/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/common/tabs';
import { mockRecommendedQuestionTabs } from '@/mocks/recommendedQuestions';

type RecommendedQuestionSectionProps = {
  onQuestionSelect: (question: string) => void;
};

export default function RecommendedQuestionSection({
  onQuestionSelect,
}: RecommendedQuestionSectionProps) {
  return (
    <div className="mt-auto flex flex-col gap-4 pb-4">
      <div className="flex flex-col items-center gap-2 pb-4">
        <span className="text-title-2 text-label-normal font-bold">
          뤼이도를 어떻게 이용해볼까요?
        </span>
        <span className="text-headline text-label-alternative font-medium">
          추천 질문으로 뤼이도를 시작해보세요.
        </span>
      </div>

      <Tabs defaultValue={mockRecommendedQuestionTabs[0].value}>
        <TabsList className="self-center">
          {mockRecommendedQuestionTabs.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {mockRecommendedQuestionTabs.map((tab) => (
          <TabsContent key={tab.value} value={tab.value}>
            <RecommnededQuestionItemList
              questions={tab.questions}
              onQuestionSelect={onQuestionSelect}
            />
          </TabsContent>
        ))}
      </Tabs>
      <Button variant="ghost" className="w-fit self-center">
        추천 질문 더보기
      </Button>
    </div>
  );
}
