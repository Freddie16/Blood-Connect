
import React, { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import { ChatMessage } from '../types';
import { getGeminiResponse } from '../services/geminiService';

export const Chat = () => {
    const [messages, setMessages] = useState<ChatMessage[]>([
      { id: '1', text: "Hello! I'm your BloodConnect assistant. Do you have questions about eligibility, the donation process, or finding a drive?", sender: 'ai', timestamp: Date.now() }
    ]);
    const [inputText, setInputText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
  
    const handleSend = async () => {
      if (!inputText.trim()) return;
      const userMsg: ChatMessage = { id: Date.now().toString(), text: inputText, sender: 'user', timestamp: Date.now() };
      setMessages(prev => [...prev, userMsg]);
      setInputText('');
      setIsTyping(true);
      const responseText = await getGeminiResponse(userMsg.text);
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), text: responseText, sender: 'ai', timestamp: Date.now() }]);
      setIsTyping(false);
    };
  
    useEffect(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);
  
    return (
      <div className="max-w-4xl mx-auto p-8 h-full flex flex-col">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 flex-1 flex flex-col overflow-hidden h-[calc(100vh-8rem)]">
            <div className="p-4 border-b border-gray-100 bg-gray-50">
               <h3 className="font-bold text-gray-800">AI Support Assistant</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] p-4 rounded-2xl text-sm ${
                      msg.sender === 'user' 
                      ? 'bg-red-900 text-white rounded-br-none' 
                      : 'bg-gray-100 text-gray-800 rounded-bl-none'
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
                {isTyping && <div className="text-sm text-gray-400 italic">Assistant is typing...</div>}
                <div ref={messagesEndRef} />
            </div>
            <div className="p-4 border-t border-gray-100">
                <div className="flex space-x-2">
                    <input
                        type="text"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Type your question..."
                        className="flex-1 border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-red-500 outline-none"
                    />
                    <button onClick={handleSend} className="px-4 bg-red-900 text-white rounded-lg hover:bg-red-800">
                        <Send className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
      </div>
    );
};
