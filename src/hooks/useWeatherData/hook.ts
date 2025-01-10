import { useState, useEffect } from 'react'
import { CityName } from '../../data/weather'
import { HourlyWeather, SeasonView } from '../../types'
import { loadCityData } from '../../utils/loadCityData'

export function useWeatherData(city: CityName, seasonView: SeasonView, year: number) {
    const [weather, setWeather] = useState<HourlyWeather[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<Error | null>(null)
    const [filteredWeather, setFilteredWeather] = useState<HourlyWeather[]>([])

    useEffect(() => {
        let mounted = true
        setLoading(true)

        loadCityData(city)
            .then((cityWeather) => {
                if (mounted) {
                    const hourlyWeather: HourlyWeather[] = cityWeather.hourly.time.map((hour: string, i: number) => ({
                        datetime: new Date(hour),
                        temp: cityWeather.hourly.temperature_2m[i],
                    }))
                    setWeather(hourlyWeather)
                    setError(null)
                }
            })
            .catch((err) => {
                if (mounted) {
                    setError(err instanceof Error ? err : new Error('Failed to load weather data'))
                    setWeather([])
                }
            })
            .finally(() => {
                if (mounted) {
                    setLoading(false)
                }
            })

        return () => {
            mounted = false
        }
    }, [city])

    useEffect(() => {
        if (weather.length > 0) {
            const yearStart = seasonView === 'year'
                ? new Date(`${year}-01-01`)
                : new Date(`${year}-09-01`)

            const yearEnd = seasonView === 'year'
                ? new Date(`${year}-12-31`)
                : new Date(`${year + 1}-08-31`)

            const filteredWeather = weather.filter(entry => {
                const date = new Date(entry.datetime)
                return date >= yearStart && date <= yearEnd
            })

            setFilteredWeather(filteredWeather)
        }
    }, [weather, year, seasonView])

    return { weather, loading, error, filteredWeather }
}