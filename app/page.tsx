import { CodeCreator } from "./code-creator"

export default function Page() {
  return (
    <main className="min-h-screen bg-gray-900 text-white py-6">
      <div className="container mx-auto px-4">
        <h1 className="text-6xl font-bold text-center mb-8 text-blue-500">WEB CRAFTER 💻</h1>
        <p className="text-center text-gray-400 mb-8">
          Describe the React component or HTML/CSS you want to create and let AI generate the code for you
        </p>
        <CodeCreator />
      </div>
    </main>
  )
}

