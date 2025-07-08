"use client";

import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AddCommentsComponent, {
  Comment,
} from "@/components/AddComments/AddCommentsComponent";

// Simulated in-memory "database"
let commentsDB: Comment[] = [
  {
    id: 1,
    personName: "You",
    imageUrl: "",
    commentText: "I will review and update soon.",
    isMine: true,
  },
  {
    id: 2,
    personName: "Maya Rai",
    imageUrl: "/images/maya-profile.jpg",
    commentText: "Please ensure this is reviewed today.",
    isMine: false,
  },
  {
    id: 3,
    personName: "Anil Thapa",
    imageUrl: "/images/anil-profile.jpg",
    commentText: "Dev-side cleared. Waiting for accounts.",
    isMine: false,
  },
  {
    id: 4,
    personName: "You",
    imageUrl: "",
    commentText: "I will review and update soon.",
    isMine: true,
  },
];

// Simulate API fetch (returns current commentsDB)
const fetchComments = async (): Promise<Comment[]> => {
  return new Promise((resolve) =>
    setTimeout(() => {
      resolve([...commentsDB]); // clone so no direct mutation
    }, 1000)
  );
};

// Simulate API post (adds to commentsDB)
const postComment = async (comment: Comment): Promise<Comment> => {
  return new Promise((resolve) =>
    setTimeout(() => {
      commentsDB.push(comment);
      resolve(comment);
    }, 500)
  );
};

const AddCommentsSection = () => {
  const queryClient = useQueryClient();

  // Fetch comments
  const {
    data: comments = [],
    isLoading,
    isError,
    error,
  } = useQuery<Comment[]>({
    queryKey: ["comments"],
    queryFn: fetchComments,
  });

  const mutation = useMutation({
    mutationFn: postComment,
    onMutate: async (newComment) => {
      await queryClient.cancelQueries({ queryKey: ["comments"] });

      const previousComments = queryClient.getQueryData<Comment[]>([
        "comments",
      ]);

      queryClient.setQueryData<Comment[]>(["comments"], (old = []) => [
        ...old,
        newComment,
      ]);

      return { previousComments };
    },
    onError: (_, __, context) => {
      if (context?.previousComments) {
        queryClient.setQueryData(["comments"], context.previousComments);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["comments"] });
    },
  });
  

  const handleAddComment = (text: string) => {
    const newComment: Comment = {
      id: Date.now(),
      personName: "You",
      imageUrl: "",
      commentText: text,
      isMine: true,
    };

    mutation.mutate(newComment);
  };

  if (isError) {
    return (
      <div className="text-red-600 mt-2">
        Error loading comments: {(error as Error)?.message}
      </div>
    );
  }

  return (
    <AddCommentsComponent
      loading={isLoading}
      comments={comments}
      onAddComment={handleAddComment}
    />
  );
};

export default AddCommentsSection;
