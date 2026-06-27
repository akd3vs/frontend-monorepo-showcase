import { createFileRoute, Link } from '@tanstack/react-router';

export const Route = createFileRoute('/$')({
  component: NotFoundPage,
});

function NotFoundPage() {
  return (
    <main>
      <h1>Page not found</h1>
      <p>The page you are looking for does not exist.</p>
      <Link to="/portfolio">Go back to Portfolio</Link>
    </main>
  );
}
