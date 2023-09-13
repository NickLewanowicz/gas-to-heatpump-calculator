import data_2019 from './2019';
import data_2020 from './2020';
import data_2021 from './2021';
import data_2022 from './2022';
import { HourlyWeather } from '../../';

const data: HourlyWeather[] = [
  ...data_2019,
  ...data_2020,
  ...data_2021,
  ...data_2022,
].map((hour) => {
  console.log(data_2019.length, data_2020.length, data_2021.length);

  return {
    datetime: new Date(hour.time),
    temp: Number(hour.time),
  };
});
export default data;
