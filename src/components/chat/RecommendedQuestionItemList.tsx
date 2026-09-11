import { Button } from '@/components/common/button';
import { cn } from '@/lib/utils';

type RecommendedQuestionItemListProps = {
  questions: string[];
  onQuestionSelect: (question: string) => void;
  isExpanded: boolean;
};

export default function RecommnededQuestionItemList({
  questions,
  onQuestionSelect,
  isExpanded,
}: RecommendedQuestionItemListProps) {
  return (
    <div className="flex flex-col gap-2">
      {questions.map((question) => (
        <Button
          key={question}
          variant="outline"
          size="xl"
          className={cn(isExpanded && 'justify-start text-left')}
          onClick={() => onQuestionSelect(question)}
        >
          {question}
        </Button>
      ))}
    </div>
  );
}
