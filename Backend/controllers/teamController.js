import User from "../models/User.js";
import Volunteer from "../models/Volunteer.js";

const pickRole = (user, volunteer) => {
  if (user?.teamRole) return user.teamRole;
  if (Array.isArray(volunteer?.rolePreference) && volunteer.rolePreference.length > 0) {
    return volunteer.rolePreference[0];
  }
  if (volunteer?.interest) return volunteer.interest;
  return "Member";
};

const isLeaderRole = (role) => /leader|coordinator|advisor|lead/i.test(String(role || ""));

const toNode = (user, volunteer) => ({
  id: String(user._id),
  userId: String(user._id),
  volunteerId: volunteer?._id ? String(volunteer._id) : null,
  name: volunteer?.fullName || user.name,
  email: volunteer?.email || user.email,
  teamRole: pickRole(user, volunteer),
  reportsTo: user.reportsTo ? String(user.reportsTo) : null,
  profilePicture: volunteer?.profilePicture || "",
  volunteerStatus: volunteer?.status || null,
  joiningDate: volunteer?.joiningDate || null,
  createdAt: volunteer?.createdAt || user.createdAt || null,
  children: [],
});

export const getTeamTree = async (_req, res) => {
  try {
    // 1) Pull volunteers first so existing registered volunteer profiles (name/role/photo)
    // are always represented even if older user docs have missing role field.
    const volunteers = await Volunteer.find({
      status: { $in: ["active", "temporary", "inactive", "pending"] },
    })
      .populate("user", "name email teamRole reportsTo role")
      .select("user fullName email profilePicture rolePreference interest status")
      .lean();

    const volunteerUsers = volunteers
      .map((v) => v.user)
      .filter((u) => u && u._id);
    const volunteerUserIds = volunteerUsers.map((u) => u._id);
    const volunteerUserIdSet = new Set(volunteerUsers.map((u) => String(u._id)));

    const map = new Map();

    volunteers.forEach((v) => {
      if (!v.user || !v.user._id) return;
      map.set(String(v.user._id), toNode(v.user, v));
    });

    // 2) Add non-volunteer non-admin members too (if any)
    const extraUsers = await User.find({
      $and: [
        { _id: { $nin: volunteerUserIds } },
        {
          $or: [
            { role: { $exists: false } },
            { role: { $ne: "admin" } },
          ],
        },
      ],
    })
      .select("name email teamRole reportsTo role createdAt")
      .lean();

    extraUsers.forEach((u) => {
      map.set(String(u._id), toNode(u, null));
    });

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

    // If no explicit reporting lines exist, auto-group by existing leader roles.
    if (roots.length > 0 && roots.every((r) => !r.children.length)) {
      const leaderRoots = roots.filter((r) => isLeaderRole(r.teamRole));
      if (leaderRoots.length > 0) {
        const members = roots.filter((r) => !isLeaderRole(r.teamRole));
        members.forEach((m, idx) => {
          leaderRoots[idx % leaderRoots.length].children.push(m);
        });
        roots.length = 0;
        roots.push(...leaderRoots);
      }
    }

    const sortTree = (n) => {
      n.children.sort((a, b) => {
        const dateA = a.joiningDate ? new Date(a.joiningDate) : new Date(a.createdAt || 0);
        const dateB = b.joiningDate ? new Date(b.joiningDate) : new Date(b.createdAt || 0);
        if (dateA - dateB !== 0) return dateA - dateB;
        return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
      });
      n.children.forEach(sortTree);
    };

    roots.sort((a, b) => {
      const dateA = a.joiningDate ? new Date(a.joiningDate) : new Date(a.createdAt || 0);
      const dateB = b.joiningDate ? new Date(b.joiningDate) : new Date(b.createdAt || 0);
      if (dateA - dateB !== 0) return dateA - dateB;
      return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
    });
    roots.forEach(sortTree);

    res.status(200).json({
      roots,
      orphans,
      total: map.size,
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

