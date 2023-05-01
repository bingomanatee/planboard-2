import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <link
          href="https://fonts.googleapis.com/css2?family=Raleway:wght@300;500;700;800&family=Rubik:ital,wght@0,300;0,400;0,700;0,800;1,300;1,400;1,700;1,800&display=swap"
          rel="stylesheet"/>

        <link href='https://api.mapbox.com/mapbox-gl-js/v1.12.0/mapbox-gl.css'
              rel='stylesheet'/>
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
