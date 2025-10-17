import React, { useState, useEffect, useRef, useContext } from 'react';
import { messagesService } from '../services/api';
import { socket } from '../services/socket';
import { AuthContext } from '../context/AuthContext';

const ConversationView = ({ userId }) => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user } = useContext(AuthContext);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (!userId) return;

        const fetchConversation = async () => {
            try {
                const response = await messagesService.getConversation(userId);
                setMessages(response.messages);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchConversation();

        const handleNewMessage = (newMessage) => {
            if (newMessage.sender_id === userId || newMessage.recipient_id === userId) {
                setMessages(prevMessages => [...prevMessages, newMessage]);
            }
        };

        socket.on('new_message', handleNewMessage);

        return () => {
            socket.off('new_message', handleNewMessage);
        };
    }, [userId]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div className="flex flex-col h-full">
            <div className="flex-grow overflow-y-auto p-4">
                {messages.map(msg => (
                    <div key={msg.id} className={`flex ${msg.sender_id === user.id ? 'justify-end' : 'justify-start'}`}>
                        <div className={`p-2 rounded-lg max-w-xs ${msg.sender_id === user.id ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>
                            <p>{msg.content}</p>
                            <span className="text-xs text-gray-400">{new Date(msg.created_at).toLocaleTimeString()}</span>
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>
        </div>
    );
};

export default ConversationView;