// /app/page.tsx
import Header from './components/Header';
import Textbox from './components/Textbox';

export default function Page() {
  return (
    <>
      <Header />
      <main className="min-h-[calc(100vh-72px)] bg-brand-ivory">
        <Textbox />
      </main>
    </>
  );
}
