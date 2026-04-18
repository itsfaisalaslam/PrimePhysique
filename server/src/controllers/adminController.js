import AuditLog from "../models/AuditLog.js";
import Attendance from "../models/Attendance.js";
import DietPlan from "../models/DietPlan.js";
import Notification from "../models/Notification.js";
import Payment from "../models/Payment.js";
import Progress from "../models/Progress.js";
import User from "../models/User.js";
import WorkoutPlan from "../models/WorkoutPlan.js";
import asyncHandler from "../middleware/asyncHandler.js";

const getStartOfDay = (value = new Date()) => {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date;
};

const getEndOfDay = (value = new Date()) => {
  const date = new Date(value);
  date.setHours(23, 59, 59, 999);
  return date;
};

const monthLabel = (dateValue) =>
  new Date(dateValue).toLocaleString("en-US", {
    month: "short",
    year: "numeric"
  });

const createNotificationIfMissingToday = async ({ userId, title, message, type }) => {
  const todayStart = getStartOfDay();
  const todayEnd = getEndOfDay();

  const existingNotification = await Notification.findOne({
    userId,
    title,
    type,
    createdAt: { $gte: todayStart, $lte: todayEnd }
  });

  if (existingNotification) {
    return null;
  }

  return Notification.create({ userId, title, message, type });
};

// Fetch every user in the database for admin review.
// The password field is excluded for safety.
export const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find({ isDeleted: { $ne: true } })
    .select("-password")
    .populate("assignedTrainer", "name email role")
    .sort({ createdAt: -1 });
  res.json({ users });
});

// Backward-compatible export for any existing code that still imports getUsers.
export const getUsers = getAllUsers;

export const getAuditLogs = asyncHandler(async (req, res) => {
  const auditLogs = await AuditLog.find()
    .populate("performedBy", "name email isAdmin")
    .sort({ createdAt: -1 });

  res.json({ auditLogs });
});

// Return top-level admin metrics and the most recent users for the dashboard.
export const getAdminDashboardStats = asyncHandler(async (req, res) => {
  const [totalUsers, totalWorkouts, totalDiets, totalProgressLogs, recentUsers] = await Promise.all([
    User.countDocuments({ isDeleted: { $ne: true } }),
    WorkoutPlan.countDocuments(),
    DietPlan.countDocuments(),
    Progress.countDocuments(),
    User.find({ isDeleted: { $ne: true } }).select("-password").sort({ createdAt: -1 }).limit(5)
  ]);

  res.json({
    stats: {
      totalUsers,
      totalWorkouts,
      totalDiets,
      totalProgressLogs
    },
    recentUsers
  });
});

