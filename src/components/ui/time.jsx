import dayjs from "dayjs";

import { useEffect, useState } from "react";

const Time = () => {
  const [currentTime, setCurrentTime] = useState(
    dayjs().format("ddd MMM D HH:mm")
  );

  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(dayjs().format("ddd MMM D HH:mm"));
    };

    // Calculate milliseconds until the next minute boundary
    const now = dayjs();
    const secondsUntilNextMinute = 60 - now.second();
    const millisecondsUntilNextMinute = secondsUntilNextMinute * 1000;

    let intervalId = null;

    // Set timeout to fire at the next minute boundary
    const timeoutId = setTimeout(() => {
      updateTime();
      // Then set up interval to update every 60 seconds
      intervalId = setInterval(updateTime, 60000);
    }, millisecondsUntilNextMinute);

    return () => {
      clearTimeout(timeoutId);
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, []);
  return <time>{currentTime}</time>;
};

export default Time;
