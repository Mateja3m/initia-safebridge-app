import '../styles/globals.css';
import Providers from './providers';

export const metadata = {
  title: 'SafeBridge',
  description:
    'SafeBridge is a reliability-aware bridging console for evaluating transaction feasibility before execution.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
