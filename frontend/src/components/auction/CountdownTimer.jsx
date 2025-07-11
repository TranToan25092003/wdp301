import React, { useEffect, useState } from "react";

const CountdownTimer = ({ endTime, startTime }) => {
  const calculateTimeLeft = () => {
    const now = new Date();
    const start = new Date(startTime);
    const end = new Date(endTime);

    // If start time is in the future, count down to start time
    if (now < start) {
      const difference = start - now;
      if (difference > 0) {
        return {
          isStarted: false,
          timeLeft: {
            days: Math.floor(difference / (1000 * 60 * 60 * 24)),
            hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
            minutes: Math.floor((difference / 1000 / 60) % 60),
            seconds: Math.floor((difference / 1000) % 60),
          },
        };
      }
    }

    // If started but not ended, count down to end time
    if (now >= start && now < end) {
      const difference = end - now;
      if (difference > 0) {
        return {
          isStarted: true,
          timeLeft: {
            days: Math.floor(difference / (1000 * 60 * 60 * 24)),
            hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
            minutes: Math.floor((difference / 1000 / 60) % 60),
            seconds: Math.floor((difference / 1000) % 60),
          },
        };
      }
    }

    // If already ended
    return { isStarted: true, timeLeft: {} };
  };

  const [timeInfo, setTimeInfo] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeInfo(calculateTimeLeft());
    }, 1000);
    return () => clearInterval(timer);
  }, [startTime, endTime]);

  if (!timeInfo.timeLeft || Object.keys(timeInfo.timeLeft).length === 0) {
    return <span style={{ color: "#f87171" }}>Đã kết thúc</span>;
  }

  return (
    <span
      style={{
        color: timeInfo.isStarted ? "#16a34a" : "#0284c7",
        fontWeight: 600,
      }}
    >
      {!timeInfo.isStarted && (
        <span style={{ marginRight: 4 }}>Bắt đầu sau: </span>
      )}
      {timeInfo.timeLeft.days > 0 && `${timeInfo.timeLeft.days}d `}
      {timeInfo.timeLeft.hours}h {timeInfo.timeLeft.minutes}m{" "}
      {timeInfo.timeLeft.seconds}s
    </span>
  );
};

export default CountdownTimer;
