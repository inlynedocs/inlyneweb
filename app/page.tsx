"use client";
import RichTextEditor from "./components/rich-text-editor/RichTextEditor"
import Header from "./components/Header"
import GenerateLink from "./components/GenerateLink"
import { useState } from "react"
import Sidebar from "./components/Sidebar"


const documents = [
  'Test1',
  'Test2',
  'Test3',
  'Test4',
  'Test5',
  'Test6',
];
export default function Home() {
  const [post, setPost] = useState("")

  const onChange = (content: string) => {
    setPost(content)
    console.log(content)
  }

  return (
    <div>{/* Sidebar */}
      <Sidebar documents={documents} />
      
      <div className="max-w-3xl mx-auto py-8">
        <RichTextEditor content={post} onChange={onChange} />
        <GenerateLink content={post} />
      </div>
    
    </div> /* Sidebar */
    
  )
}