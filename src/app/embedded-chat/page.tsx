'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { EmbedChatWidget } from '@/components/EmbedChatWidget';

export default function EmbeddedChat() {
  const searchParams = useSearchParams();
  const websiteId = searchParams.get('websiteId');
  const token = searchParams.get('token');
  const [isLoading, setIsLoading] = useState(true);
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    if (websiteId && token) {
      setIsValid(true);
    }
    setIsLoading(false);
  }, [websiteId, token]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isValid) {
    return <div>Invalid parameters</div>;
  }

  return (
    <div className="h-screen w-screen bg-transparent">
      <EmbedChatWidget 
        websiteId={websiteId!} 
        token={token!} 
      />
    </div>
  );
} 