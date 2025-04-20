import Header from '../components/Header';
import TextboxWithButton from '../components/Textbox';

const Home = () => {
  return (
    <div>
      <Header />
      <main className="flex justify-center items-center h-screen">
        <TextboxWithButton />
      </main>
    </div>
  );
};

export default Home;
