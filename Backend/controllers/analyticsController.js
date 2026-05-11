import Volunteer from "../models/Volunteer.js";
import User from "../models/User.js";
import Donation from "../models/Donation.js";
import ReimbursementRequest from "../models/ReimbursementRequest.js";
import moment from "moment";

export const getDashboardStats = async (req, res) => {
  try {
    const { range } = req.query; // '7d', '30d', 'all'
    let startDate;

    if (range === "7d") {
      startDate = moment().subtract(7, "days").startOf("day").toDate();
    } else if (range === "30d") {
      startDate = moment().subtract(30, "days").startOf("day").toDate();
    } else {
      startDate = new Date(0); // Beginning of time
    }

    const query = { createdAt: { $gte: startDate } };

    const [volunteersCount, usersCount, donations, reimbursements] = await Promise.all([
      Volunteer.countDocuments({ ...query, status: { $in: ["active", "temporary", "inactive"] } }),
      User.countDocuments(query),
      Donation.find({ ...query, status: "approved" }),
      ReimbursementRequest.find({ ...query, status: "paid" }),
    ]);

    const totalDonations = donations.reduce((sum, d) => sum + d.amount, 0);
    const totalReimbursed = reimbursements.reduce((sum, r) => sum + r.amount, 0);

    res.status(200).json({
      volunteersCount,
      usersCount,
      totalDonations,
      totalReimbursed,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getGraphData = async (req, res) => {
  try {
    const { metric, range } = req.query; // metric: 'volunteers', 'users', 'donations', 'reimbursements'
    let model;
    let sumField = null;
    let statusFilter = {};

    switch (metric) {
      case "volunteers":
        model = Volunteer;
        statusFilter = { status: { $in: ["active", "temporary", "inactive"] } };
        break;
      case "users":
        model = User;
        break;
      case "donations":
        model = Donation;
        sumField = "amount";
        statusFilter = { status: "approved" };
        break;
      case "reimbursements":
        model = ReimbursementRequest;
        sumField = "amount";
        statusFilter = { status: "paid" };
        break;
      default:
        return res.status(400).json({ message: "Invalid metric" });
    }

    let startDate;
    if (range === "7d") {
      startDate = moment().subtract(7, "days").startOf("day");
    } else if (range === "30d") {
      startDate = moment().subtract(30, "days").startOf("day");
    } else {
      // For 'all', find the earliest record or default to 30 days if none
      const earliest = await model.findOne(statusFilter).sort({ createdAt: 1 });
      startDate = earliest ? moment(earliest.createdAt).startOf("day") : moment().subtract(30, "days").startOf("day");
    }
    
    const endDate = moment().endOf("day");

    const data = await model.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate.toDate(), $lte: endDate.toDate() },
          ...statusFilter,
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          count: { $sum: sumField ? `$${sumField}` : 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Fill missing dates
    const graphData = [];
    let current = moment(startDate);
    while (current.isSameOrBefore(endDate)) {
      const dateStr = current.format("YYYY-MM-DD");
      const found = data.find((d) => d._id === dateStr);
      graphData.push({
        date: dateStr,
        value: found ? found.count : 0,
      });
      current.add(1, "day");
    }

    res.status(200).json(graphData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
