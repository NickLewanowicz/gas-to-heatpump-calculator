import ottawa from './ottawa';
import toronto from './toronto';
import edmonton from './edmonton';

interface DailyWeather {
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

export interface HourlyWeather {
  datetime: Date;
  temp: number;
}

type Cities = 'ottawa' | 'toronto' | 'edmonton';

export { toronto, ottawa, edmonton, DailyWeather, Cities };
