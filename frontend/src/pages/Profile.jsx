import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import userLogo from "../assets/user.jpg";
import { FaFacebook, FaLinkedin, FaGithub, FaInstagram } from "react-icons/fa";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { Textarea } from "@/components/ui/textarea";
import axios from "axios";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { setUser } from "@/redux/authSlice";
import TotalProperty from "@/components/TotalProperty";

const Profile = () => {
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user } = useSelector((store) => store.auth);

  const [input, setInput] = useState({
    firstName: user?.firstName,
    lastName: user?.lastName,
    occupation: user?.occupation,
    bio: user?.bio,
    facebook: user?.facebook,
    linkedin: user?.linkedin,
    github: user?.github,
    instagram: user?.instagram,
    file: user?.photoUrl,
  });

  const changeEventHandler = (e) => {
    const { name, value } = e.target;
    setInput((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const changeFileHandler = (e) => {
    setInput({ ...input, file: e.target.files?.[0] });
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("firstName", input.firstName);
    formData.append("lastName", input.lastName);
    formData.append("bio", input.bio);
    formData.append("occupation", input.occupation);
    formData.append("facebook", input.facebook);
    formData.append("linkedin", input.linkedin);
    formData.append("instagram", input.instagram);
    formData.append("github", input.github);

    if (input?.file) {
      formData.append("file", input.file);
    }


    try {
      setLoading(true);
      const res = await axios.put(
        `http://localhost:8000/api/v1/user/profile/update`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        }
      );

      if (res.data.success) {
        setOpen(false);
        toast.success("Profile updated successfully!");
        dispatch(setUser(res.data.user));
      }
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-20 md:ml-[320px] md:h-screen">
      <div className="max-w-6xl mx-auto mt-8">
        <Card className="flex md:flex-row flex-col gap-10 p-6 md:p-10 dark:bg-gray-800 mx-4 md:mx-0">
          {/* image section */}
          <div className="flex flex-col items-center justify-center md:w-[400px]">
            <Avatar className="w-40 h-40 border-2">
              <AvatarImage src={user?.photoUrl || userLogo} />
            </Avatar>

            <h1 className="text-center font-semibold text-xl text-gray-700 dark:text-gray-300 my-3">
              {user?.occupation || "Blogger / Content Creator"}
            </h1>

            <div className="flex gap-4 items-center">
              <Link>
                <FaFacebook className="w-6 h-6 text-gray-800 dark:text-gray-300" />
              </Link>

              <Link to={`${user?.linkedin}`} target="_blank">
                <FaLinkedin className="w-6 h-6 dark:text-gray-300 text-gray-800" />
              </Link>

              <Link to={`${user?.github}`} target="_blank">
                <FaGithub className="w-6 h-6 dark:text-gray-300 text-gray-800" />
              </Link>

              <Link>
                <FaInstagram className="w-6 h-6 text-gray-800 dark:text-gray-300" />
              </Link>
            </div>
          </div>

          {/* info section */}
          <div>
            <h1 className="font-bold text-center md:text-start text-4xl mb-7">
              Hello {user?.firstName}! 👋
            </h1>

            <p>
              <span className="font-semibold">Email: </span>
              {user?.email}
            </p>

            <div className="flex flex-col gap-2 items-start justify-start my-5">
              <Label>About Me</Label>

              <p className="border dark:border-gray-600 p-6 rounded-lg">
                {user?.bio ||
                  "Hi! I'm a blogger who loves writing about technology, lifestyle, travel, and personal experiences."}
              </p>
            </div>

            <Dialog open={open} onOpenChange={setOpen}>
              <Button onClick={() => setOpen(true)}>Edit Profile</Button>

              <DialogContent className="md:w-[425px]">
                <DialogHeader>
                  <DialogTitle className="text-center">
                    Edit Your Blogger Profile
                  </DialogTitle>

                  <DialogDescription className="text-center">
                    Update your personal information here.
                  </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                  {/* name fields */}
                  <div className="flex gap-2">
                    <div>
                      <Label>First Name</Label>
                      <Input
                        id="firstName"
                        name="firstName"
                        value={input.firstName}
                        onChange={changeEventHandler}
                        placeholder="Your first name"
                        className="text-gray-500"
                      />
                    </div>

                    <div>
                      <Label>Last Name</Label>
                      <Input
                        id="lastName"
                        name="lastName"
                        value={input.lastName}
                        onChange={changeEventHandler}
                        placeholder="Your last name"
                        className="text-gray-500"
                      />
                    </div>
                  </div>

                  {/* occupation */}
                  <div>
                    <Label>Occupation</Label>
                    <Input
                      id="occupation"
                      name="occupation"
                      value={input.occupation}
                      onChange={changeEventHandler}
                      placeholder="Your occupation"
                      className="text-gray-500"
                    />
                  </div>

                  {/* social fields */}
                  <div className="flex gap-2">
                    <div>
                      <Label>Facebook</Label>
                      <Input
                        id="facebook"
                        name="facebook"
                        value={input.facebook}
                        onChange={changeEventHandler}
                        placeholder="Facebook profile link"
                        className="text-gray-500"
                      />
                    </div>

                    <div>
                      <Label>Instagram</Label>
                      <Input
                        id="instagram"
                        name="instagram"
                        value={input.instagram}
                        onChange={changeEventHandler}
                        placeholder="Instagram profile link"
                        className="text-gray-500"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <div>
                      <Label>LinkedIn</Label>
                      <Input
                        id="linkedin"
                        name="linkedin"
                        value={input.linkedin}
                        onChange={changeEventHandler}
                        placeholder="LinkedIn profile link"
                        className="text-gray-500"
                      />
                    </div>

                    <div>
                      <Label>Github</Label>
                      <Input
                        id="github"
                        name="github"
                        value={input.github}
                        onChange={changeEventHandler}
                        placeholder="Github (optional)"
                        className="text-gray-500"
                      />
                    </div>
                  </div>

                  {/* bio */}
                  <div>
                    <Label>Description</Label>
                    <Textarea
                      id="bio"
                      name="bio"
                      value={input.bio}
                      onChange={changeEventHandler}
                      placeholder="Write something about yourself..."
                      className="text-gray-500"
                    />
                  </div>

                  {/* file */}
                  <div>
                    <Label>Profile Picture</Label>
                    <Input
                      id="file"
                      type="file"
                      accept="image/*"
                      onChange={changeFileHandler}
                      className="w-[277px]"
                    />
                  </div>
                </div>

                <DialogFooter>
                  {loading ? (
                    <Button>
                      <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                      Saving...
                    </Button>
                  ) : (
                    <Button onClick={submitHandler}>Save Changes</Button>
                  )}
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </Card>
      </div>

      <TotalProperty />
    </div>
  );
};

export default Profile;
