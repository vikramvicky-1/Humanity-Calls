import User from "../models/User.js";

const toNode = (u) => ({
  id: String(u._id),
  name: u.name,
  email: u.email,
  teamRole: u.teamRole || "",
  reportsTo: u.reportsTo ? String(u.reportsTo) : null,
  children: [],
});

export const getTeamTree = async (_req, res) => {
  try {
    const users = await User.find({ role: "user" })
      .select("name email teamRole reportsTo role createdAt")
      .lean();

    const map = new Map();
    users.forEach((u) => map.set(String(u._id), toNode(u)));

    const roots = [];
    const orphans = [];

    map.forEach((node) => {
      if (!node.reportsTo) {
        roots.push(node);
        return;
      }
      const parent = map.get(node.reportsTo);
      if (parent) parent.children.push(node);
      else orphans.push(node);
    });

    const sortTree = (n) => {
      n.children.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
      n.children.forEach(sortTree);
    };

    roots.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    roots.forEach(sortTree);

    res.status(200).json({
      roots,
      orphans,
      total: users.length,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch team tree", error: error.message });
  }
};

export const updateTeamAssignment = async (req, res) => {
  try {
    const { id } = req.params;
    const { teamRole, reportsTo } = req.body;

    const update = {};
    if (teamRole !== undefined) update.teamRole = String(teamRole || "");
    if (reportsTo !== undefined) update.reportsTo = reportsTo || null;

    if (update.reportsTo && String(update.reportsTo) === String(id)) {
      return res.status(400).json({ message: "User cannot report to themselves" });
    }

    const updated = await User.findByIdAndUpdate(id, update, { new: true }).select(
      "name email teamRole reportsTo",
    );
    if (!updated) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ message: "Team assignment updated", user: updated });
  } catch (error) {
    res.status(500).json({ message: "Failed to update team assignment", error: error.message });
  }
};

