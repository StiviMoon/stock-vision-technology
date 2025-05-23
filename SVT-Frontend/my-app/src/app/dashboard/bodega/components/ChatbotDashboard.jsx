// components/ChatDashboard.jsx
'use client';
import { useState } from 'react';
import MessageInput from './MessageInput';
import MessageList from './MessageList';


export default function ChatDashboard() {
  const [history, setHistory] = useState([]); // Guarda [{ role: "user"|"bot", content: "..." }]

  const sendMessage = async (question) => {
    setHistory((prev) => [...prev, { role: 'user', content: question }]);

    try {
      const res = await fetch('http://127.0.0.1:8000/chatbot/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question }),
      });
      const data = await res.json();
      setHistory((prev) => [...prev, { role: 'bot', content: data.response }]);
    } catch (err) {
      setHistory((prev) => [...prev, { role: 'bot', content: '❌ Error al obtener respuesta.' }]);
    }
  };

  return (
    <div className="p-4 space-y-4">
        
     <h1 className="text-2xl font-bold">🤖 Chatbot SVT</h1>
      <MessageList history={history} />
      <MessageInput onSend={sendMessage} />
      
    </div>
  );
}
