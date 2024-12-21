export const sendChatMessage = async (message, websiteId, token) => {
  console.log('Sending chat message:', { message, websiteId });
  
  try {
    const response = await fetch(`${window.location.origin}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        websiteId,
        token,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to send message');
    }

    const data = await response.json();
    console.log('Chat response received:', data);
    return data.response;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};