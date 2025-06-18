import Blog from "../models/Blog.js";
import User from "../models/User.js";

export const getDraftsByUsername = async (req, res) => {
  try {
    const { username, page = 1, limit = 5 } = req.query;
    const skip = (page - 1) * limit;

    if (!username) {
      return res.status(400).json({ msg: "Thiếu username" });
    }

    const user = await User.findOne({ "personal_info.username": username });

    if (!user) {
      return res.status(404).json({ msg: "Không tìm thấy người dùng" });
    }

    const blogs = await Blog.find({ author: user._id, draft: true })
      .sort({ publishedAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate({
        path: "author",
        select:
          "personal_info.fullname personal_info.username personal_info.profile_img",
      });

    const totalBlogs = await Blog.countDocuments({
      author: user._id,
      draft: false,
    });

    return res.status(200).json({
      msg: "Lấy blog thành công",
      data: blogs,
      page: Number(page),
      totalPages: Math.ceil(totalBlogs / limit),
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: "Lỗi server", error: err.message });
  }
};

export const getByUsername = async (req, res) => {
  try {
    const { username, page = 1, limit = 5 } = req.query;
    const skip = (page - 1) * limit;

    if (!username) {
      return res.status(400).json({ msg: "Thiếu username" });
    }

    // Tìm user để lấy ObjectId
    const user = await User.findOne({ "personal_info.username": username });

    if (!user) {
      return res.status(404).json({ msg: "Không tìm thấy người dùng" });
    }

    const blogs = await Blog.find({ author: user._id, draft: false })
      .sort({ publishedAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate({
        path: "author",
        select:
          "personal_info.fullname personal_info.username personal_info.profile_img",
      });

    const totalBlogs = await Blog.countDocuments({
      author: user._id,
      draft: false,
    });

    return res.status(200).json({
      msg: "Lấy blog thành công",
      data: blogs,
      page: Number(page),
      totalPages: Math.ceil(totalBlogs / limit),
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: "Lỗi server", error: err.message });
  }
};

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

  let findQuery = { tags: tag };

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

export const getAllBlogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;
    const { tag, search } = req.query;

    const filter = {};

    if (tag) {
      filter.tags = tag;
    }

    if (search) {
      filter.title = { $regex: search, $options: "i" };
    }

    const blogs = await Blog.find(filter)
      .populate(
        "author",
        "personal_info.profile_img personal_info.username personal_info.fullname -_id"
      )
      .sort({ publishedAt: -1 })
      .skip(skip)
      .limit(limit)
      .select(
        "blog_id title des banner activity tags publishedAt draft author -_id"
      );

    const totalBlogs = await Blog.countDocuments(filter);
    const totalPages = Math.ceil(totalBlogs / limit);

    const total_view = blogs.reduce((acc, blog) => {
      return acc + (blog.activity.total_reads || 0);
    }, 0);

    return res.status(200).json({
      blogs,
      pagination: {
        totalBlogs,
        totalPages,
        currentPage: page,
        limit,
      },
      total_view,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const latestBlog = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;
    const { tag } = req.query;

    const filter = { draft: false };
    if (tag) {
      filter.tags = tag;
    }

    const blogs = await Blog.find(filter)
      .populate(
        "author",
        "personal_info.profile_img personal_info.username personal_info.fullname -_id"
      )
      .sort({ publishedAt: -1 }) // newest first
      .skip(skip)
      .limit(limit)
      .select("blog_id title des banner activity tags publishedAt author -_id");

    const totalBlogs = await Blog.countDocuments(filter);
    const totalPages = Math.ceil(totalBlogs / limit);

    return res.status(200).json({
      blogs,
      pagination: {
        totalBlogs,
        totalPages,
        currentPage: page,
        limit,
      },
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const createBlog = async (req, res) => {
  const authorId = req.user.id;
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
  const { blog_id } = req.params;

  try {
    const blog = await Blog.findOneAndDelete({ blog_id });

    if (!blog) {
      return res.status(404).json({ msg: "Blog not found" });
    }

    await User.updateOne(
      { _id: blog.author },
      {
        $pull: { blogs: blog._id },
        $inc: {
          "account_info.total_posts": -1,
          "account_info.total_reads": -blog.activity.total_reads,
        },
      }
    );

    return res.status(200).json({ status: "done" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const updateBlog = async (req, res) => {
  const user_id = req.user;
  const blog_id = req.params.id;
  const { title, banner, des, tags, draft, content } = req.body;

  if (!title || !title.length) {
    return res.status(400).json({ error: "Title cannot be empty" });
  }

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
    //   return res.status(403).json({ error: "Not authorized" });
    // }

    blog.title = title;
    blog.banner = banner;
    blog.des = des;
    blog.tags = tags;
    blog.draft = draft;
    blog.content = content;
    blog.blog_id = new_blog_id;

    await blog.save();

    return res.status(200).json({
      message: "Blog updated",
      blog_id: new_blog_id,
    });
  } catch (err) {
    console.log(err);

    return res.status(500).json({ error: err.message });
  }
};

export const likeBlog = async (req, res) => {
  try {
    const user_id = req.user;
    const { _id, islikedByUser } = req.body;

    const incrementVal = !islikedByUser ? 1 : -1;

    const blog = await Blog.findOneAndUpdate(
      { _id },
      { $inc: { "activity.total_likes": incrementVal } },
      { new: true }
    );

    if (!blog) {
      return res.status(404).json({ error: "Blog not found" });
    }

    return res.status(200).json({ liked_by_user: !islikedByUser });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
