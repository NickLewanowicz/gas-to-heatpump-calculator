import toronto from './toronto'
import montreal from './montreal'
import vancouver from './vancouver'
import calgary from './calgary'
import edmonton from './edmonton'
import ottawa from './ottawa'
import quebec_city from './quebec_city'
import winnipeg from './winnipeg'
import mississauga from './mississauga'
import brampton from './brampton'
import hamilton from './hamilton'
import surrey from './surrey'
import laval from './laval'
import halifax from './halifax'
import london from './london'
import markham from './markham'
import vaughan from './vaughan'
import gatineau from './gatineau'
import longueuil from './longueuil'
import burnaby from './burnaby'
import saskatoon from './saskatoon'
import kitchener from './kitchener'
import windsor from './windsor'
import regina from './regina'
import richmond from './richmond'

export const cities = [
  "Toronto",
  "Montreal",
  "Vancouver",
  "Calgary",
  "Edmonton",
  "Ottawa",
  "Quebec City",
  "Winnipeg",
  "Mississauga",
  "Brampton",
  "Hamilton",
  "Surrey",
  "Laval",
  "Halifax",
  "London",
  "Markham",
  "Vaughan",
  "Gatineau",
  "Longueuil",
  "Burnaby",
  "Saskatoon",
  "Kitchener",
  "Windsor",
  "Regina",
  "Richmond"
] as const

export type CityName = typeof cities[number]

export const weatherData = {
  'Toronto': toronto,
  'Montreal': montreal,
  'Vancouver': vancouver,
  'Calgary': calgary,
  'Edmonton': edmonton,
  'Ottawa': ottawa,
  'Quebec City': quebec_city,
  'Winnipeg': winnipeg,
  'Mississauga': mississauga,
  'Brampton': brampton,
  'Hamilton': hamilton,
  'Surrey': surrey,
  'Laval': laval,
  'Halifax': halifax,
  'London': london,
  'Markham': markham,
  'Vaughan': vaughan,
  'Gatineau': gatineau,
  'Longueuil': longueuil,
  'Burnaby': burnaby,
  'Saskatoon': saskatoon,
  'Kitchener': kitchener,
  'Windsor': windsor,
  'Regina': regina,
  'Richmond': richmond
}

export type WeatherData = typeof weatherData[keyof typeof weatherData]

export default weatherData