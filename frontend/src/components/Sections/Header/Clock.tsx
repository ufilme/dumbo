import Clock from "react-clock";
import { useNow } from "@/hooks/useNow";

export function ClockComponent() {
  const now = useNow();

  return (
    <Clock
      hourHandLength={60}
      hourHandOppositeLength={20}
      hourHandWidth={8}
      hourMarksLength={20}
      hourMarksWidth={8}
      minuteHandLength={90}
      minuteHandOppositeLength={20}
      minuteHandWidth={6}
      minuteMarksWidth={3}
      secondHandLength={75}
      secondHandOppositeLength={25}
      secondHandWidth={3}
      value={new Date(now)}
    />
  );
}
