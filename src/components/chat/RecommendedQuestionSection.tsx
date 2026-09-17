import RecommnededQuestionItemList from '@/components/chat/RecommendedQuestionItemList';
import { Button } from '@/components/common/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/common/tabs';
import { cn } from '@/lib/utils';
import { mockRecommendedQuestionTabs } from '@/mocks/recommendedQuestions';
import { useState } from 'react';

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
  const [activeTab, setActiveTab] = useState(mockRecommendedQuestionTabs[0].value);

  return (
    <div key={isExpanded ? 'expanded' : 'default'} className="flex flex-col gap-8">
      <section
        className={cn(
          'animate-in fade-in slide-in-from-bottom-2 flex flex-col gap-2 duration-500',
          !isExpanded && 'text-center',
        )}
      >
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

      <section className="animate-in fade-in slide-in-from-bottom-2 fill-mode-backwards delay-100 duration-500">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
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
                isExpanded={isExpanded}
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
