import { useState, useEffect } from "react";

export const useRandomBgCourse = () => {
  const [storedImages, setStoredImages] = useState<string[] | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedImages = localStorage.getItem("randomBgImages");

      if (savedImages) {
        setStoredImages(JSON.parse(savedImages));
      } else {
        const bgCourses = [
          "/assets/images/backgroudCourse/bg1.jpg",
          "/assets/images/backgroudCourse/bg2.jpg",
          "/assets/images/backgroudCourse/bg3.jpg",
          "/assets/images/backgroudCourse/bg4.jpg",
          "/assets/images/backgroudCourse/bg5.jpg",
        ];

        const randomImages = Array.from({ length: 10 }, () => {
          const randomIndex = Math.floor(Math.random() * bgCourses.length);
          return bgCourses[randomIndex];
        });

        localStorage.setItem("randomBgImages", JSON.stringify(randomImages));
        setStoredImages(randomImages);
      }
    }
  }, []);

  return storedImages;
};