export const getAnalyticsOverview = asyncHandler(async (req, res) => {
  const todayStart = getStartOfDay();
  const todayEnd = getEndOfDay();
  const nextSevenDays = getStartOfDay();
  nextSevenDays.setDate(nextSevenDays.getDate() + 7);

  const currentMonthStart = new Date();
  currentMonthStart.setDate(1);
  currentMonthStart.setHours(0, 0, 0, 0);

  const [totalUsers, totalTrainers, totalAdmins] = await Promise.all([
    User.countDocuments({
      isDeleted: { $ne: true },
      role: "user",
      isAdmin: { $ne: true }
    }),
    User.countDocuments({
      isDeleted: { $ne: true },
      role: "trainer"
    }),
    User.countDocuments({
      isDeleted: { $ne: true },
      $or: [{ isAdmin: true }, { role: "admin" }]
    })
  ]);

  const [activeMemberships, expiredMemberships, expiringSoonMemberships] = await Promise.all([
    User.countDocuments({
      isDeleted: { $ne: true },
      membershipStatus: "active",
      membershipPlan: { $ne: "None" },
      membershipEndDate: { $gte: todayStart }
    }),
    User.countDocuments({
      isDeleted: { $ne: true },
      membershipPlan: { $ne: "None" },
      $or: [
        { membershipStatus: "expired" },
        { membershipEndDate: { $lt: todayStart } }
      ]
    }),
    User.countDocuments({
      isDeleted: { $ne: true },
      membershipStatus: "active",
      membershipPlan: { $ne: "None" },
      membershipEndDate: {
        $gte: todayStart,
        $lte: nextSevenDays
      }
    })
  ]);

  const paymentSummary = await Payment.aggregate([
    {
      $group: {
        _id: null,
        totalRevenueCollected: { $sum: "$amountPaid" },
        totalPendingAmount: { $sum: "$pendingAmount" },
        paidCount: {
          $sum: {
            $cond: [{ $eq: ["$paymentStatus", "paid"] }, 1, 0]
          }
        },
        unpaidCount: {
          $sum: {
            $cond: [{ $eq: ["$paymentStatus", "unpaid"] }, 1, 0]
          }
        },
        partialCount: {
          $sum: {
            $cond: [{ $eq: ["$paymentStatus", "partial"] }, 1, 0]
          }
        }
      }
    }
  ]);

  const paymentStats = paymentSummary[0] || {
    totalRevenueCollected: 0,
    totalPendingAmount: 0,
    paidCount: 0,
    unpaidCount: 0,
    partialCount: 0
  };

  const [totalAttendanceRecords, todayAttendanceCount, currentMonthAttendanceCount] = await Promise.all([
    Attendance.countDocuments(),
    Attendance.countDocuments({
      date: { $gte: todayStart, $lte: todayEnd }
    }),
    Attendance.countDocuments({
      date: { $gte: currentMonthStart }
    })
  ]);

  const monthlyRevenueRaw = await Payment.aggregate([
    {
      $group: {
        _id: {
          year: { $year: "$paymentDate" },
          month: { $month: "$paymentDate" }
        },
        totalRevenue: { $sum: "$amountPaid" }
      }
    },
    {
      $sort: {
        "_id.year": 1,
        "_id.month": 1
      }
    }
  ]);

  const monthlyRevenue = monthlyRevenueRaw.map((entry) => ({
    label: monthLabel(new Date(entry._id.year, entry._id.month - 1, 1)),
    revenue: entry.totalRevenue
  }));

  const membershipPlanRaw = await User.aggregate([
    {
      $match: {
        isDeleted: { $ne: true },
        membershipPlan: { $in: ["Basic", "Standard", "Premium"] }
      }
    },
    {
      $group: {
        _id: "$membershipPlan",
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  const membershipPlanBreakdown = ["Basic", "Standard", "Premium"].map((plan) => ({
    name: plan,
    count: membershipPlanRaw.find((entry) => entry._id === plan)?.count || 0
  }));

  const trainerClientRaw = await User.aggregate([
    {
      $match: {
        role: "trainer",
        isDeleted: { $ne: true }
      }
    },
    {
      $lookup: {
        from: "users",
        let: { trainerId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$assignedTrainer", "$$trainerId"] },
              isDeleted: { $ne: true }
            }
          }
        ],
        as: "clients"
      }
    },
    {
      $project: {
        _id: 1,
        name: 1,
        clientCount: { $size: "$clients" }
      }
    },
    { $sort: { name: 1 } }
  ]);

  const trainerWiseClientCounts = trainerClientRaw.map((trainer) => ({
    trainerId: trainer._id,
    trainerName: trainer.name,
    clientCount: trainer.clientCount
  }));

  res.json({
    summary: {
      totalUsers,
      totalTrainers,
      totalAdmins,
      activeMemberships,
      expiredMemberships,
      expiringSoonMemberships,
      totalRevenueCollected: paymentStats.totalRevenueCollected,
      totalPendingAmount: paymentStats.totalPendingAmount,
      paidCount: paymentStats.paidCount,
      unpaidCount: paymentStats.unpaidCount,
      partialCount: paymentStats.partialCount,
      totalAttendanceRecords,
      todayAttendanceCount,
      currentMonthAttendanceCount,
      trainerWiseClientCounts
    },
    monthlyRevenue,
    membershipPlanBreakdown,
    trainerClientBreakdown: trainerWiseClientCounts
  });
});

export const getMembershipOverview = asyncHandler(async (req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const nextSevenDays = new Date(today);
  nextSevenDays.setDate(nextSevenDays.getDate() + 7);

  const baseFilter = {
    isDeleted: { $ne: true },
    membershipPlan: { $ne: "None" },
    membershipEndDate: { $ne: null }
  };

  const activeFilter = {
    ...baseFilter,
    membershipStatus: "active",
    membershipEndDate: { $gte: today }
  };

  const expiredFilter = {
    ...baseFilter,
    $or: [
      { membershipStatus: "expired" },
      { membershipEndDate: { $lt: today } }
    ]
  };

  const expiringSoonFilter = {
    ...baseFilter,
    membershipStatus: "active",
    membershipEndDate: {
      $gte: today,
      $lte: nextSevenDays
    }
  };

  const [activeMembers, expiredMembers, expiringSoon, expiredUsers, expiringSoonUsers] = await Promise.all([
    User.countDocuments(activeFilter),
    User.countDocuments(expiredFilter),
    User.countDocuments(expiringSoonFilter),
    User.find(expiredFilter).select("-password").sort({ membershipEndDate: 1 }),
    User.find(expiringSoonFilter).select("-password").sort({ membershipEndDate: 1 })
  ]);

  res.json({
    summary: {
      activeMembers,
      expiredMembers,
      expiringSoon
    },
    expiredUsers,
    expiringSoonUsers
  });
});

export const updateExpiryStatus = asyncHandler(async (req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const usersToExpire = await User.find({
    isDeleted: { $ne: true },
    membershipPlan: { $ne: "None" },
    membershipStatus: "active",
    membershipEndDate: { $lt: today }
  });

  await Promise.all(
    usersToExpire.map(async (user) => {
      user.membershipStatus = "expired";
      await user.save();
    })
  );

  res.json({
    message: "Membership expiry statuses updated successfully.",
    updatedCount: usersToExpire.length
  });
});

export const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findOne({ _id: req.params.id, isDeleted: { $ne: true } });

  if (!user) {
    res.status(404);
    throw new Error("User not found.");
  }

  if (String(user._id) === String(req.user?._id)) {
    res.status(400);
    throw new Error("You cannot delete your own admin account.");
  }

  if (user.isAdmin || user.role === "admin") {
    res.status(400);
    throw new Error("Admin users cannot be deleted from this panel.");
  }

  user.isDeleted = true;
  user.deletedAt = new Date();
  user.deletedBy = req.user?._id || null;
  await user.save();

  await AuditLog.create({
    action: "DELETE_USER",
    targetType: "User",
    targetId: String(user._id),
    performedBy: req.user?._id || null,
    details: "Soft deleted user account"
  });

  res.json({ message: "User deleted successfully." });
});

