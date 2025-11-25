
import React, { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Textarea } from "./ui/textarea";
import { FaHeart, FaRegHeart } from "react-icons/fa6";
import { LuSend } from "react-icons/lu";
import { Button } from "./ui/button";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { toast } from "sonner";
import { setBlog } from "@/redux/blogSlice";
import { setComment } from "@/redux/commentSlice";
import { Edit, Trash2 } from "lucide-react";
import { BsThreeDots } from "react-icons/bs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const CommentBox = ({ selectedBlog }) => {
  const { user } = useSelector((store) => store.auth);
  const { comment } = useSelector((store) => store.comment);
  const { blog } = useSelector((store) => store.blog);
  const dispatch = useDispatch();

  const [content, setContent] = useState("");
  const [activeReplyId, setActiveReplyId] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editedContent, setEditedContent] = useState("");

  // ✅ Fetch comments when blog selected
  useEffect(() => {
    const getAllCommentsOfBlog = async () => {
      try {
        const res = await axios.get(
          `http://localhost:8000/api/v1/comment/${selectedBlog._id}/comment/all`
        );
        dispatch(setComment(res.data.comments || []));
      } catch (error) {
        console.log(error);
      }
    };
    if (selectedBlog?._id) getAllCommentsOfBlog();
  }, [selectedBlog, dispatch]);

  // ✅ Create new comment
  const commentHandler = async () => {
    if (!content.trim()) return toast.error("Comment cannot be empty");
    try {
      const res = await axios.post(
        `http://localhost:8000/api/v1/comment/${selectedBlog._id}/create`,
        { content },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );
      if (res.data.success) {
        const updatedComments = [...comment, res.data.comment];
        dispatch(setComment(updatedComments));

        const updatedBlogData = blog.map((b) =>
          b._id === selectedBlog._id ? { ...b, comments: updatedComments } : b
        );
        dispatch(setBlog(updatedBlogData));

        toast.success("Comment added");
        setContent("");
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to add comment");
    }
  };

  // ✅ Reply to a comment
  const replyHandler = async (parentId) => {
    if (!replyText.trim()) return toast.error("Reply cannot be empty");
    try {
      const res = await axios.post(
        `http://localhost:8000/api/v1/comment/${selectedBlog._id}/create`,
        { content: replyText, parentCommentId: parentId },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );

      if (res.data.success) {
        // append reply in local state
        const updatedComments = comment.map((c) => {
          if (c._id === parentId) {
            return {
              ...c,
              replies: [...(c.replies || []), res.data.comment],
            };
          }
          return c;
        });
        dispatch(setComment(updatedComments));

        toast.success("Reply added");
        setReplyText("");
        setActiveReplyId(null);
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to reply");
    }
  };

  // ✅ Edit comment
  const editCommentHandler = async (
    commentId,
    isReply = false,
    parentId = null
  ) => {
    if (!editedContent.trim()) return toast.error("Comment cannot be empty");
    try {
      const res = await axios.put(
        `http://localhost:8000/api/v1/comment/${commentId}/edit`,
        { content: editedContent },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );

      if (res.data.success) {
        let updatedComments;

        if (isReply) {
          updatedComments = comment.map((c) =>
            c._id === parentId
              ? {
                  ...c,
                  replies: c.replies.map((r) =>
                    r._id === commentId ? { ...r, content: editedContent } : r
                  ),
                }
              : c
          );
        } else {
          updatedComments = comment.map((c) =>
            c._id === commentId ? { ...c, content: editedContent } : c
          );
        }

        dispatch(setComment(updatedComments));
        setEditingCommentId(null);
        setEditedContent("");
        toast.success("Updated successfully");
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to update comment");
    }
  };

  // ✅ Delete comment/reply
  const deleteComment = async (commentId, isReply = false, parentId = null) => {
    try {
      const res = await axios.delete(
        `http://localhost:8000/api/v1/comment/${commentId}/delete`,
        { withCredentials: true }
      );
      if (res.data.success) {
        let updatedComments;

        if (isReply) {
          updatedComments = comment.map((c) =>
            c._id === parentId
              ? {
                  ...c,
                  replies: c.replies.filter((r) => r._id !== commentId),
                }
              : c
          );
        } else {
          updatedComments = comment.filter((c) => c._id !== commentId);
        }

        dispatch(setComment(updatedComments));
        toast.success("Deleted successfully");
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to delete");
    }
  };

  // ✅ Like comment/reply
  const likeCommentHandler = async (
    commentId,
    isReply = false,
    parentId = null
  ) => {
    try {
      const res = await axios.get(
        `http://localhost:8000/api/v1/comment/${commentId}/like`,
        { withCredentials: true }
      );

      if (res.data.success) {
        let updatedCommentList;

        if (isReply) {
          updatedCommentList = comment.map((c) =>
            c._id === parentId
              ? {
                  ...c,
                  replies: c.replies.map((r) =>
                    r._id === commentId ? res.data.updatedComment : r
                  ),
                }
              : c
          );
        } else {
          updatedCommentList = comment.map((c) =>
            c._id === commentId ? res.data.updatedComment : c
          );
        }

        dispatch(setComment(updatedCommentList));
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to like");
    }
  };

  return (
    <div className="mt-4">
      {/* ✅ Logged-in user info */}
      <div className="flex items-center gap-3 mb-3">
        <Avatar>
          <AvatarImage
            src={user?.photoUrl || "/default-avatar.png"}
            alt={user?.firstName || "User"}
          />
          <AvatarFallback>
            {user?.firstName?.[0] || "U"}
            {user?.lastName?.[0] || ""}
          </AvatarFallback>
        </Avatar>
        <h3 className="font-semibold">
          {user?.firstName} {user?.lastName}
        </h3>
      </div>

      {/* ✅ Comment input */}
      <div className="flex gap-2 items-start">
        <Textarea
          placeholder="Write a comment..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="bg-gray-100 dark:bg-gray-800"
        />
        <Button onClick={commentHandler}>
          <LuSend />
        </Button>
      </div>

      {/* ✅ Comments Section */}
      <div className="mt-6 space-y-5">
        {comment.length === 0 ? (
          <p className="text-gray-500 text-center">No comments yet</p>
        ) : (
          comment.map((item) => (
            <div
              key={item._id}
              className="p-3 rounded-md bg-gray-100 dark:bg-gray-800"
            >
              {/* --- Parent Comment --- */}
              <div className="flex items-start justify-between">
                <div className="flex gap-3 items-start">
                  <Avatar>
                    <AvatarImage
                      src={item?.userId?.photoUrl || "/default-avatar.png"}
                      alt="user"
                    />
                    <AvatarFallback>
                      {item?.userId?.firstName?.[0]}
                    </AvatarFallback>
                  </Avatar>

                  <div>
                    <h4 className="font-semibold">
                      {item?.userId?.firstName} {item?.userId?.lastName}
                    </h4>

                    {editingCommentId === item._id ? (
                      <>
                        <Textarea
                          value={editedContent}
                          onChange={(e) => setEditedContent(e.target.value)}
                          className="my-2 bg-gray-200 dark:bg-gray-700"
                        />
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => editCommentHandler(item._id)}
                          >
                            Save
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingCommentId(null)}
                          >
                            Cancel
                          </Button>
                        </div>
                      </>
                    ) : (
                      <p className="text-sm mt-1">{item.content}</p>
                    )}

                    {/* Like & Reply */}
                    <div className="flex gap-4 mt-2 text-sm items-center">
                      <div
                        className="flex items-center gap-1 cursor-pointer"
                        onClick={() => likeCommentHandler(item._id)}
                      >
                        {item.likes.includes(user._id) ? (
                          <FaHeart className="text-red-500" />
                        ) : (
                          <FaRegHeart />
                        )}
                        <span>{item.numberOfLikes}</span>
                      </div>

                      <p
                        className="cursor-pointer text-gray-500"
                        onClick={() =>
                          setActiveReplyId(
                            activeReplyId === item._id ? null : item._id
                          )
                        }
                      >
                        Reply
                      </p>
                    </div>

                    {/* --- Replies --- */}
                    {item.replies &&
                      item.replies.map((reply) => (
                        <div
                          key={reply._id}
                          className="pl-6 mt-3 flex gap-2 items-start"
                        >
                          <Avatar>
                            <AvatarImage
                              src={
                                reply?.userId?.photoUrl || "/default-avatar.png"
                              }
                            />
                            <AvatarFallback>
                              {reply?.userId?.firstName?.[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex justify-between">
                              <h5 className="font-semibold text-sm">
                                {reply?.userId?.firstName}{" "}
                                {reply?.userId?.lastName}
                              </h5>
                              {user._id === reply?.userId?._id && (
                                <DropdownMenu>
                                  <DropdownMenuTrigger>
                                    <BsThreeDots className="text-sm" />
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent>
                                    <DropdownMenuItem
                                      onClick={() => {
                                        setEditingCommentId(reply._id);
                                        setEditedContent(reply.content);
                                      }}
                                    >
                                      <Edit className="mr-2" />
                                      Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() =>
                                        deleteComment(reply._id, true, item._id)
                                      }
                                      className="text-red-500"
                                    >
                                      <Trash2 className="mr-2" />
                                      Delete
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              )}
                            </div>

                            {editingCommentId === reply._id ? (
                              <>
                                <Textarea
                                  value={editedContent}
                                  onChange={(e) =>
                                    setEditedContent(e.target.value)
                                  }
                                  className="my-2 bg-gray-200 dark:bg-gray-700"
                                />
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    onClick={() =>
                                      editCommentHandler(
                                        reply._id,
                                        true,
                                        item._id
                                      )
                                    }
                                  >
                                    Save
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setEditingCommentId(null)}
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              </>
                            ) : (
                              <p className="text-sm">{reply.content}</p>
                            )}
                          </div>
                        </div>
                      ))}

                    {/* --- Reply Input --- */}
                    {activeReplyId === item._id && (
                      <div className="flex gap-2 mt-2">
                        <Textarea
                          placeholder="Write a reply..."
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          className="bg-gray-200 dark:bg-gray-700"
                        />
                        <Button onClick={() => replyHandler(item._id)}>
                          <LuSend />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                {/* --- Menu for Comment --- */}
                {user._id === item?.userId?._id && (
                  <DropdownMenu>
                    <DropdownMenuTrigger>
                      <BsThreeDots />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-[180px]">
                      <DropdownMenuItem
                        onClick={() => {
                          setEditingCommentId(item._id);
                          setEditedContent(item.content);
                        }}
                      >
                        <Edit className="mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => deleteComment(item._id)}
                        className="text-red-500"
                      >
                        <Trash2 className="mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CommentBox;
