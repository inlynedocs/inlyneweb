// // app/page.tsx
// import Header from './components/Header'
// import Textbox from './components/Textbox'

// export default function HomePage() {
//   return (
//     <>
//       <Header />
//       <main className="min-h-[calc(100vh-72px)] bg-brand-ivory">
//         <Textbox />
//       </main>
//     </>
//   )
// }

"use client";
import RichTextEditor from "./components/rich-text-editor/RichTextEditor"
import Header from "./components/Header";
import GenerateLink from "./components/GenerateLink";
import { useState } from "react";

export default function Home() {
  const [post, setPost] = useState("");

  const onChange = (content: string) => {
    setPost(content);
    console.log(content);
  };

  return (
    <>
      <Header />
      <div className="max-w-3xl mx-auto py-8">
        <RichTextEditor content={post} onChange={onChange} />
        <GenerateLink content={post} />
      </div>
    </>
    
  );
}