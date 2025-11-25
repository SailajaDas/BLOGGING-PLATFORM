import express from "express";

import { isAuthenticated } from "../middleware/isAuthenticated.js";
import { singleUpload } from "../middleware/multer.js";
import {
  createBlog,
  deleteBlog,
  dislikeBlog,
  getAllBlogs,
  getBlogById,
  getMyTotalBlogLikes,
  getOwnBlogs,
  getPublishedBlog,
  likeBlog,
  togglePublishBlog,
  updateBlog,
} from "../controllers/blog.controller.js";

const router = express.Router();

router.post("/", isAuthenticated, singleUpload, createBlog);

router.get("/get-all-blogs", getAllBlogs);
router.get("/get-published-blogs", getPublishedBlog);
router.get("/get-own-blogs", isAuthenticated, getOwnBlogs);
router.get("/my-blogs/likes", isAuthenticated, getMyTotalBlogLikes);

router.put("/:blogId", isAuthenticated, singleUpload, updateBlog);
router.patch("/:blogId/publish", isAuthenticated, togglePublishBlog);
router.delete("/:blogId", isAuthenticated, deleteBlog);

router.get("/:blogId", getBlogById);
router.get("/:blogId/like", isAuthenticated, likeBlog);
router.get("/:blogId/dislike", isAuthenticated, dislikeBlog);

export default router;
