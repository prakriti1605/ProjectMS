

export const getUserRole = (org, userId) => {
  const member = org.members.find(
    (m) => m.user.toString() === userId.toString()
  );

  return member ? member.role : null;
};