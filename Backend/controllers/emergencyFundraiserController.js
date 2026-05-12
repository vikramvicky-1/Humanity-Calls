import mongoose from "mongoose";
import EmergencyFundraiser from "../models/EmergencyFundraiser.js";

const frontendBase = () =>
  (process.env.FRONTEND_URL || "http://localhost:5173").replace(/\/$/, "");

const slugify = (s) =>
  String(s || "")
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "fundraiser";

const enrich = (doc) => {
  if (!doc) return null;
  const o = typeof doc.toObject === "function" ? doc.toObject({ virtuals: true }) : { ...doc };
  const slug = o.slug;
  o.shareLink = o.shareLink || `${frontendBase()}/emergency-funding/${slug}`;
  o.pendingAmount = Math.max(0, (Number(o.targetAmount) || 0) - Math.max(0, Number(o.raisedAmount) || 0));
  const t = Number(o.targetAmount) || 0;
  const r = Math.max(0, Number(o.raisedAmount) || 0);
  o.progressPercentage = t > 0 ? Math.min(100, Math.round((r / t) * 1000) / 10) : 0;
  o.goalReached = t > 0 && r >= t;
  return o;
};

const ensureUniqueSlug = async (base) => {
  let slug = base;
  let n = 0;
  while (await EmergencyFundraiser.exists({ slug })) {
    n += 1;
    slug = `${base}-${n}`;
  }
  return slug;
};

const parseBody = (body) => {
  const {
    title,
    slug: slugIn,
    shortDescription,
    fullDescription,
    patientName,
    hospitalName,
    medicalCondition,
    targetAmount,
    raisedAmount,
    photos,
    videoUrl,
    qrCodeImage,
    bankDetails,
    contactDetails,
    shareLink,
    supportersCount,
    isActive,
    isFeatured,
    showPopup,
    bannerImage,
  } = body;

  return {
    title,
    slugIn,
    shortDescription,
    fullDescription,
    patientName,
    hospitalName,
    medicalCondition,
    targetAmount: targetAmount !== undefined ? Number(targetAmount) : undefined,
    raisedAmount: raisedAmount !== undefined ? Number(raisedAmount) : undefined,
    photos: Array.isArray(photos) ? photos : undefined,
    videoUrl,
    qrCodeImage,
    bankDetails,
    contactDetails,
    shareLink,
    supportersCount: supportersCount !== undefined ? Number(supportersCount) : undefined,
    isActive,
    isFeatured,
    showPopup,
    bannerImage,
  };
};

export const uploadEmergencyAsset = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    const kind = req.params.kind || "image";
    const url = req.file.path;
    const publicId = req.file.filename;
    res.status(200).json({
      success: true,
      url,
      imageUrl: kind !== "video" ? url : undefined,
      videoUrl: kind === "video" ? url : undefined,
      publicId,
    });
  } catch (error) {
    res.status(500).json({ message: "Upload failed", error: error.message });
  }
};

