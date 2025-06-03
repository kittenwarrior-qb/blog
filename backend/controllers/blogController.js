import Blog from "../models/Blog.js";
import User from "../models/User.js";

export const getBlog = async (req, res) => {
  let { blog_id, draft, mode } = req.body;

  let incrementVal = mode != "edit" ? 1 : 0;

  Blog.findOneAndUpdate(
    { blog_id },
    { $inc: { "activity.total_reads": incrementVal } }
  )
    .populate(
      "author",
      "personal_info.fullname personal_info.username personal_info.profile_img"
    )
    .select("title des content banner activity publishedAt blog_id tags")
    .then((blog) => {
      User.findOneAndUpdate(
        { "personal_info.username": blog.author.personal_info.username },
        {
          $inc: { "account_info.total_reads": incrementVal },
        }
      ).catch((err) => {
        return res.status(500).json({ error: err.message });
      });

      if (blog.draft && !draft) {
        return res
          .status(500)
          .json({ error: "you can not access draft blogs" });
      }

      return res.status(200).json({ blog });
    })
    .catch((err) => {
      return res.status(500).json({ error: err.message });
    });
};

export const searchBlogs = async (req, res) => {
  let { tag } = req.body;

  let findQuery = { tags: tag, draft: false };

  try {
    const blogs = await Blog.find(findQuery)
      .populate(
        "author",
        "personal_info.profile_img personal_info.username personal_info.fullname -_id"
      )
      .sort({
        publishedAt: -1,
      })
      .select("blog_id title des banner activity tags publishedAt -_id")
      .limit(5);
    return res.status(200).json({ blogs });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const trendingBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find({ draft: false })
      .populate(
        "author",
        "personal_info.profile_img personal_info.username personal_info.fullname -_id"
      )
      .sort({
        "activity.total_read": -1,
        "activity.total_likes": -1,
        publishedAt: -1,
      })
      .select("blog_id title des banner activity tags publishedAt -_id")
      .limit(5);

    return res.status(200).json({ blogs });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const latestBlog = async (req, res) => {
  try {
    const blogs = await Blog.find({ draft: false })
      .populate(
        "author",
        "personal_info.profile_img personal_info.username personal_info.fullname -_id"
      )
      .sort({ publishedAt: -1 }) // desc
      .select("blog_id title des banner activity tags publishedAt author -_id");
    // .limit(5);

    return res.status(200).json({ blogs });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const createBlog = async (req, res) => {
  const authorId = req.user;
  if (!authorId) {
    return res.status(401).json({ error: "Unauthorized: Missing author info" });
  }

  let { title, des, banner, tags, content, draft } = req.body;

  if (!title || !title.length) {
    return res.status(403).json({ error: "You must provide a title" });
  }

  if (
    !content ||
    typeof content !== "object" ||
    !Array.isArray(content.blocks) ||
    !content.blocks.length
  ) {
    return res.status(403).json({ error: "Blog must have some content" });
  }

  if (!draft) {
    if (!des || des.length > 200) {
      return res
        .status(403)
        .json({ error: "Blog description must be under 200 characters" });
    }

    if (!banner) {
      return res.status(403).json({ error: "Blog must have a banner image" });
    }

    if (!tags || !Array.isArray(tags) || !tags.length || tags.length > 10) {
      return res
        .status(403)
        .json({ error: "Blog must have between 1 and 10 tags" });
    }
  }

  tags = Array.isArray(tags) ? tags.map((tag) => tag.toLowerCase()) : [];

  const blog_id = title
    .trim()
    .toLowerCase()
    .replace(/đ/g, "d") // chuyển 'đ' → 'd'
    .normalize("NFD") // tách dấu
    .replace(/[\u0300-\u036f]/g, "") // loại bỏ dấu
    .replace(/[^a-z0-9]+/g, "-") // thay ký tự lạ bằng "-"
    .replace(/^-+|-+$/g, ""); // loại bỏ dấu '-' thừa ở đầu/cuối

  try {
    const blog = new Blog({
      title,
      des,
      banner,
      content,
      tags,
      author: authorId,
      blog_id,
      draft: Boolean(draft),
    });
    await blog.save();

    const incrementVal = draft ? 0 : 1;

    try {
      await User.findOneAndUpdate(
        { _id: authorId },
        {
          $inc: { "account_info.total_posts": incrementVal },
          $push: { blogs: blog._id },
        }
      );
      return res.status(200).json({ id: blog.blog_id });
    } catch (err) {
      console.error("Error updating user posts:", err);
      return res.status(500).json({ error: "Failed to update total posts" });
    }
  } catch (err) {
    console.error("Error creating blog:", err.message);
    return res.status(500).json({ error: "Failed to create blog" });
  }
};

export const userWrittenBlogs = async (req, res) => {
  let user_id = req.user;

  let { page, draft, query, deletedDocCount } = req.body;

  let maxLimit = 5;
  let skipDocs = (page - 1) * maxLimit;

  if (deletedDocCount) {
    skipDocs -= deletedDocCount;
  }

  Blog.find({ author: user_id, draft, title: new RegExp(query, "i") })
    .skip(skipDocs)
    .limit(maxLimit)
    .sort({ publishedAt: -1 })
    .select(" title banner publishedAt blog_id activity des draft -_id ")
    .then((blogs) => {
      return res.status(200).json({ blogs });
    })
    .catch((err) => {
      return res.status(500).json({ error: err.message });
    });
};

export const userWrittenBlogsCount = async (req, res) => {
  let user_id = req.user;

  let { draft, query } = req.body;

  Blog.countDocuments({ author: user_id, draft, title: new RegExp(query, "i") })
    .then((count) => {
      return res.status(200).json({ totalDocs: count });
    })
    .catch((err) => {
      console.log(err.message);
      return res.status(500).json({ error: err.message });
    });
};

export const deleteBlog = async (req, res) => {
  // let user_id = req.user;
  let { blog_id } = req.body;

  Blog.findOneAndDelete({ blog_id })
    .then((blog) => {
      // Notification.deleteMany({ blog: blog._id }).then((data) =>
      //   console.log("notifications deleted")
      // );

      // Comment.deleteMany({ blog_id: blog._id }).then((data) =>
      //   console.log("comments deleted")
      // );

      // User.findOneAndUpdate(
      //   { _id: user_id },
      //   { $pull: { blogs: blog._id }, $inc: { "account_info.total_posts": -1 } }
      // ).then((user) => console.log("Blog deleted"));

      return res.status(200).json({ status: "done" });
    })
    .catch((err) => {
      return res.status(500).json({ error: err.message });
    });
};

// controllers/blogController.js

export const updateBlog = async (req, res) => {
  const user_id = req.user;
  const { blog_id, title } = req.body;

  if (!title || !title.length) {
    return res.status(400).json({ error: "Title cannot be empty" });
  }

  // tạo lại blog_id nếu muốn
  const new_blog_id = title
    .trim()
    .toLowerCase()
    .replace(/đ/g, "d")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  try {
    const blog = await Blog.findOne({ blog_id });

    if (!blog) {
      return res.status(404).json({ error: "Blog not found" });
    }

    // if (blog.author.toString() !== user_id) {
    //   return res
    //     .status(403)
    //     .json({ error: "You are not the author of this blog" });
    // }

    blog.title = title;
    blog.blog_id = new_blog_id;

    await blog.save();

    return res
      .status(200)
      .json({ message: "Blog updated", blog_id: new_blog_id });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
