// components/MessageList.jsx
export default function MessageList({ history }) {
  return (
    <div className="space-y-2 bg-gray-100 p-4 rounded h-96 overflow-y-scroll dark:bg-gray-800">
      {history.map((msg, idx) => (
        <div
          key={idx}
          className={`p-2 rounded ${
            msg.role === 'user' ? 'bg-blue-100 text-right dark:text-gray-900' : 'bg-green-100 text-left dark:text-gray-900'
          }`}
        >
          <p>{msg.content}</p>
        </div>
      ))}
    </div>
  );
}