export const createEmergencyFundraiser = async (req, res) => {
  try {
    const p = parseBody(req.body);
    if (!p.title || !p.title.trim()) {
      return res.status(400).json({ message: "Title is required" });
    }
    if (p.targetAmount === undefined || Number.isNaN(p.targetAmount) || p.targetAmount < 1) {
      return res.status(400).json({ message: "Valid target amount is required" });
    }

    const baseSlug = slugify(p.slugIn || p.title);
    const slug = await ensureUniqueSlug(baseSlug);

    const raised = Math.max(0, p.raisedAmount ?? 0);
    const supporters = Math.max(0, p.supportersCount ?? 0);

    const isPopup = !!p.showPopup;
    if (isPopup) {
      // Ensure only one popup at a time
      await EmergencyFundraiser.updateMany({}, { showPopup: false });
    }

    const doc = await EmergencyFundraiser.create({
      title: p.title.trim(),
      slug,
      shortDescription: p.shortDescription ?? "",
      fullDescription: p.fullDescription ?? "",
      patientName: p.patientName ?? "",
      hospitalName: p.hospitalName ?? "",
      medicalCondition: p.medicalCondition ?? "",
      targetAmount: p.targetAmount,
      raisedAmount: raised,
      photos: p.photos || [],
      videoUrl: p.videoUrl || "",
      qrCodeImage: p.qrCodeImage || "",
      bankDetails: p.bankDetails || {},
      contactDetails: p.contactDetails || {},
      shareLink: p.shareLink || `${frontendBase()}/emergency-funding/${slug}`,
      supportersCount: supporters,
      isActive: p.isActive !== false,
      isFeatured: !!p.isFeatured,
      showPopup: isPopup,
      bannerImage: p.bannerImage || "",
      createdBy: req.user?._id || null,
    });

    res.status(201).json({ message: "Created", fundraiser: enrich(doc) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const listEmergencyFundraisersAdmin = async (req, res) => {
  try {
    const list = await EmergencyFundraiser.find().sort({ createdAt: -1 }).lean();
    res.json(list.map((d) => enrich(d)));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const listEmergencyFundraisersPublic = async (req, res) => {
  try {
    const { featured } = req.query;
    const filter = { isActive: true };
    if (featured === "true" || featured === "1") {
      filter.isFeatured = true;
    }
    const list = await EmergencyFundraiser.find(filter).sort({ createdAt: -1 }).lean();
    res.json(list.map((d) => enrich(d)));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getPopupEmergencyFundraiser = async (req, res) => {
  try {
    const doc = await EmergencyFundraiser.findOne({
      isActive: true,
      showPopup: true,
    })
      .sort({ updatedAt: -1 })
      .lean();
    if (!doc) {
      return res.json(null);
    }
    res.json(enrich(doc));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getEmergencyFundraiserAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid id" });
    }
    const doc = await EmergencyFundraiser.findById(id);
    if (!doc) return res.status(404).json({ message: "Not found" });
    res.json(enrich(doc));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getEmergencyFundraiserPublicBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const doc = await EmergencyFundraiser.findOne({ slug: String(slug).toLowerCase(), isActive: true }).lean();
    if (!doc) return res.status(404).json({ message: "Fundraiser not found" });
    res.json(enrich(doc));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateEmergencyFundraiser = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid id" });
    }
    const doc = await EmergencyFundraiser.findById(id);
    if (!doc) return res.status(404).json({ message: "Not found" });

    const p = parseBody(req.body);

    if (p.title !== undefined) doc.title = String(p.title).trim();
    if (p.shortDescription !== undefined) doc.shortDescription = p.shortDescription;
    if (p.fullDescription !== undefined) doc.fullDescription = p.fullDescription;
    if (p.patientName !== undefined) doc.patientName = p.patientName;
    if (p.hospitalName !== undefined) doc.hospitalName = p.hospitalName;
    if (p.medicalCondition !== undefined) doc.medicalCondition = p.medicalCondition;
    if (p.targetAmount !== undefined) {
      if (Number.isNaN(p.targetAmount) || p.targetAmount < 1) {
        return res.status(400).json({ message: "Invalid target amount" });
      }
      doc.targetAmount = p.targetAmount;
    }
    if (p.raisedAmount !== undefined) {
      if (Number.isNaN(p.raisedAmount) || p.raisedAmount < 0) {
        return res.status(400).json({ message: "Invalid raised amount" });
      }
      doc.raisedAmount = p.raisedAmount;
    }
    if (p.photos !== undefined) doc.photos = p.photos;
    if (p.videoUrl !== undefined) doc.videoUrl = p.videoUrl;
    if (p.qrCodeImage !== undefined) doc.qrCodeImage = p.qrCodeImage;
    if (p.bankDetails !== undefined) {
      const cur = doc.bankDetails?.toObject?.() || doc.bankDetails || {};
      doc.bankDetails = { ...cur, ...p.bankDetails };
    }
    if (p.contactDetails !== undefined) {
      const curC = doc.contactDetails?.toObject?.() || doc.contactDetails || {};
      doc.contactDetails = { ...curC, ...p.contactDetails };
    }
    if (p.shareLink !== undefined) doc.shareLink = p.shareLink;
    if (p.supportersCount !== undefined) {
      if (Number.isNaN(p.supportersCount) || p.supportersCount < 0) {
        return res.status(400).json({ message: "Invalid supporters count" });
      }
      doc.supportersCount = p.supportersCount;
    }
    if (p.isActive !== undefined) doc.isActive = !!p.isActive;
    if (p.isFeatured !== undefined) doc.isFeatured = !!p.isFeatured;
    if (p.showPopup !== undefined) {
      const isPopup = !!p.showPopup;
      if (isPopup && !doc.showPopup) {
        await EmergencyFundraiser.updateMany({ _id: { $ne: id } }, { showPopup: false });
      }
      doc.showPopup = isPopup;
    }
    if (p.bannerImage !== undefined) doc.bannerImage = p.bannerImage;

    if (p.slugIn && String(p.slugIn).trim()) {
      const newBase = slugify(p.slugIn);
      if (newBase !== doc.slug) {
        doc.slug = await ensureUniqueSlug(newBase);
        // Force update shareLink when slug changes
        doc.shareLink = `${frontendBase()}/emergency-funding/${doc.slug}`;
      }
    }

    doc.shareLink = doc.shareLink || `${frontendBase()}/emergency-funding/${doc.slug}`;

    await doc.save();
    res.json({ message: "Updated", fundraiser: enrich(doc) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteEmergencyFundraiser = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid id" });
    }
    const deleted = await EmergencyFundraiser.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: "Not found" });
    res.json({ message: "Deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const toggleField = (field) => async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid id" });
    }
    const doc = await EmergencyFundraiser.findById(id);
    if (!doc) return res.status(404).json({ message: "Not found" });
    doc[field] = !doc[field];
    await doc.save();
    res.json({ message: "Updated", fundraiser: enrich(doc) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const toggleActive = toggleField("isActive");
export const togglePopup = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid id" });
    }
    const doc = await EmergencyFundraiser.findById(id);
    if (!doc) return res.status(404).json({ message: "Not found" });

    const newVal = !doc.showPopup;
    if (newVal) {
      // Set others to false
      await EmergencyFundraiser.updateMany({ _id: { $ne: id } }, { showPopup: false });
    }
    doc.showPopup = newVal;
    await doc.save();
    res.json({ message: "Updated", fundraiser: enrich(doc) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const toggleFeatured = toggleField("isFeatured");
