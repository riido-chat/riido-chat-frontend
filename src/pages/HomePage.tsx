import homePageScreenshot from '@/assets/images/homepage_screenshot.webp';

export default function HomePage() {
  return (
    <section className="h-dvh w-full overflow-hidden">
      <img
        src={homePageScreenshot}
        alt="뤼이도 작업 관리 화면"
        className="h-full w-full max-w-none min-w-7xl object-cover object-top-left"
      />
    </section>
  );
}
