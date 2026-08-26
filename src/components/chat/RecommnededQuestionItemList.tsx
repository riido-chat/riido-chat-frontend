import { Button } from '@/components/common/button';

type RecommnededQuestionItemListProps = {
  questions: string[];
};

export default function RecommnededQuestionItemList({
  questions,
}: RecommnededQuestionItemListProps) {
  return (
    <div className="flex w-88 flex-col gap-2">
      {questions.map((question) => (
        <Button key={question} variant="outline" size="xl">
          {question}
        </Button>
      ))}
    </div>
  );
}
