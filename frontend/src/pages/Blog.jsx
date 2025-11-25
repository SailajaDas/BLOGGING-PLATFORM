import React, { useEffect } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { setBlog } from "@/redux/blogSlice";
import BlogCard from "@/components/BlogCard";

const Blog = () => {
  const dispatch = useDispatch();
  const { blog } = useSelector((store) => store.blog);

  useEffect(() => {
    const getAllPublishedBlogs = async () => {
      try {
        const res = await axios.get(
          "http://localhost:8000/api/v1/blog/get-published-blogs",
          { withCredentials: true }
        );

        if (res.data.success) {
          dispatch(setBlog(res.data.blogs));
        } else {
          console.log("No blogs found");
        }
      } catch (error) {
        console.error("Error fetching blogs:", error);
      }
    };

    getAllPublishedBlogs();
  }, [dispatch]);

  return (
    <div className="pt-16">
      <div className="max-w-6xl mx-auto text-center flex flex-col space-y-4 items-center">
        <h1 className="text-4xl font-bold text-center pt-10">Our Blogs</h1>
        <hr className="w-24 text-center border-2 border-red-500 rounded-full" />
      </div>

      {/* Blog Cards */}
      <div className="max-w-6xl mx-auto grid gap-10 grid-cols-1 md:grid-cols-3 py-10 px-4 md:px-0">
        {blog && blog.length > 0 ? (
          blog.map((item, index) => <BlogCard blog={item} key={index} />)
        ) : (
          <p className="text-center text-gray-500 col-span-3">
            No blogs found.
          </p>
        )}
      </div>
    </div>
  );
};

export default Blog;
