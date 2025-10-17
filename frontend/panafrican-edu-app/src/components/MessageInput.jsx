import React, { useState } from 'react';
import { messagesService } from '../services/api';

const MessageInput = ({ recipientId }) => {
    const [content, setContent] = useState('');
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!content.trim()) return;

        try {
            await messagesService.sendMessage({ recipient_id: recipientId, content });
            setContent('');
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex">
            {error && <div style={{ color: 'red' }}>{error}</div>}
            <textarea
                className="flex-grow p-2 border rounded-lg"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Type your message..."
            />
            <button type="submit" className="ml-2 p-2 bg-blue-500 text-white rounded-lg">Send</button>
        </form>
    );
};

export default MessageInput;