export const updateUserMembership = asyncHandler(async (req, res) => {
  const {
    membershipPlan,
    membershipFee,
    membershipStartDate,
    membershipEndDate,
    membershipStatus
  } = req.body;

  const user = await User.findOne({ _id: req.params.id, isDeleted: { $ne: true } }).select("-password");

  if (!user) {
    res.status(404);
    throw new Error("User not found.");
  }

  user.membershipPlan = membershipPlan;
  user.membershipStartDate = membershipStartDate || null;
  user.membershipEndDate = membershipEndDate || null;

  if (membershipPlan === "None") {
    user.membershipFee = 0;
    user.membershipStatus = "none";
  } else {
    user.membershipFee = Number(membershipFee) || 0;
    user.membershipStatus = membershipStatus;
  }

  await user.save();

  res.json({
    message: "Membership updated successfully.",
    user
  });
});

export const createPaymentForUser = asyncHandler(async (req, res) => {
  const { membershipPlan, totalFee, amountPaid = 0, paymentMethod = "cash", notes = "" } = req.body;

  const user = await User.findOne({ _id: req.params.id, isDeleted: { $ne: true } }).select("-password");

  if (!user) {
    res.status(404);
    throw new Error("User not found.");
  }

  const numericTotalFee = Number(totalFee) || 0;
  const numericAmountPaid = Number(amountPaid) || 0;
  const pendingAmount = Math.max(numericTotalFee - numericAmountPaid, 0);

  let paymentStatus = "unpaid";

  if (numericAmountPaid === 0) {
    paymentStatus = "unpaid";
  } else if (pendingAmount <= 0) {
    paymentStatus = "paid";
  } else {
    paymentStatus = "partial";
  }

  const payment = await Payment.create({
    userId: user._id,
    membershipPlan: membershipPlan || user.membershipPlan || "None",
    totalFee: numericTotalFee,
    amountPaid: numericAmountPaid,
    pendingAmount,
    paymentStatus,
    paymentMethod,
    notes
  });

  res.status(201).json({
    message: "Payment recorded successfully.",
    payment
  });
});

export const getUserPaymentsAdmin = asyncHandler(async (req, res) => {
  const user = await User.findOne({ _id: req.params.id, isDeleted: { $ne: true } }).select("_id");

  if (!user) {
    res.status(404);
    throw new Error("User not found.");
  }

  const payments = await Payment.find({ userId: user._id }).sort({ paymentDate: -1, createdAt: -1 });

  res.json({ payments });
});

