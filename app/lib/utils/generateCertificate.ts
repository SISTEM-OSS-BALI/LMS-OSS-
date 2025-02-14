import { jsPDF } from "jspdf";

const generateCertificate = async (
  username: string,
  noCertificate: string,
  evaluationData: { section_type: string; level: string; comment: string }[],
  templateImagePathFront: string,
  templateImagePathBack: string
) => {
  const doc = new jsPDF("landscape", "px", "a4");
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  if (!context) {
    console.error("Canvas context not supported");
    return;
  }

  /** --------- Halaman Depan Sertifikat --------- **/
  const imgFront = new Image();
  imgFront.src = templateImagePathFront;

  await new Promise((resolve) => {
    imgFront.onload = () => resolve(null);
  });

  canvas.width = imgFront.width;
  canvas.height = imgFront.height;
  context.drawImage(imgFront, 0, 0);

  // Tambahkan Nama dan No Sertifikat
  context.fillStyle = "black";
  context.font = "bold 150px Montserrat";
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText(username, canvas.width / 2, 1300);

  context.font = "italic 100px Montserrat";
  context.fillText(`NO: ${noCertificate}`, canvas.width / 2, 1800);

  // Konversi halaman depan ke gambar dan tambahkan ke PDF
  const frontImage = canvas.toDataURL("image/png");
  doc.addImage(
    frontImage,
    "PNG",
    0,
    0,
    doc.internal.pageSize.width,
    doc.internal.pageSize.height
  );

  /** --------- Halaman Belakang Sertifikat (Evaluation) --------- **/
  doc.addPage(); // Tambahkan halaman baru

  const imgBack = new Image();
  imgBack.src = templateImagePathBack;

  await new Promise((resolve) => {
    imgBack.onload = () => resolve(null);
  });

  // Reset ukuran canvas untuk halaman belakang
  canvas.width = imgBack.width;
  canvas.height = imgBack.height;
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.drawImage(imgBack, 0, 0);

  // Posisi awal untuk evaluasi
  let startY = 1020;
  let commentY = 1000;
  const sectionX = 570;
  const levelX = 1050;
  const commentX = 1350;
  const rowHeight = 250;

  context.fillStyle = "black";
  context.font = "bold 60px Montserrat";
  context.textAlign = "left";

  evaluationData.forEach((evalItem) => {
    const maxWidthComment = 500;
    const trimmedComment =
      evalItem.comment.length > 30
        ? evalItem.comment.slice(0, 30) + "..."
        : evalItem.comment;

    context.font = "bold 60px Montserrat";
    context.fillText(evalItem.section_type, sectionX, startY);
    context.font = "bold 60px Montserrat";
    context.fillText(evalItem.level, levelX, startY);
    context.font = "bold 40px Montserrat";
    context.fillText(trimmedComment, commentX, commentY, maxWidthComment);

    startY += rowHeight;
    commentY += rowHeight;
  });

  // Konversi halaman belakang ke gambar dan tambahkan ke PDF
  const backImage = canvas.toDataURL("image/png");
  doc.addImage(
    backImage,
    "PNG",
    0,
    0,
    doc.internal.pageSize.width,
    doc.internal.pageSize.height
  );

  /** --------- Simpan PDF --------- **/
  doc.save(`Sertifikat-${username}.pdf`);
};

export default generateCertificate;
