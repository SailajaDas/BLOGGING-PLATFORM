import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import React, { useRef, useState } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import JoditEditor from "jodit-react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { toast } from "sonner";
import { setBlog } from "@/redux/blogSlice";

const UpdateBlog = () => {
  const editor = useRef(null);

  const [loading, setLoading] = useState(false);
  const params = useParams();
  const id = params.blogId;
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { blog } = useSelector((store) => store.blog);
  const selectBlog = blog.find((blog) => blog._id === id);

  const [content, setContent] = useState(selectBlog.description);

  const [blogData, setBlogData] = useState({
    title: selectBlog?.title,
    subtitle: selectBlog?.subtitle,
    description: content,
    category: selectBlog?.category,
  });

  const [previewThumbnail, setPreviewThumbnail] = useState(
    selectBlog?.thumbnail
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setBlogData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const selectCategory = (value) => {
    setBlogData({ ...blogData, category: value });
  };

  const selectThumbnail = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setBlogData({ ...blogData, thumbnail: file });

      const fileReader = new FileReader();
      fileReader.onloadend = () => setPreviewThumbnail(fileReader.result);
      fileReader.readAsDataURL(file);
    }
  };

  const updateBlogHandler = async () => {
    const formData = new FormData();
    formData.append("title", blogData.title);
    formData.append("subtitle", blogData.subtitle);
    formData.append("description", content);
    formData.append("category", blogData.category);
    if (blogData.thumbnail) {
      formData.append("file", blogData.thumbnail);
    }

    try {
      setLoading(true);
      const res = await axios.put(
        `http://localhost:8000/api/v1/blog/${id}`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        }
      );

      if (res.data.success) {
        toast.success("Blog updated successfully");
        navigate("/dashboard/your-blog");
      }
    } catch (error) {
      console.log(error);
      toast.error("Update failed");
    } finally {
      setLoading(false);
    }
  };

  const togglePublishUnpublish = async () => {
    try {
      const res = await axios.patch(
        `http://localhost:8000/api/v1/blog/${id}/publish`,
        {},
        { withCredentials: true }
      );

      if (res.data.success) {
        toast.success(res.data.message);
        navigate("/dashboard/your-blog");
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to change publish state");
    }
  };

  const deleteBlog = async () => {
    try {
      const res = await axios.delete(
        `http://localhost:8000/api/v1/blog/${id}`,
        { withCredentials: true }
      );

      if (res.data.success) {
        const updatedBlogData = blog.filter((b) => b._id !== id);
        dispatch(setBlog(updatedBlogData));
        toast.success("Blog deleted");
        navigate("/dashboard/your-blog");
      }
    } catch (error) {
      console.log(error);
      toast.error("Error deleting blog");
    }
  };

  return (
    <div className="pb-10 px-3 pt-20 md:ml-[320px]">
      <div className="max-w-6xl mx-auto mt-8">
        <Card className="w-full bg-white dark:bg-gray-800 p-5 space-y-2">
          <h1 className="text-4xl font-bold">Basic Blog Information</h1>
          <p>Make changes to your blog and click publish when you're done.</p>

          <div className="space-x-2">
            <Button onClick={togglePublishUnpublish}>
              {selectBlog?.isPublished ? "Unpublish" : "Publish"}
            </Button>

            {/* FIXED BUTTON */}
            <Button variant="destructive" onClick={deleteBlog}>
              Delete Blog
            </Button>
          </div>

          <div className="pt-10">
            <Label>Title</Label>
            <Input
              type="text"
              name="title"
              value={blogData.title}
              onChange={handleChange}
            />
          </div>

          <div>
            <Label>Subtitle</Label>
            <Input
              type="text"
              name="subtitle"
              value={blogData.subtitle}
              onChange={handleChange}
            />
          </div>

          <div>
            <Label>Description</Label>
            <JoditEditor
              ref={editor}
              value={content}
              onChange={(newContent) => setContent(newContent)}
            />
          </div>

          <div>
            <Label>Category</Label>
            <Select onValueChange={selectCategory}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {/* <SelectGroup>
                  <SelectLabel>Category</SelectLabel>
                  <SelectItem value="Web Development">
                    Web Development
                  </SelectItem>
                  <SelectItem value="Digital Marketing">
                    Digital Marketing
                  </SelectItem>
                  <SelectItem value="Travel">Travel</SelectItem>
                  <SelectItem value="Blogging">Blogging</SelectItem>
                  <SelectItem value="Lifestyle">Lifestyle</SelectItem>
                </SelectGroup> */}
                                <SelectGroup>
                                  <SelectLabel>Category</SelectLabel>
                                  <SelectItem value="Web Development">
                                    Web Development
                                  </SelectItem>
                                  <SelectItem value="Digital Marketing">
                                    Digital Marketing
                                  </SelectItem>
                                  <SelectItem value="Blogging">Blogging</SelectItem>
                                  <SelectItem value="Photography">Photography</SelectItem>
                                  <SelectItem value="Cooking">Cooking</SelectItem>
                                  <SelectItem value="Lifestyle">Lifestyle</SelectItem>
                                  <SelectItem value="Travel">Travel</SelectItem>
                                  <SelectItem value="Personal Growth">
                                    Personal Growth
                                  </SelectItem>
                                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Thumbnail</Label>
            <Input type="file" accept="image/*" onChange={selectThumbnail} />
            {previewThumbnail && (
              <img src={previewThumbnail} className="w-64 my-2" />
            )}
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => navigate(-1)}>
              Back
            </Button>
            <Button onClick={updateBlogHandler}>
              {loading ? "Please wait…" : "Save Changes"}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default UpdateBlog;
