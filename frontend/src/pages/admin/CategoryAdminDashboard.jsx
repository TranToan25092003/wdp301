import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import ImgCrop from "antd-img-crop";
import { Upload, message } from "antd";
import { UploadOutlined } from "@ant-design/icons";

// Ensure Ant Design CSS is imported (add to your main app or CSS file)
// import 'antd/dist/antd.css';

// Sample category data (replace with actual API data)
const initialCategories = [
  {
    _id: "682fed324a0495973b61df51",
    name: "Electronics",
    image: "/assets/category-electronics.jpeg",
    tags: ["gadget", "tech", "innovation", "smart"],
  },
  {
    _id: "682feddc4a0495973b61df52",
    name: "Furniture",
    image: "/assets/category-furniture.png",
    tags: ["comfort", "interior", "wood", "durability"],
  },
];

// Animation variants for Framer Motion
const cardVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const tableVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5, delay: 0.2 } },
};

export function CategoryAdminDashboard() {
  const [categories, setCategories] = useState(initialCategories);
  const [newTag, setNewTag] = useState({});
  const [fileLists, setFileLists] = useState({}); // Per-category fileList state

  // Handle name updates
  const handleUpdate = (id, field, value) => {
    setCategories(
      categories.map((category) =>
        category._id === id ? { ...category, [field]: value } : category
      )
    );
  };

  // Handle image upload
  const handleImageChange = (id, { fileList: newFileList }) => {
    const isLt5M = newFileList.every(
      (file) => !file.originFileObj || file.originFileObj.size / 1024 / 1024 < 5
    );

    if (!isLt5M) {
      message.error("Image must be less than 5MB!");
      return;
    }

    setFileLists({ ...fileLists, [id]: newFileList });

    if (newFileList.length > 0 && newFileList[0].originFileObj) {
      const reader = new FileReader();
      reader.onload = () => {
        setCategories(
          categories.map((category) =>
            category._id === id
              ? { ...category, image: reader.result }
              : category
          )
        );
        message.success("Image uploaded successfully!");
      };
      reader.readAsDataURL(newFileList[0].originFileObj);
    } else if (newFileList.length === 0) {
      // Revert to original image if upload is cleared
      setCategories(
        categories.map((category) =>
          category._id === id
            ? {
                ...category,
                image: initialCategories.find((c) => c._id === id).image,
              }
            : category
        )
      );
      message.info("Image reset to original.");
    }
  };

  // Handle adding a new tag
  const handleAddTag = (id) => {
    if (newTag[id]?.trim()) {
      setCategories(
        categories.map((category) =>
          category._id === id
            ? { ...category, tags: [...category.tags, newTag[id].trim()] }
            : category
        )
      );
      setNewTag({ ...newTag, [id]: "" });
      message.success("Tag added successfully!");
    } else {
      message.warning("Please enter a valid tag!");
    }
  };

  // Handle removing a tag
  const handleRemoveTag = (id, tagToRemove) => {
    console.log("Removing tag:", tagToRemove, "from category:", id); // Debug log
    setCategories(
      categories.map((category) =>
        category._id === id
          ? {
              ...category,
              tags: category.tags.filter((tag) => tag !== tagToRemove),
            }
          : category
      )
    );
    message.success(`Tag "${tagToRemove}" removed!`);
  };

  // Handle save (mock API call)
  const handleSave = (id) => {
    const category = categories.find((c) => c._id === id);
    console.log("Saving category:", category);
    message.success("Category saved successfully!");
    // Replace with actual API call to save changes
  };

  return (
    <div className="container mx-auto p-6 bg-gradient-to-b from-gray-50 to-gray-100 dark:from-zinc-950 dark:to-zinc-900 min-h-screen">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={cardVariants}
        className="max-w-5xl mx-auto"
      >
        <Card className="shadow-xl border-0 bg-white dark:bg-zinc-800 rounded-2xl">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-gray-900 dark:text-gray-100">
              Category Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <motion.div
              variants={tableVariants}
              initial="hidden"
              animate="visible"
            >
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-gray-700 dark:text-gray-300">
                      Category Name
                    </TableHead>
                    <TableHead className="text-gray-700 dark:text-gray-300">
                      Image
                    </TableHead>
                    <TableHead className="text-gray-700 dark:text-gray-300">
                      Tags
                    </TableHead>
                    <TableHead className="text-gray-700 dark:text-gray-300">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.map((category) => (
                    <motion.tr
                      key={category._id}
                      className="hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <TableCell>
                        <Input
                          value={category.name}
                          onChange={(e) =>
                            handleUpdate(category._id, "name", e.target.value)
                          }
                          className="w-full text-gray-900 dark:text-gray-100 bg-transparent border-gray-300 dark:border-zinc-600"
                          placeholder="Category Name"
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col items-center gap-2 justify-center max-w-24 overflow-hidden">
                          <img
                            src={category.image}
                            alt={category.name}
                            className="w-24 h-24 object-cover rounded-lg shadow-sm hover:scale-105 transition-transform duration-300"
                          />
                          <ImgCrop rotationSlider>
                            <Upload
                              listType="picture"
                              fileList={
                                fileLists[category._id]?.length > 0
                                  ? fileLists[category._id]
                                  : [
                                      {
                                        uid: category._id,
                                        url: category.image,
                                        name: category.name,
                                        status: "done",
                                      },
                                    ]
                              }
                              onChange={(info) =>
                                handleImageChange(category._id, info)
                              }
                              beforeUpload={() => false} // Prevent auto-upload
                              maxCount={1} // Allow only one image
                              className="w-full max-w-xs"
                            >
                              <Button
                                size="sm"
                                className="bg-primary hover:bg-primary/90"
                              >
                                <UploadOutlined className="mr-2" />
                                Upload
                              </Button>
                            </Upload>
                          </ImgCrop>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {category.tags.map((tag, index) => (
                            <Badge
                              key={`${tag}-${index}`} // Unique key for each tag
                              variant="secondary"
                              className="cursor-pointer hover:bg-red-500/80 transition-colors"
                              onClick={() => handleRemoveTag(category._id, tag)}
                            >
                              {tag} ×
                            </Badge>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <Input
                            value={newTag[category._id] || ""}
                            onChange={(e) =>
                              setNewTag({
                                ...newTag,
                                [category._id]: e.target.value,
                              })
                            }
                            placeholder="Add new tag"
                            className="w-32"
                          />
                          <Button
                            size="sm"
                            onClick={() => handleAddTag(category._id)}
                            className="bg-primary hover:bg-primary/90"
                          >
                            Add
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          onClick={() => handleSave(category._id)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          Save
                        </Button>
                      </TableCell>
                    </motion.tr>
                  ))}
                </TableBody>
              </Table>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
