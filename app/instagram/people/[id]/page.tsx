"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import InstagramHeader from "../../components/InstagramHeader";

interface UserProfilePageProps {
  params: {
    id: string;
  };
}

const UserProfilePage: React.FC<UserProfilePageProps> = ({ params }) => {
  const { id } = params;
  const router = useRouter();

  const [user, setUser] = useState<{
    username: string;
    avatar: string;
    bio: string;
    postCount: number;
    followers: number;
    following: number;
  } | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const mockUserData = {
        username: `user_${id}`,
        avatar: `data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDE1MCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxjaXJjbGUgY3g9Ijc1IiBjeT0iNzUiIHI9Ijc1IiBmaWxsPSIjRjNGM0YzIi8+Cjx0ZXh0IHg9Ijc1IiB5PSI5MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjI0IiBmaWxsPSIjMDAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5VMzwvdGV4dD4KPHN2Zz4=`,
        bio: `This is a mock bio for user ${id}. Exploring the digital world!`,
        postCount: Math.floor(Math.random() * 100),
        followers: Math.floor(Math.random() * 10000),
        following: Math.floor(Math.random() * 500),
      };
      setUser(mockUserData);
    };

    fetchUser();
  }, [id]);

  if (!user) {
    return (
      <main>
        <InstagramHeader />
        <div>Loading profile...</div>
      </main>
    );
  }

  return (
    <main>
      <InstagramHeader />
      <div>
        <div>
          {user.avatar ? (
            <Image
              src={user.avatar}
              alt={`${user.username}'s avatar`}
              width={150}
              height={150}
            />
          ) : (
            <div>G</div>
          )}
          <div>
            {user.username && <h2>{user.username}</h2>}
            <div>
              <p>
                <strong>{user.postCount}</strong> posts
              </p>
              <p>
                <strong>{user.followers}</strong> followers
              </p>
              <p>
                <strong>{user.following}</strong> following
              </p>
            </div>
            <p>{user.bio}</p>
          </div>
        </div>

        <div>
          {Array.from({ length: user.postCount > 9 ? 9 : user.postCount }).map(
            (_, index) => (
              <div key={index}>
                Post {index + 1}
              </div>
            ),
          )}
        </div>
      </div>
    </main>
  );
};

export default UserProfilePage;
