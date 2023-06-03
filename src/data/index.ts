import data_2019 from './2019';
import data_2020 from './2020';
import data_2021 from './2021';
import data_2022 from './2022';

export interface DailyWeather {
  name: string;
  datetime: Date;
  tempmax: number;
  tempmin: number;
  temp: number;
  feelslikemax: number;
  feelslikemin: number;
  feelslike: number;
  dew: number;
  humidity: number;
  precip: number;
  precipprob: number;
  precipcover: number;
  preciptype: string;
  snow: number;
  snowdepth: number;
  windgust: number;
  windspeed: number;
  winddir: number;
  sealevelpressure: number;
  cloudcover: number;
  visibility: number;
  solarradiation: number;
  solarenergy: number;
  uvindex: number;
  severerisk: number;
  sunrise: string;
  sunset: string;
  moonphase: number;
  conditions: string;
  description: string;
  icon: string;
  stations: string;
}

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
  };
});
export default data;
