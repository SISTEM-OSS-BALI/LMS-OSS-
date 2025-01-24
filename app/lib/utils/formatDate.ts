export const formatDate = (
  enrolledAt: string | Date,
  locale: string = "id-ID"
): string => {
  try {
    const date =
      typeof enrolledAt === "string" ? new Date(enrolledAt) : enrolledAt;
    if (isNaN(date.getTime())) {
      throw new Error("Invalid date");
    }
    return new Intl.DateTimeFormat(locale, {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Invalid date";
  }
};
