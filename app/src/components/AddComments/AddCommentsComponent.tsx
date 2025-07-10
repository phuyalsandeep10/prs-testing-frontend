"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import closeicon from "@/assets/icons/close icon.svg";

export interface Comment {
  id: number;
  personName: string;
  imageUrl: string;
  commentText: string;
  isMine?: boolean;
}

interface AddCommentsComponentProps {
  loading?: boolean;
  comments: Comment[];
  onAddComment: (comment: string) => void;
}

const AddCommentsComponent: React.FC<AddCommentsComponentProps> = ({
  loading = false,
  comments,
  onAddComment,
}) => {
  const [comment, setComment] = useState("");

  const handleSubmit = () => {
    if (!comment.trim()) return;
    onAddComment(comment.trim());
    setComment("");
  };

  return (
    <div className="space-y-4 mt-4">
      {/* Header with close icon */}
      <div className="flex items-center justify-between">
        <h1 className="text-[#465FFF] font-bold text-[20px]">ADD Comment</h1>
        <Image src={closeicon} alt="closeicon" />
      </div>
      <hr/>

      {comments.map((comment) => (
        <div
          key={comment.id}
          className={`flex items-start gap-3 ${
            comment.isMine ? "justify-end" : "justify-start"
          } py-2`}
        >
          {!comment.isMine && (
            <div className="w-6 h-6 rounded-full overflow-hidden flex-shrink-0">
              <Image
                src={comment.imageUrl || "/images/default-profile.jpg"}
                alt={comment.personName}
                width={24}
                height={24}
                className="object-cover w-full h-full rounded-full"
              />
            </div>
          )}
          <div className="max-w-[50%]">
            {!comment.isMine && (
              <p className="font-medium text-sm text-[#31323A] mb-1">
                {comment.personName}
              </p>
            )}
            <p className="text-[13px] break-words">{comment.commentText}</p>
          </div>
        </div>
      ))}

      {/* Add Comment Input */}
      <div className="p-3 border rounded bg-[#F8F9FB]">
        <textarea
          rows={3}
          className="w-full p-2 border border-gray-300 rounded text-sm resize-none outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="Write your comment..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          disabled={loading}
        />
        <div className="flex justify-end mt-2">
          <Button onClick={handleSubmit} disabled={loading || !comment.trim()}>
            Add Comment
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AddCommentsComponent;
