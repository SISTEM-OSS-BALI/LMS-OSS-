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

  if (context) {
    context.drawImage(imgBack, 0, 0);

    let startY = 1020;
    const sectionX = 570;
    const levelX = 1050;
    const commentX = 1350;
    const maxWidthComment = 1300;
    const lineHeight = 50;
    const rowHeight = 250;

    context.fillStyle = "black";
    context.font = "bold 60px Montserrat";
    context.textAlign = "left";

    // Fungsi untuk membungkus teks dalam beberapa baris secara optimal
    const wrapText = (
      ctx: CanvasRenderingContext2D,
      text: string,
      x: number,
      y: number,
      maxWidth: number,
      lineHeight: number
    ): number => {
      const words = text.split(" ");
      let line = "";
      let yOffset = 0;

      words.forEach((word, index) => {
        const testLine = line + (line ? " " : "") + word;
        const testWidth = ctx.measureText(testLine).width;

        if (testWidth > maxWidth && line !== "") {
          ctx.fillText(line, x, y + yOffset);
          line = word;
          yOffset += lineHeight;
        } else {
          line = testLine;
        }

        // Gambar kata terakhir
        if (index === words.length - 1) {
          ctx.fillText(line, x, y + yOffset);
        }
      });

      return yOffset; // Return total height yang digunakan
    };

    evaluationData.forEach(
      (evalItem: { section_type: string; level: string; comment: string }) => {
        let commentStartY = startY;

        // Gambar teks untuk Section dan Level
        context.font = "bold 60px Montserrat";
        context.fillText(evalItem.section_type, sectionX, startY);
        context.fillText(evalItem.level, levelX, startY);

        // Gambar teks untuk Comment dengan wrapping
        context.font = "bold 40px Montserrat";
        const commentHeightUsed = wrapText(
          context,
          evalItem.comment,
          commentX,
          commentStartY,
          maxWidthComment,
          lineHeight
        );

        // Geser ke bawah untuk item berikutnya
        startY += Math.max(rowHeight, commentHeightUsed + lineHeight);
      }
    );

  }
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
