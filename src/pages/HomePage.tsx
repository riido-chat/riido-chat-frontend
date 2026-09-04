import { Link } from 'react-router';

export default function HomePage() {
  return (
    <section className="flex flex-col gap-4 p-10">
      <h1 className="text-xl font-bold">뤼이도 문서 홈</h1>
      <p className="text-label-alternative text-sm">
        아래 링크로 경로를 이동해도 열려 있는 채팅 내역은 그대로 유지됩니다.
      </p>
      <nav className="flex gap-3">
        <Link className="underline" to="/guide/install">
          설치 가이드
        </Link>
        <Link className="underline" to="/guide/faq">
          자주 묻는 질문
        </Link>
        <Link className="underline" to="/console/document-groups">
          관리자 페이지
        </Link>
      </nav>
    </section>
  );
}
