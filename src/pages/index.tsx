import Link from "next/link";
import * as Auth from "@aws-amplify/auth";
import { Hub } from "aws-amplify/utils";
import { useEffect, useState } from "react";

interface Post {
  author?: string | null;
  content?: string | null;
  createdAt: string;
  id: string;
  title: string;
  updatedAt: string;
  __typename: string;
}

export default function HomePage() {
  const [user, setUser] = useState("");
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    // Check the current user on initial load
    checkUser();

    // Listen for login/signup events
    Hub.listen("auth", (data) => {
      const { payload } = data;
      if (payload.event === "signedIn") {
        checkUser();
      }
    });

    // Fetch posts
    fetchPosts();
  }, []);

  async function checkUser() {
    try {
      const userData = await Auth.getCurrentUser();
      console.log(userData);
      setUser(userData.signInDetails?.loginId as string);
    } catch (err) {
      console.error(err);
      setUser("");
    }
  }

  async function fetchPosts() {
    // Fetch posts from api folder
    try {
      const response = await fetch("/api/queries");
      const data = await response.json();
      setPosts(data.posts || []);
    } catch (err) {
      console.error("Error fetching posts:", err);
      setPosts([]);
    }
  }

  return (
    <div className="container mx-auto p-4 bg-gray-100 min-h-screen">
      <header className="flex justify-between items-center py-4">
        <h1 className="text-3xl font-bold text-gray-800">Our Blog</h1>
        {user ? (
          <button
            onClick={() => Auth.signOut()}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Logout
          </button>
        ) : (
          // Correct usage of Link
          <Link
            href="/login"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Login
          </Link>
        )}
      </header>

      <main>
        <div>
          {posts.map((post) => (
            <article
              key={post.id}
              className="bg-white shadow-md rounded p-4 mb-4"
            >
              <h2 className="text-xl font-semibold text-gray-800">
                {post.title}
              </h2>
              <p className="text-gray-600">{post.content}</p>
              <small className="text-gray-500">
                By {post.author || "Unknown author"}
              </small>
            </article>
          ))}
        </div>
        {user && (
          <div className="mt-4">
            <Link
              href="/create-post"
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
            >
              Create Post
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
