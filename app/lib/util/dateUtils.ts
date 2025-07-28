export const formatJoinDate = (date: Date): string => {
  try {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
    });
  } catch {
    return "";
  }
};
