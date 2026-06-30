export const requirePermission = (permission) => {
  return (req, res, next) => {

    console.log("Required Permission:", permission);
    console.log("User Permissions:", req.member.permissions);

    const allowed = req.member.permissions.includes(permission);

    console.log("Allowed:", allowed);

    if (!allowed) {
      return res.status(403).json({
        message: "Permission denied"
      });
    }
    console.log("Permission granted");
    next();
  };
};