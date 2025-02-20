"use client";


export default function ClearText({ messages, clearMessages }) {
  const handleClear = () => {
    if (messages.length === 0) {
      console.log("No messages to clear");
      return;
    }
    clearMessages();
  };

  return (
    <button
      onClick={handleClear}
      className={`ml-auto text-[0.8rem] text-center border-2 border-white p-1 rounded-lg ho`}
    >
      Clear text
    </button>
  );
}
