import Header from '../components/Header';
import RichTextEditor from '../components/Textbox';

const Home = () => {
  return (
    <div>
      <Header />
      <main className="min-h-[calc(100vh-72px)] bg-brand-ivory">
        <RichTextEditor />
      </main>
    </div>
  );
};

export default Home;