export const markAttendance = asyncHandler(async (req, res) => {
  const { date, status = "present", notes = "" } = req.body;

  const user = await User.findOne({ _id: req.params.id, isDeleted: { $ne: true } }).select("_id");

  if (!user) {
    res.status(404);
    throw new Error("User not found.");
  }

  const attendanceDate = getStartOfDay(date || new Date());
  const existingAttendance = await Attendance.findOne({
    userId: user._id,
    date: attendanceDate
  });

  if (existingAttendance) {
    res.status(400);
    const isToday = attendanceDate.getTime() === getStartOfDay().getTime();
    throw new Error(isToday ? "Already marked for today." : "Already marked for this date.");
  }

  const attendance = await Attendance.create({
    userId: user._id,
    date: attendanceDate,
    status,
    notes
  });

  res.status(201).json({
    message: "Attendance marked successfully.",
    attendance
  });
});

export const getUserAttendanceAdmin = asyncHandler(async (req, res) => {
  const user = await User.findOne({ _id: req.params.id, isDeleted: { $ne: true } }).select("_id");

  if (!user) {
    res.status(404);
    throw new Error("User not found.");
  }

  const attendance = await Attendance.find({ userId: user._id }).sort({ date: -1, checkInTime: -1 });

  res.json({ attendance });
});

export const assignTrainerToUser = asyncHandler(async (req, res) => {
  const { trainerId } = req.body;

  const user = await User.findOne({ _id: req.params.id, isDeleted: { $ne: true } });

  if (!user) {
    res.status(404);
    throw new Error("User not found.");
  }

  const trainer = await User.findOne({
    _id: trainerId,
    role: "trainer",
    isDeleted: { $ne: true }
  }).select("-password");

  if (!trainer) {
    res.status(400);
    throw new Error("Selected trainer was not found.");
  }

  user.assignedTrainer = trainer._id;
  await user.save();

  const updatedUser = await User.findById(user._id)
    .select("-password")
    .populate("assignedTrainer", "name email role");

  res.json({
    message: "Trainer assigned successfully.",
    user: updatedUser
  });
});

export const getAllTrainers = asyncHandler(async (req, res) => {
  const trainers = await User.find({
    role: "trainer",
    isDeleted: { $ne: true }
  })
    .select("name email role")
    .sort({ name: 1 });

  res.json({ trainers });
});

export const getTrainerClients = asyncHandler(async (req, res) => {
  const trainer = await User.findOne({
    _id: req.params.id,
    role: "trainer",
    isDeleted: { $ne: true }
  }).select("name email role");

  if (!trainer) {
    res.status(404);
    throw new Error("Trainer not found.");
  }

  const clients = await User.find({
    assignedTrainer: trainer._id,
    isDeleted: { $ne: true }
  })
    .select("-password")
    .sort({ name: 1 });

  res.json({ trainer, clients });
});

export const sendNotificationToUser = asyncHandler(async (req, res) => {
  const { title, message, type = "general" } = req.body;

  if (!title || !message) {
    res.status(400);
    throw new Error("Title and message are required.");
  }

  const user = await User.findOne({ _id: req.params.id, isDeleted: { $ne: true } }).select("_id");

  if (!user) {
    res.status(404);
    throw new Error("User not found.");
  }

  const notification = await Notification.create({
    userId: user._id,
    title,
    message,
    type
  });

  res.status(201).json({
    message: "Notification sent successfully.",
    notification
  });
});

export const broadcastNotification = asyncHandler(async (req, res) => {
  const { title, message, type = "general" } = req.body;

  if (!title || !message) {
    res.status(400);
    throw new Error("Title and message are required.");
  }

  const users = await User.find({
    isDeleted: { $ne: true },
    isAdmin: { $ne: true },
    role: { $ne: "admin" }
  }).select("_id");
  const notifications = await Notification.insertMany(
    users.map((user) => ({
      userId: user._id,
      title,
      message,
      type
    }))
  );

  res.status(201).json({
    message: "Broadcast notification sent successfully.",
    count: notifications.length
  });
});

