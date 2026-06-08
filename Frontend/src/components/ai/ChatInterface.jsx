import { useState, useRef, useEffect } from 'react';

export default function ChatInterface({
  onSendMessage,
  loading,
  error,
  messages = [],
  costContext = {},
  disabled = false,
}) {
  const [inputValue, setInputValue] = useState('');
  const [localError, setLocalError] = useState(error);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    setLocalError(error);
  }, [error]);

  const handleSend = async () => {
    if (disabled) return;
    if (!inputValue.trim()) return;

    setLocalError(null);
    const userMessage = inputValue.trim();
    setInputValue('');

    await onSendMessage(userMessage, costContext);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const suggestedQuestions = [
    'What are my biggest cost drivers?',
    'How can I reduce my cloud spending?',
    'Are there any unusual cost spikes?',
    'Which services should I optimize first?',
    'What are cloud cost best practices?',
  ];

  return (
    <div className="flex flex-col h-full bg-pixel-darker border-2 border-pixel-teal">
      <div className="p-3 md:p-4 border-b-2 border-pixel-teal bg-pixel-black">
        <h2 className="font-pixel text-sm md:text-lg text-pixel-teal">AI Cost Advisor</h2>
        <p className="text-xs font-pixel opacity-60">Powered by Gemini</p>
      </div>

      <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center space-y-4">
            <p className="text-center font-pixel opacity-60 text-xs md:text-sm">No messages yet</p>
            <div className="grid grid-cols-1 gap-2 w-full">
              <p className="text-xs font-pixel opacity-80 mb-2">Try asking:</p>
              {suggestedQuestions.map((q, i) => (
                <button
                  key={i}
                  disabled={disabled}
                  onClick={() => setInputValue(q)}
                  className="text-left text-xs font-pixel px-3 py-2 bg-pixel-purple border border-pixel-teal opacity-70 hover:opacity-100 transition disabled:opacity-40"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg, index) => (
              <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] px-3 md:px-4 py-2 md:py-3 border-2 ${
                    msg.role === 'user'
                      ? 'bg-pixel-teal text-pixel-darker border-pixel-teal'
                      : 'bg-pixel-purple text-white border-pixel-coral'
                  } font-pixel text-xs md:text-sm whitespace-pre-wrap`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="px-3 md:px-4 py-2 md:py-3 bg-pixel-purple border-2 border-pixel-coral font-pixel text-xs md:text-sm">
                  <span className="inline-block animate-pulse">Thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {localError && (
        <div className="px-4 py-3 bg-pixel-coral text-pixel-darker border-t-2 border-pixel-coral font-pixel text-xs md:text-sm">
          Error: {localError}
        </div>
      )}

      <div className="p-3 md:p-4 border-t-2 border-pixel-teal bg-pixel-black space-y-3">
        <textarea
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={disabled ? "AI is unavailable. Contact your administrator." : "Ask about your cloud costs..."}
          disabled={loading || disabled}
          className="w-full px-3 py-2 bg-pixel-darker text-white border-2 border-pixel-teal font-pixel text-xs md:text-sm placeholder-gray-500 focus:outline-none resize-none"
          rows="3"
        />

        <button
          onClick={handleSend}
          disabled={disabled || loading || !inputValue.trim()}
          className="w-full px-4 py-2 bg-pixel-teal text-pixel-darker font-pixel border-2 border-pixel-teal hover:opacity-80 disabled:opacity-50 transition text-xs md:text-sm"
        >
          {loading ? 'Sending...' : 'Send Message'}
        </button>
      </div>
    </div>
  );
}
