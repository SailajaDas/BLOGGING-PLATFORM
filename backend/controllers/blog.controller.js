import { Blog } from "../models/blog.model.js";
import Comment from "../models/comment.model.js";
import cloudinary from "../utils/cloudinary.js";
import getDataUri from "../utils/dataUri.js";

export const createBlog = async (req, res) => {
  try {
    const { title, category } = req.body;
    if (!title || !category) {
      return res.status(400).json({
        message: "Blog title and category is required.",
      });
    }

    const blog = await Blog.create({
      title,
      category,
      author: req.id,
      isPublished: true,
    });

    return res.status(201).json({
      success: true,
      blog,
      message: "Blog Created Successfully.",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Failed to create blog",
    });
  }
};

export const updateBlog = async (req, res) => {
  try {
    const blogId = req.params.blogId;
    const { title, subtitle, description, category } = req.body;

    const blog = await Blog.findById(blogId);
    if (!blog) {
      return res.status(404).json({ message: "Blog not found!" });
    }

    let thumbnailUrl = blog.thumbnail;

    if (req.file) {
      const fileUri = getDataUri(req.file);
      const cloudRes = await cloudinary.uploader.upload(fileUri.content);
      thumbnailUrl = cloudRes.secure_url;
    }

    const updateData = {};

    if (title) updateData.title = title;
    if (subtitle) updateData.subtitle = subtitle;
    if (description) updateData.description = description;
    if (category) updateData.category = category;

    updateData.thumbnail = thumbnailUrl;
    updateData.author = req.id;

    const updatedBlog = await Blog.findByIdAndUpdate(blogId, updateData, {
      new: true,
    });

    return res.status(200).json({
      success: true,
      message: "Blog updated successfully",
      blog: updatedBlog,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Error updating blog",
      error: error.message,
    });
  }
};

export const getAllBlogs = async (_, res) => {
  try {
    const blogs = await Blog.find()
      .sort({ createdAt: -1 })
      .populate({
        path: "author",
        select: "firstName lastName photoUrl",
      })
      .populate({
        path: "comments",
        sort: { createdAt: -1 },
        populate: {
          path: "userId",
          select: "firstName lastName photoUrl",
        },
      });
    res.status(200).json({ success: true, blogs });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching blogs",
      error: error.message,
    });
  }
};

export const getPublishedBlog = async (_, res) => {
  try {
    const blogs = await Blog.find({ isPublished: true })
      .sort({ createdAt: -1 })
      .populate({ path: "author", select: "firstName lastName photoUrl" })
      .populate({
        path: "comments",
        sort: { createdAt: -1 },
        populate: {
          path: "userId",
          select: "firstName lastName photoUrl",
        },
      });
    if (!blogs) {
      return res.status(404).json({
        message: "Blog not found",
      });
    }
    return res.status(200).json({
      success: true,
      blogs,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Failed to get published blogs",
    });
  }
};

export const togglePublishBlog = async (req, res) => {
  try {
    const { blogId } = req.params;

    const blog = await Blog.findById(blogId);
    if (!blog) {
      return res.status(404).json({ message: "Blog not found!" });
    }

    blog.isPublished = !blog.isPublished;
    await blog.save();

    return res.status(200).json({
      success: true,
      message: blog.isPublished ? "Blog Published" : "Blog Unpublished",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Failed to update publish status",
    });
  }
};

export const getOwnBlogs = async (req, res) => {
  try {
    const userId = req.id; // Assuming `req.id` contains the authenticated user’s ID

    if (!userId) {
      return res.status(400).json({ message: "User ID is required." });
    }

    const blogs = await Blog.find({ author: userId })
      .populate({
        path: "author",
        select: "firstName lastName photoUrl",
      })
      .populate({
        path: "comments",
        sort: { createdAt: -1 },
        populate: {
          path: "userId",
          select: "firstName lastName photoUrl",
        },
      });

    if (!blogs) {
      return res
        .status(404)
        .json({ message: "No blogs found.", blogs: [], success: false });
    }

    return res.status(200).json({ blogs, success: true });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching blogs", error: error.message });
  }
};

// Delete a blog post
export const deleteBlog = async (req, res) => {
  try {
    // const blogId = req.params.id;
    const blogId = req.params.blogId;
    const authorId = req.id;
    const blog = await Blog.findById(blogId);
    if (!blog) {
      return res
        .status(404)
        .json({ success: false, message: "Blog not found" });
    }
    if (blog.author.toString() !== authorId) {
      return res
        .status(403)
        .json({ success: false, message: "Unauthorized to delete this blog" });
    }

    // Delete blog
    await Blog.findByIdAndDelete(blogId);

    // Delete related comments
    await Comment.deleteMany({ postId: blogId });

    res
      .status(200)
      .json({ success: true, message: "Blog deleted successfully" });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting blog",
      error: error.message,
    });
  }
};

export const likeBlog = async (req, res) => {
  try {
    // const blogId = req.params.id;
    const blogId = req.params.blogId;
    const likeKrneWalaUserKiId = req.id;
    const blog = await Blog.findById(blogId).populate({ path: "likes" });
    if (!blog)
      return res
        .status(404)
        .json({ message: "Blog not found", success: false });

    //like logic started
    await blog.updateOne({ $addToSet: { likes: likeKrneWalaUserKiId } });
    await blog.save();

    return res.status(200).json({ message: "Blog liked", blog, success: true });
  } catch (error) {
    console.log(error);
  }
};

export const dislikeBlog = async (req, res) => {
  try {
    const likeKrneWalaUserKiId = req.id;
    // const blogId = req.params.id;
    const blogId = req.params.blogId;
    const blog = await Blog.findById(blogId);
    if (!blog)
      return res
        .status(404)
        .json({ message: "post not found", success: false });

    //dislike logic started
    await blog.updateOne({ $pull: { likes: likeKrneWalaUserKiId } });
    await blog.save();

    return res
      .status(200)
      .json({ message: "Blog disliked", blog, success: true });
  } catch (error) {
    console.log(error);
  }
};

export const getMyTotalBlogLikes = async (req, res) => {
  try {
    const userId = req.id;

    // Step 1: Find all blogs authored by the logged-in user
    const myBlogs = await Blog.find({ author: userId }).select("likes");

    // Step 2: Sum up the total likes
    const totalLikes = myBlogs.reduce(
      (acc, blog) => acc + (blog.likes?.length || 0),
      0
    );

    res.status(200).json({
      success: true,
      totalBlogs: myBlogs.length,
      totalLikes,
    });
  } catch (error) {
    console.error("Error getting total blog likes:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch total blog likes",
    });
  }
};

export const getBlogById = async (req, res) => {
  try {
    const { blogId } = req.params;

    const blog = await Blog.findById(blogId)
      .populate({
        path: "author",
        select: "firstName lastName photoUrl",
      })
      .populate({
        path: "comments",
        sort: { createdAt: -1 },
        populate: {
          path: "userId",
          select: "firstName lastName photoUrl",
        },
      });

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }

    res.status(200).json({ success: true, blog });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error fetching blog",
      error: error.message,
    });
  }
};
