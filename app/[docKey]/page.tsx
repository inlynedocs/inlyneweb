import Header from '../components/Header'
import RichTextEditor from '../components/Textbox'

interface DocPageProps {
  params: { docKey: string }
}

export default function DocPage({ params }: DocPageProps) {
  return (
    <>
      <Header />
      <main className="min-h-[calc(100vh-72px)] bg-brand-ivory">
        {/* Pass the docKey into your editor */}
        <RichTextEditor initialDocKey={params.docKey} />
      </main>
    </>
  )
}
