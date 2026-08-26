import { Button } from '@/components/common/button';

type RecommendedQuestionItemListProps = {
  questions: string[];
  onQuestionSelect: (question: string) => void;
};

export default function RecommnededQuestionItemList({
  questions,
  onQuestionSelect,
}: RecommendedQuestionItemListProps) {
  return (
    <div className="flex w-88 flex-col gap-2">
      {questions.map((question) => (
        <Button
          key={question}
          variant="outline"
          size="xl"
          onClick={() => onQuestionSelect(question)}
        >
          {question}
        </Button>
      ))}
    </div>
  );
}
