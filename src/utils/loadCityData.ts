import { CityName } from '../data/weather'
import type { WeatherData } from '../types'

export async function loadCityData(city: CityName): Promise<WeatherData[string]> {
    const formattedCity = city.toLowerCase().replace(' ', '_')
    const module = await import(`../data/weather/${formattedCity}`)
    return module.default
}
