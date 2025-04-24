// app/page.tsx
import Header from './components/Header'
import RichTextEditor from './components/Textbox'

export default function HomePage() {
  return (
    <>
      <Header />
      <main className="min-h-[calc(100vh-72px)] bg-brand-ivory">
        <RichTextEditor />
      </main>
    </>
  )
}
