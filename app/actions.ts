"use server"

// Use different models for React and HTML generation
const REACT_API_URL = "https://api-inference.huggingface.co/models/codellama/CodeLlama-7b-hf"
const HTML_API_URL = "https://api-inference.huggingface.co/models/bigcode/santacoder"

export async function generateCode(prompt: string, type: "react" | "html") {
  if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
    return { error: "Please provide a valid prompt" }
  }

  try {
    const apiUrl = type === "react" ? REACT_API_URL : HTML_API_URL
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.HUGGING_FACE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: type === "react" 
          ? `Write a React functional component that ${prompt}. Include any necessary imports and styling.`
          : `Write HTML and CSS code for ${prompt}
             Requirements:
             - Clean, modern design
             - Responsive layout
             - No JavaScript needed
             - Include both HTML structure and CSS styles
             
             Example format:
             <style>
               /* CSS styles */
             </style>
             
             <div class="container">
               <!-- HTML content -->
             </div>`,
        parameters: {
          max_new_tokens: type === "react" ? 750 : 1000,
          temperature: type === "react" ? 0.3 : 0.2,
          top_p: 0.95,
          do_sample: true,
          return_full_text: false
        }
      }),
    })

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`)
    }

    const data = await response.json()
    let generatedCode = data[0]?.generated_text || ""
    
    // Clean up the code
    if (type === "html") {
      generatedCode = generatedCode
        .replace(/```html|```css|```/g, '')
        .replace(/\/\*\s*CSS styles\s*\*\//, '')
        .replace(/<!--\s*HTML content\s*-->/, '')
        .replace(/^\s*[\r\n]/gm, '')
        .replace(/Example format:[\s\S]*?<div class="container">/, '')
        .replace(/Requirements:[\s\S]*?Example format:/, '')
        .trim()

      // Wrap the code in HTML structure if it doesn't include it
      if (!generatedCode.includes('<!DOCTYPE html>')) {
        generatedCode = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    ${generatedCode}
</head>
<body>
    <div class="container">
        ${generatedCode.includes('<style>') ? generatedCode.split('</style>')[1] : generatedCode}
    </div>
</body>
</html>`
      }
    } else {
      generatedCode = generatedCode
        .replace(/```jsx?|```tsx?/gi, '')
        .replace(/```/g, '')
        .trim()
    }

    if (!generatedCode) {
      return { error: "No code was generated. Please try again." }
    }

    return { code: generatedCode }

  } catch (error) {
    console.error('Error generating code:', error)
    return {
      error: "Failed to generate code. Please try again.",
    }
  }
}

