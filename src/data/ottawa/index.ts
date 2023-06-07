import data_2019 from './2019'
import data_2020 from './2020'
import data_2021 from './2021'
import data_2022 from './2022'
import { DailyWeather } from '../'

const data: DailyWeather[] = [
  ...data_2019,
  ...data_2020,
  ...data_2021,
  ...data_2022,
].map((day) => {
  return {
    ...day,
    datetime: new Date(day.datetime),
    windgust: Number(day.windgust),
    severerisk: Number(day.severerisk),
  }
})
export default data
