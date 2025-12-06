// src/services/blogApi.js
import API from "./api";

/**
 * Helper for blog endpoints. Create/Update expects FormData when image present.
 */

export const fetchBlogs = async ({ limit = 6, all = false } = {}) => {
  const res = await API.get("/blogs", { params: { limit, all } });
  return res.data;
};

export const fetchBlog = async (id) => {
  const res = await API.get(`/blogs/${id}`);
  return res.data;
};

export const createBlog = async (formData /* FormData */) => {
  // formData should be FormData instance when image included
  const res = await API.post("/blogs", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const updateBlog = async (id, formData /* FormData */) => {
  const res = await API.put(`/blogs/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const deleteBlog = async (id) => {
  const res = await API.delete(`/blogs/${id}`);
  return res.data;
};
