import dayjs from "dayjs";

import { useEffect, useState } from "react";

const Time = () => {
  const [currentTime, setCurrentTime] = useState(
    dayjs().format("ddd MMM D HH:mm")
  );

  useEffect(() => {
    const interval = setInterval(() => {
      // update every 60 seconds
      setCurrentTime(dayjs().format("ddd MMM D HH:mm"));
    }, 60000);
    return () => clearInterval(interval);
  }, []);
  return <time>{currentTime}</time>;
};

export default Time;
