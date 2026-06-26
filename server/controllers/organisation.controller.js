import Organisation from "../models/organisation.model.js";

export const createOrg = async (req, res) => {
  const { name, description } = req.body;

  const org = await Organisation.create({
    name,
    description,
    owner: req.user._id,
    members: [
      {
        user: req.user._id,
        role: "owner",
      },
    ],
  });

  res.status(201).json(org);
};
export const getMyOrgs = async (req, res) => {
  const orgs = await Organisation.find({
    "members.user": req.user._id,
  });

  res.json(orgs);
};

export const getOrgById = async (req, res) => {
  const org = await Organisation.findById(req.params.id);

  if (!org) {
    return res.status(404).json({ message: "Organisation not found" });
  }

  res.json(org);
};

export const addMember = async (req, res) => {
  const { id } = req.params;
  const { userId, role } = req.body;

  const org = await Organisation.findById(id);

  if (!org) {
    return res.status(404).json({ message: "Organisation not found" });
  }

  org.members.push({
    user: userId,
    role: role || "member",
  });

  await org.save();

  res.json(org);
};