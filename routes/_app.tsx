import { type PageProps } from "$fresh/server.ts";

export default function App({ Component }: PageProps) {
  return (
    <html lang="zh-CN">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>RSS 新闻聚合器</title>
        <link rel="stylesheet" href="/styles/modern.css" />
      </head>
      <body>
        <Component />
      </body>
    </html>
  );
}
