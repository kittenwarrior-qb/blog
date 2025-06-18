import Notification from "../models/Notification";

export const checkNewNotification = (req, res) => {
  const user_id = req.user;

  Notification.exists({
    notification_for: user_id,
    seen: false,
    user: { $ne: user_id },
  })
    .then((result) => {
      return res
        .status(200)
        .json({ new_notification_available: Boolean(result) });
    })
    .catch((err) => {
      console.error(err.message);
      return res.status(500).json({ error: err.message });
    });
};

export const getNotifications = (req, res) => {
  const user_id = req.user;
  const { page, filter, deletedDocCount } = req.body;

  const maxLimit = 10;
  let skipDocs = (page - 1) * maxLimit;
  if (deletedDocCount) skipDocs -= deletedDocCount;

  const findQuery = {
    notification_for: user_id,
    user: { $ne: user_id },
  };

  if (filter !== "all") {
    findQuery.type = filter;
  }

  Notification.find(findQuery)
    .skip(skipDocs)
    .limit(maxLimit)
    .populate("blog", "title blog_id")
    .populate(
      "user",
      "personal_info.fullname personal_info.username personal_info.profile_img"
    )
    .populate("comment", "comment")
    .populate("replied_on_comment", "comment")
    .populate("reply", "comment")
    .sort({ createdAt: -1 })
    .select("createdAt type seen reply")
    .then((notifications) => {
      Notification.updateMany(findQuery, { seen: true })
        .skip(skipDocs)
        .limit(maxLimit)
        .then(() => console.log("notifications marked as seen"));

      return res.status(200).json({ notifications });
    })
    .catch((err) => {
      console.error(err.message);
      return res.status(500).json({ error: err.message });
    });
};

export const countNotifications = (req, res) => {
  const user_id = req.user;
  const { filter } = req.body;

  const findQuery = {
    notification_for: user_id,
    user: { $ne: user_id },
  };

  if (filter !== "all") {
    findQuery.type = filter;
  }

  Notification.countDocuments(findQuery)
    .then((count) => res.status(200).json({ totalDocs: count }))
    .catch((err) => res.status(500).json({ error: err.message }));
};