export const autoGenerateNotifications = asyncHandler(async (req, res) => {
  const today = getStartOfDay();
  const threeDaysLater = getStartOfDay();
  threeDaysLater.setDate(threeDaysLater.getDate() + 3);

  const users = await User.find({
    isDeleted: { $ne: true },
    isAdmin: { $ne: true },
    role: { $ne: "admin" }
  }).select("name membershipEndDate membershipPlan");

  let createdCount = 0;

  await Promise.all(
    users.map(async (user) => {
      if (user.membershipEndDate) {
        const endDate = getStartOfDay(user.membershipEndDate);

        if (endDate < today) {
          const created = await createNotificationIfMissingToday({
            userId: user._id,
            title: "Membership Expired",
            message: "Your membership has expired. Please renew it to continue your PrimePhysique plan.",
            type: "expiry"
          });
          createdCount += created ? 1 : 0;
        } else if (endDate >= today && endDate <= threeDaysLater) {
          const created = await createNotificationIfMissingToday({
            userId: user._id,
            title: "Membership Expiring Soon",
            message: "Your membership will expire within 3 days. Renew soon to avoid interruption.",
            type: "expiry"
          });
          createdCount += created ? 1 : 0;
        }
      }

      const latestPayment = await Payment.findOne({ userId: user._id }).sort({ paymentDate: -1, createdAt: -1 });

      if (latestPayment && ["unpaid", "partial"].includes(latestPayment.paymentStatus)) {
        const created = await createNotificationIfMissingToday({
          userId: user._id,
          title: "Payment Reminder",
          message: `Your latest payment status is ${latestPayment.paymentStatus}. Pending amount: ${latestPayment.pendingAmount ?? 0}.`,
          type: "payment"
        });
        createdCount += created ? 1 : 0;
      }
    })
  );

  res.status(201).json({
    message: "Auto notifications generated successfully.",
    createdCount
  });
});

export const getAttendanceOverview = asyncHandler(async (req, res) => {
  const todayStart = getStartOfDay();
  const todayEnd = getEndOfDay();

  const [totalPresent, totalAbsent, todayAttendance, latestAttendance] = await Promise.all([
    Attendance.countDocuments({ status: "present" }),
    Attendance.countDocuments({ status: "absent" }),
    Attendance.countDocuments({ date: { $gte: todayStart, $lte: todayEnd } }),
    Attendance.find()
      .populate("userId", "name email isDeleted")
      .sort({ date: -1, checkInTime: -1 })
      .limit(10)
  ]);

  res.json({
    summary: {
      totalPresent,
      totalAbsent,
      todayAttendance
    },
    latestAttendance
  });
});

export const getAdminWorkouts = asyncHandler(async (req, res) => {
  const workoutPlans = await WorkoutPlan.find().sort({ createdAt: -1 });
  res.json({ workoutPlans });
});

export const createWorkoutPlan = asyncHandler(async (req, res) => {
  const workoutPlan = await WorkoutPlan.create(req.body);
  res.status(201).json({ workoutPlan });
});

export const updateWorkoutPlan = asyncHandler(async (req, res) => {
  const workoutPlan = await WorkoutPlan.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!workoutPlan) {
    res.status(404);
    throw new Error("Workout plan not found.");
  }

  res.json({ workoutPlan });
});

export const deleteWorkoutPlan = asyncHandler(async (req, res) => {
  const workoutPlan = await WorkoutPlan.findByIdAndDelete(req.params.id);

  if (!workoutPlan) {
    res.status(404);
    throw new Error("Workout plan not found.");
  }

  await User.updateMany({}, { $pull: { assignedWorkoutPlans: workoutPlan._id } });
  res.json({ message: "Workout plan deleted." });
});

export const getAdminDiets = asyncHandler(async (req, res) => {
  const dietPlans = await DietPlan.find().sort({ createdAt: -1 });
  res.json({ dietPlans });
});

export const createDietPlan = asyncHandler(async (req, res) => {
  const dietPlan = await DietPlan.create(req.body);
  res.status(201).json({ dietPlan });
});

export const updateDietPlan = asyncHandler(async (req, res) => {
  const dietPlan = await DietPlan.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!dietPlan) {
    res.status(404);
    throw new Error("Diet plan not found.");
  }

  res.json({ dietPlan });
});

export const deleteDietPlan = asyncHandler(async (req, res) => {
  const dietPlan = await DietPlan.findByIdAndDelete(req.params.id);

  if (!dietPlan) {
    res.status(404);
    throw new Error("Diet plan not found.");
  }

  await User.updateMany({}, { $pull: { assignedDietPlans: dietPlan._id } });
  res.json({ message: "Diet plan deleted." });
});
