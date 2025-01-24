const randomBgCourse = () => {
  const bgCourses = [
    "/assets/images/backgroudCourse/bg1.jpg",
    "/assets/images/backgroudCourse/bg2.jpg",
    "/assets/images/backgroudCourse/bg3.jpg",
    "/assets/images/backgroudCourse/bg4.jpg",
    "/assets/images/backgroudCourse/bg5.jpg",
  ];

  const storedImages = localStorage.getItem("randomBgImages");
  if (storedImages) {
    return JSON.parse(storedImages);
  }

  const randomImages = new Array(10).fill("").map(() => {
    const randomIndex = Math.floor(Math.random() * bgCourses.length);
    return bgCourses[randomIndex];
  });

  localStorage.setItem("randomBgImages", JSON.stringify(randomImages));
  return randomImages;
};

export default randomBgCourse;
