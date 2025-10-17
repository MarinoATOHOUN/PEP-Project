import React, { useState, useEffect, useContext } from 'react';
import { messagesService, userService } from '../services/api';
import ConversationView from './ConversationView';
import MessageInput from './MessageInput';
import { socket } from '../services/socket';
import { AuthContext } from '../context/AuthContext';
import { Input } from './ui/input';
import { Button } from './ui/button';

const MessagesPage = ({ initialConversationId = null }) => {
    const [conversations, setConversations] = useState([]);
    const [selectedConversation, setSelectedConversation] = useState(initialConversationId);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user } = useContext(AuthContext);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);

    const fetchConversations = async () => {
        try {
            setLoading(true);
            const response = await messagesService.getConversations();
            setConversations(response.conversations);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchConversations();

            socket.connect();
            socket.emit('join', { user_id: user.id });

            const handleNewMessage = (newMessage) => {
                fetchConversations(); // Re-fetch conversations to get the latest state
            };

            socket.on('new_message', handleNewMessage);

            return () => {
                socket.off('new_message', handleNewMessage);
                socket.emit('leave', { user_id: user.id });
                socket.disconnect();
            };
        }
    }, [user]);

    // If the app navigated to Messages with an initial conversation id, select it once conversations are loaded
    useEffect(() => {
        if (initialConversationId && conversations.length > 0) {
            const exists = conversations.find(c => c.user && c.user.id === initialConversationId);
            if (exists) setSelectedConversation(initialConversationId);
        }
    }, [initialConversationId, conversations]);

    const handleConversationSelect = (userId) => {
        setSelectedConversation(userId);
        setSearchTerm('');
        setSearchResults([]);
    };
    
    const handleSearchChange = async (e) => {
        const term = e.target.value;
        setSearchTerm(term);
        if (term.trim()) {
            try {
                const results = await userService.searchUsers(term);
                setSearchResults(results.users.filter(u => u.id !== user.id));
            } catch (error) {
                console.error("Error searching users:", error);
                setSearchResults([]);
            }
        } else {
            setSearchResults([]);
        }
    };

    const startNewConversation = (userId) => {
        // Check if a conversation with this user already exists
        const existingConversation = conversations.find(c => c.user.id === userId);
        if (!existingConversation) {
            // If not, create a placeholder conversation to allow messaging
            const newUser = searchResults.find(u => u.id === userId);
            if (newUser) {
                setConversations(prev => [{ user: newUser, last_message: null }, ...prev]);
            }
        }
        handleConversationSelect(userId);
    };

    if (loading && conversations.length === 0) {
        return <div>Loading conversations...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div className="container mx-auto p-4 flex h-[calc(100vh-80px)]">
            <div className="w-1/3 bg-white shadow rounded-lg mr-4 flex flex-col">
                <div className="p-4 border-b">
                    <h2 className="text-xl font-bold">Conversations</h2>
                    <Input 
                        placeholder="Search users to message..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                        className="mt-2"
                    />
                    {searchResults.length > 0 && (
                        <ul className="bg-white border rounded mt-1 max-h-48 overflow-y-auto">
                            {searchResults.map(u => (
                                <li key={u.id} onClick={() => startNewConversation(u.id)} className="p-2 hover:bg-gray-100 cursor-pointer">
                                    {u.username}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
                <ul className="overflow-y-auto">
                    {conversations.map(conv => (
                        <li key={conv.user.id} 
                            className={`p-4 border-b last:border-b-0 cursor-pointer ${selectedConversation === conv.user.id ? 'bg-gray-200' : ''}`}
                            onClick={() => handleConversationSelect(conv.user.id)}>
                            <div className="flex justify-between">
                                <span className="font-bold">{conv.user.username}</span>
                                {conv.last_message && (
                                    <span className="text-gray-500 text-sm">{new Date(conv.last_message.created_at).toLocaleString()}</span>
                                )}
                            </div>
                            <p className="text-gray-600 truncate">
                                {conv.last_message ? conv.last_message.content : <em>No messages yet</em>}
                            </p>
                        </li>
                    ))}
                </ul>
            </div>
            <div className="w-2/3 bg-white shadow rounded-lg flex flex-col">
                {selectedConversation ? (
                    <>
                        <div className="p-4 border-b">
                            <h2 className="text-xl font-bold">Conversation with {conversations.find(c => c.user.id === selectedConversation)?.user.username || searchResults.find(u => u.id === selectedConversation)?.username}</h2>
                        </div>
                        <div className="flex-grow p-4 overflow-y-auto">
                            <ConversationView userId={selectedConversation} />
                        </div>
                        <div className="p-4 border-t">
                            <MessageInput recipientId={selectedConversation} />
                        </div>
                    </>
                ) : (
                    <div className="h-full flex items-center justify-center">
                        <p className="text-gray-500">Select a conversation or search for a user to start messaging</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MessagesPage;