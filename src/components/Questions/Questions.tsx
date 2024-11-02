import React from 'react'
import { HourlyWeather } from '../../types'

interface QuestionsProps {
    weather: HourlyWeather[]
}

export const Questions: React.FC<QuestionsProps> = ({ weather }) => {
    const renderDataOverview = () => (
        <div>
            <h2>Weather Data</h2>
            <p>There are 25 cities currently in the dataset and each contains data from: </p>
            {weather.length > 0 ? (
                <p>
                    Data span from: {weather[0].datetime.toDateString()} -
                    {weather[weather.length - 1].datetime.toDateString()} (excluding June,
                    July, August)
                </p>
            ) : (
                <p>Loading weather data...</p>
            )}
        </div>
    )

    const renderExplanation = () => (
        <div>
            <h2>Theoretical explanation</h2>
            <ol>
                <li>
                    Heat loss is directly proportional to heating degrees so by using
                    historical weather data in Ottawa we can identify both <b>(1)</b>{' '}
                    the proportion of days that you will be within a temperature window
                    and <b>(2)</b> the aproximate proportion of energy will be used at
                    the given temperature window
                </li>
                <li>
                    By providing your natural gas consumption and furnace efficiency we
                    can convert it to kwh and use that as a baseline for the amount of
                    energy you would otherwise consume with a resitive heat system
                    (baseboard heat){' '}
                </li>
                <li>
                    By providing the heat pump COPs we simply need to divide the heat
                    energy needed for a given threshold by the COP at that temperature
                    to find the amount of kwh needed for the given heat pump to heat
                    your home at for that range in the average year{' '}
                </li>
                <li>
                    We can derrive the proportion of your annual energy budget needed on
                    any given day by calculating the proportion of heating degrees that
                    day occupies of the total degree days in the data set
                </li>
                <li>
                    Once we know the amount of energy needed for a given day (explained
                    in #4) we can use the provided heat pump capacity to identify what
                    proportion of that energy can be provided by the heat pump and
                    inversely the proportion provided by AUX heating, we will divide the
                    heat pump energy by the COP at that days minimum temperature to
                    reflect is ability to have greater then 100% efficency.
                </li>
            </ol>
        </div>
    )

    return (
        <article>
            <details>
                <summary>What is this?</summary>
                <p>
                    Tool for estimating the energy and cost savings from using a heat
                    pump
                </p>
            </details>
            <details>
                <summary>What data is being used?</summary>
                {renderDataOverview()}
            </details>
            <details>
                <summary>
                    How are you using this data to predict energy usage?
                </summary>
                {renderExplanation()}
            </details>
        </article>
    )
}
