export const formatAssignmentType = (type: string): string => {
  const typeMapping: { [key: string]: string } = {
    MULTIPLE_CHOICE: "Pilihan Ganda",
    ESSAY: "Esai",
    SENTENCE_MATCHING: "Pencocokan Kalimat",
  };

  return typeMapping[type] || "Tipe Tidak Diketahui";
};
