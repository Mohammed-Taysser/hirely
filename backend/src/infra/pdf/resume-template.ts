export const renderResumeHtml = (data: unknown) => {
  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Resume</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 32px; }
    pre { white-space: pre-wrap; word-wrap: break-word; }
  </style>
</head>
<body>
  <h1>Resume Export</h1>
  <pre>${JSON.stringify({ data }, null, 2)}</pre>
</body>
</html>`;
};
