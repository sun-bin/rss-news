import { type PageProps } from "$fresh/server.ts";

export default function App({ Component }: PageProps) {
  return (
    <html lang="zh-CN">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>RSS 新闻聚合器</title>
        <link rel="stylesheet" href="/styles/modern.css" />
        <style>
          {`
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }

          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            background: #f9fafb;
          }

          a {
            color: #2563eb;
            text-decoration: none;
          }

          a:hover {
            text-decoration: underline;
          }
        `}
        </style>
      </head>
      <body>
        <Component />
      </body>
    </html>
  );
}
