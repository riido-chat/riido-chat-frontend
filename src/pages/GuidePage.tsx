import { Link, useParams } from 'react-router';

export default function GuidePage() {
  const { sectionId } = useParams();

  return (
    <section className="flex flex-col gap-4 p-10">
      <h1 className="text-xl font-bold">가이드 문서: {sectionId}</h1>
      <Link className="underline" to="/">
        홈으로 돌아가기
      </Link>
    </section>
  );
}
