const Forum = require("../models/forum");

// ✅ Create a new forum
exports.createForum = async (req, res) => {
  try {
    const { title, description, createdBy } = req.body;
    const forum = new Forum({ title, description, createdBy });
    await forum.save();
    res.status(201).json(forum);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Create a new comment inside a forum
exports.createComment = async (req, res) => {
  try {
    const { forumId, text, user } = req.body;
    const forum = await Forum.findById(forumId);
    if (!forum) return res.status(404).json({ message: "Forum not found" });

    const comment = { text, user, createdAt: new Date() };
    forum.comments.push(comment);
    await forum.save();

    res.status(201).json(comment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Get all comments
exports.getAllComments = async (req, res) => {
  try {
    const forum = await Forum.findById(req.params.forumId).populate("comments.author", "username");
    if (!forum) return res.status(404).json({ message: "Forum not found" });

    res.json(forum.comments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Edit a comment
exports.editComment = async (req, res) => {
  try {
    const { forumId, commentId, content } = req.body;
    const forum = await Forum.findById(forumId);
    if (!forum) return res.status(404).json({ message: "Forum not found" });

    const comment = forum.comments.id(commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    comment.content = content;
    comment.editedAt = new Date();
    await forum.save();

    res.json(comment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Delete a comment
exports.deleteComment = async (req, res) => {
  try {
    const { forumId, commentId } = req.params;
    const forum = await Forum.findById(forumId);
    if (!forum) return res.status(404).json({ message: "Forum not found" });

    const comment = forum.comments.id(commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    comment.remove();
    await forum.save();

    res.json({ message: "Comment deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Reply to a comment
exports.replyToComment = async (req, res) => {
  try {
    const { forumId, commentId, author, content } = req.body;
    const forum = await Forum.findById(forumId);
    if (!forum) return res.status(404).json({ message: "Forum not found" });

    const comment = forum.comments.id(commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    const reply = { author, content, createdAt: new Date() };
    comment.replies.push(reply);
    await forum.save();

    res.status(201).json(reply);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Edit a reply
exports.editReply = async (req, res) => {
  try {
    const { forumId, commentId, replyId, content } = req.body;
    const forum = await Forum.findById(forumId);
    if (!forum) return res.status(404).json({ message: "Forum not found" });

    const comment = forum.comments.id(commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    const reply = comment.replies.id(replyId);
    if (!reply) return res.status(404).json({ message: "Reply not found" });

    reply.content = content;
    reply.editedAt = new Date();
    await forum.save();

    res.json(reply);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Delete a reply
exports.deleteReply = async (req, res) => {
  try {
    const { forumId, commentId, replyId } = req.params;
    const forum = await Forum.findById(forumId);
    if (!forum) return res.status(404).json({ message: "Forum not found" });

    const comment = forum.comments.id(commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    const reply = comment.replies.id(replyId);
    if (!reply) return res.status(404).json({ message: "Reply not found" });

    reply.remove();
    await forum.save();

    res.json({ message: "Reply deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Get a forum by ID
exports.getForumById = async (req, res) => {
  try {
    const forum = await Forum.findById(req.params.forumId);
    if (!forum) return res.status(404).json({ message: "Forum not found" });
    res.json(forum);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Get forums by user ID
exports.getForumsByUserId = async (req, res) => {
  try {
    const forums = await Forum.find({ createdBy: req.params.userId });
    res.json(forums);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Get all forums
exports.getAllForums = async (req, res) => {
  try {
    const forums = await Forum.find();
    res.json(forums);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Update a forum
exports.updateForum = async (req, res) => {
  try {
    const { forumId, title, description } = req.body;
    const forum = await Forum.findById(forumId);
    if (!forum) return res.status(404).json({ message: "Forum not found" });

    forum.title = title;
    forum.description = description;
    forum.updatedAt = new Date();
    await forum.save();

    res.json(forum);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Delete a forum
exports.deleteForum = async (req, res) => {
  try {
    const forum = await Forum.findByIdAndDelete(req.params.forumId);
    if (!forum) return res.status(404).json({ message: "Forum not found" });

    res.json({ message: "Forum deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
