import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en">
      <Head />
      <body>
        <Main />
        <NextScript />
        {/* Add Eruda for mobile debugging */}
        <script async src="https://cdn.jsdelivr.net/npm/eruda"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: '(function(){var script=document.createElement("script");script.onload=function(){eruda.init()};script.src="https://cdn.jsdelivr.net/npm/eruda";document.body.appendChild(script)})();',
          }}
        />
      </body>
    </Html>
  )
} 