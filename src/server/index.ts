import app from './app.ts';

const port = process.env.PORT || 3001;

app.listen(port, () => {
  console.log(`LLD Practice Platform API server running at http://localhost:${port}`);
});
