"use client"

import { useState, useEffect } from "react"
import { Loader2, RefreshCw } from "lucide-react"
import Prism from "prismjs"
import "prismjs/themes/prism-tomorrow.css"
import "prismjs/components/prism-jsx"
import "prismjs/components/prism-css"
import "prismjs/components/prism-markup"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { generateCode } from "./actions"

export function CodeCreator() {
  const [code, setCode] = useState("")
  const [preview, setPreview] = useState<string>("")
  const [error, setError] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const [codeType, setCodeType] = useState<"react" | "html">("react")

  useEffect(() => {
    if (code) {
      Prism.highlightAll()
    }
  }, [code])

  const handleGenerate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError("")
    setIsLoading(true)

    const formData = new FormData(event.currentTarget)
    const prompt = formData.get("prompt") as string

    if (!prompt || !prompt.trim()) {
      setError("Please enter a valid prompt")
      setIsLoading(false)
      return
    }

    try {
      const result = await generateCode(prompt, codeType)

      if (result.error) {
        setError(result.error)
      } else if (result.code) {
        const cleanedCode = result.code.trim()
        setCode(cleanedCode)
        
        if (codeType === "react") {
          setPreview(`
            <!DOCTYPE html>
            <html>
              <head>
                <meta charset="UTF-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <style>
                  body { margin: 0; padding: 1rem; }
                </style>
              </head>
              <body>
                <div id="root"></div>
                <script src="https://unpkg.com/react@17/umd/react.development.js"></script>
                <script src="https://unpkg.com/react-dom@17/umd/react-dom.development.js"></script>
                <script src="https://unpkg.com/babel-standalone@6/babel.min.js"></script>
                <script type="text/babel">
                  ${cleanedCode}
                  ReactDOM.render(<App />, document.getElementById('root'));
                </script>
              </body>
            </html>
          `)
        } else {
          setPreview(cleanedCode)
        }
      }
    } catch (error) {
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleReset = () => {
    setCode("")
    setPreview("")
    setError("")
  }

  return (
    <div className="container mx-auto p-6 grid gap-6">
      <Card className="p-6 bg-gray-900 text-white">
        <Tabs defaultValue="react" onValueChange={(value) => setCodeType(value as "react" | "html")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="react">React Component</TabsTrigger>
            <TabsTrigger value="html">HTML & CSS</TabsTrigger>
          </TabsList>
          <TabsContent value="react">
            <form onSubmit={handleGenerate} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="prompt" className="text-sm font-medium">
                  Describe the React component you want to generate
                </label>
                <Input
                  id="prompt"
                  name="prompt"
                  placeholder="E.g. Create a responsive navbar component with a logo and navigation links"
                  required
                  className="w-full bg-gray-800 text-gray-400 border-gray-700"
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-700">
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Generate Component
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleReset}
                  className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Reset
                </Button>
              </div>
            </form>
          </TabsContent>
          <TabsContent value="html">
            <form onSubmit={handleGenerate} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="prompt" className="text-sm font-medium">
                  Describe the HTML and CSS you want to generate
                </label>
                <Input
                  id="prompt"
                  name="prompt"
                  placeholder="E.g. Create a responsive layout with a header, main content, and footer"
                  required
                  className="w-full bg-gray-800 text-gray-300 border-gray-700"
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-700">
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Generate HTML & CSS
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleReset}
                  className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Reset
                </Button>
              </div>
            </form>
          </TabsContent>
        </Tabs>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-6 bg-gray-900 text-white">
          <h2 className="text-lg font-semibold mb-4">Generated Code</h2>
          <div className="relative">
            <pre className="language-jsx h-[400px] overflow-auto">
              <code>{code}</code>
            </pre>
          </div>
        </Card>

        <Card className="p-6 bg-gray-900 text-white">
          <h2 className="text-lg font-semibold mb-4">Live Preview</h2>
          <div className="border border-gray-700 rounded-lg p-4 h-[400px] overflow-auto bg-white">
            {preview ? (
              <iframe srcDoc={preview} title="Preview" className="w-full h-full border-0" sandbox="allow-scripts" />
            ) : (
              <div className="text-gray-400 text-center mt-20">Preview will appear here...</div>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}

