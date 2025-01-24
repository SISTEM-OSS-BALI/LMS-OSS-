import jsPDF from "jspdf";

const generateCertificate = async (
  username: string,
  courseName: string,
  completionDate: string,
  templateImagePath: string
) => {
  const doc = new jsPDF("landscape", "px", "a4");
  const canvas = document.createElement("canvas");

  const img = new Image();
  img.src = templateImagePath;

  await new Promise((resolve) => {
    img.onload = () => resolve(null);
  });

  canvas.width = img.width;
  canvas.height = img.height;

  const context = canvas.getContext("2d");
  if (context) {
    context.drawImage(img, 0, 0);

    context.fillStyle = "black";

    context.font = "bold 70px Montserrat";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText(username, canvas.width / 2, 670);
    context.font = "45px Montserrat";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText(courseName, canvas.width / 2, 830);

    context.font = "45px Montserrat";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText(completionDate, canvas.width / 2, 950);
  }

  const dataUrl = canvas.toDataURL("image/png");
  doc.addImage(
    dataUrl,
    "PNG",
    0,
    0,
    doc.internal.pageSize.width,
    doc.internal.pageSize.height
  );

  doc.save(`Sertifikat-${courseName}-${username}.pdf`);
};

export default generateCertificate;
