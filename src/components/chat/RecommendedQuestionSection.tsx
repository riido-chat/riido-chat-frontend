import RecommnededQuestionItemList from '@/components/chat/RecommnededQuestionItemList';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/common/tabs';
import { mockRecommendedQuestionTabs } from '@/mocks/recommendedQuestions';

export default function RecommendedQuestionSection() {
  return (
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
          <RecommnededQuestionItemList questions={tab.questions} />
        </TabsContent>
      ))}
    </Tabs>
  );
}
