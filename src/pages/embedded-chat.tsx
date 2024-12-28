import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { EmbedChatWidget } from '@/components/EmbedChatWidget';

export default function EmbeddedChat() {
  const router = useRouter();
  const { websiteId, token } = router.query;
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    if (typeof websiteId === 'string' && typeof token === 'string') {
      setIsValid(true);
    }
  }, [websiteId, token]);

  if (!isValid) {
    return null;
  }

  return (
    <div className="h-screen w-screen bg-transparent">
      <EmbedChatWidget 
        websiteId={websiteId as string} 
        token={token as string} 
      />
    </div>
  );
} 