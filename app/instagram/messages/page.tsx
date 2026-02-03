"use client";

import React, { useState } from "react";
import Image from "next/image";
import InstagramHeader from "../components/InstagramHeader";

interface Conversation {
  id: string;
  username: string;
  lastMessage: string;
  avatar: string;
}

const mockConversations: Conversation[] = [
  {
    id: "1",
    username: "friend_a",
    lastMessage: "Hey, how are you?",
    avatar:
      "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMzIiIGN5PSIzMiIgcj0iMzIiIGZpbGw9IiNGRjAwRkYiLz4KPHRleHQgeD0iMzIiIHk9IjQwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iOCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkZBPPC90ZXh0Pgo8c3ZnPg==",
  },
  {
    id: "2",
    username: "friend_b",
    lastMessage: "Did you see that post?",
    avatar:
      "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMzIiIGN5PSIzMiIgcj0iMzIiIGZpbGw9IiNGRkZGMDAiLz4KPHRleHQgeD0iMzIiIHk9IjQwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iOCIgZmlsbD0iYmxhY2siIHRleHQtYW5jaG9yPSJtaWRkbGUiPkZCPC90ZXh0Pgo8c3ZnPg==",
  },
  {
    id: "3",
    username: "gaia_user",
    lastMessage: "Thanks for the likes!",
    avatar:
      "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMzIiIGN5PSIzMiIgcj0iMzIiIGZpbGw9IiMwMDAwRkYiLz4KPHRleHQgeD0iMzIiIHk9IjQwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iOCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiPllPVTwvdGV4dD4KPHN2Zz4=",
  },
];

const MessagesPage: React.FC = () => {
  const [activeConversation, setActiveConversation] =
    useState<Conversation | null>(mockConversations[0]);
  const [newMessage, setNewMessage] = useState("");

  const handleSendMessage = () => {
    if (newMessage.trim() && activeConversation) {
      alert(`Sending message to ${activeConversation.username}: ${newMessage}`);
      setNewMessage("");
    }
  };

  return (
    <main>
      <InstagramHeader />
      <div>
        <div>
          <h2>Messages</h2>
          {mockConversations.map((conv) => (
            <div
              key={conv.id}
              onClick={() => setActiveConversation(conv)}
            >
              <Image
                src={conv.avatar}
                alt={`${conv.username}'s avatar`}
                width={40}
                height={40}
              />
              <div>
                <p>{conv.username}</p>
                <p>{conv.lastMessage}</p>
              </div>
            </div>
          ))}
        </div>
        <div>
          {activeConversation ? (
            <>
              <div>
                <Image
                  src={activeConversation.avatar}
                  alt={`${activeConversation.username}'s avatar`}
                  width={40}
                  height={40}
                />
                <h3>{activeConversation.username}</h3>
              </div>
              <div>
                <p>
                  Start of conversation with {activeConversation.username}
                </p>
              </div>
              <div>
                <input
                  type="text"
                  placeholder="Message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      handleSendMessage();
                    }
                  }}
                />
                <button onClick={handleSendMessage}>Send</button>
              </div>
            </>
          ) : (
            <div>Select a conversation to start chatting</div>
          )}
        </div>
      </div>
    </main>
  );
};

export default MessagesPage;
