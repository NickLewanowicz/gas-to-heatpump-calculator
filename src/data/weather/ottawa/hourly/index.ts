

import { HourlyWeather } from '../../'

const data: HourlyWeather[] = [...data_2022].map((hour) => {
  return {
    datetime: new Date(hour.time),
    temp: hour['temperature_2m (°C)'],
  }
})
export default data
