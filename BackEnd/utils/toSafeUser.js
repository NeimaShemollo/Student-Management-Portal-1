export default function toSafeUser(user) {
  if (!user) return null;

  const obj = typeof user.toObject === "function" ? user.toObject() : { ...user };

  delete obj.password;
  delete obj.passwordResetToken;
  delete obj.passwordResetExpires;
  delete obj.__v;

  return obj;
}
