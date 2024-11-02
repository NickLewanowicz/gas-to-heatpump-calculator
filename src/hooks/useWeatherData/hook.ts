import { useState, useEffect } from 'react'
import { WeatherData, HourlyWeather } from '../../types'
import weatherData from '../../data'

export function useWeatherData(city: string) {
    const [weather, setWeather] = useState<HourlyWeather[]>([])

    useEffect(() => {
        const allWeather = weatherData as WeatherData
        const cityWeather = allWeather[city]
        if (cityWeather) {
            const hourlyWeather: HourlyWeather[] = cityWeather.hourly.time.map((hour, i) => ({
                datetime: new Date(hour),
                temp: cityWeather.hourly.temperature_2m[i],
            }))
            setWeather(hourlyWeather)
        }
    }, [city])

    return weather
}