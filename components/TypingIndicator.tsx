import { useEffect, useState } from "react";

export default function TypingIndicator() {
  const [dots, setDots] = useState(".");

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => {
        if (prev === ".") return "..";
        if (prev === "..") return "...";
        return ".";
      });
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="text-gray-500 italic">
      Typing{dots}
    </div>
  );
}