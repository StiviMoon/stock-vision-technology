// components/MessageInput.jsx
import { useState } from 'react';

export default function MessageInput({ onSend }) {
  const [input, setInput] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    onSend(input);
    setInput('');
  };

  return (
    <form onSubmit={handleSubmit} className="flex space-x-2">
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        className="flex-1 border rounded p-2 bg-gray-200 dark:bg-gray-700 dark:text-white"
        placeholder="Haz una pregunta... "
      />
      <button type="submit" className="bg-emerald-500 text-white px-4 py-2 rounded">
        Enviar
      </button>
    </form>
  );
}
