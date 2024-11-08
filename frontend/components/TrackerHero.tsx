import { ChartData } from '@/types/data';
import { Tracker } from '@tremor/react';

export const TrackerHero = ({
    data,
    classname,
    interval,
    showTooltip = false,
  } : {
    data: ChartData[],
    classname: string,
    interval?: number,
    showTooltip?: boolean
  }) => {
  const chartdata = [];

  if (data && data.length > 0) {
    let pos = 0
    let currentDate, nextDate;
  
    while (pos < data.length - 1) {
      currentDate = new Date(data[pos].Load.Date).getTime()
      nextDate = new Date(data[pos + 1].Load.Date).getTime()
      if (currentDate + 90000 > nextDate) {
        chartdata.push(showTooltip ? {
          tooltip: 'Operational',
          color: 'green'
        } : {
          color: 'green'
        });
      } else {
        chartdata.push(showTooltip ? {
          tooltip: 'Downtime',
          color: 'red'
        } : {
          color: 'red'
        });
      }
      pos++;
    }
    chartdata.push({
      color: 'green'
    });
  }

  return (
    <div>
      <Tracker
      className={classname}
      data={chartdata.slice(interval)}
      />
    </div>
  )
}