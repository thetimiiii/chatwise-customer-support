import '@/app/globals.css';

export const metadata = {
  title: 'Embedded Chat Widget',
  description: 'Simple Support Bot Embedded Chat Widget',
};

export default function EmbeddedChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-transparent">
        {children}
      </body>
    </html>
  );
} 