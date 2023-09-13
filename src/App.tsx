import React, { useEffect, useState } from 'react';

import {
  hourlyOttawa,
  torontoWeather,
  Cities,
  HourlyWeather,
} from './data/weather';

import { CapacityChart } from './components/CapacityChart';
import { useSearchParams } from 'react-router-dom';

export interface Heatpump {
  name: string;
  cop: number[];
  cap: number[];
}
export default function App() {
  const ottawaWeather = hourlyOttawa.filter((_, index) => index % 1 === 0);

  const cityDataMap = {
    ottawa: ottawaWeather,
    toronto: torontoWeather,
  };

  const cmGasToKwh = 10.55;
  const [searchParams, setSearchParams] = useSearchParams();
  const [init, setInit] = useState(false);
  const [indoor, setIndoor] = useState(22);
  const [designTemp, setDesignTemp] = useState(-30);
  const [designBtu, setDesignBtu] = useState(48000);
  const [gasUsage, setGasUsage] = useState(1000);
  const [city, setCity] = useState<Cities>('ottawa');
  const [furnaceEfficiency, setFurnaceEfficiency] = useState(0.96);
  const [costGas, setCostGas] = useState(0.45);
  const [costKwh, setCostkwh] = useState(0.1);
  const [selected, setSelected] = useState(0);
  const [heatpumps, setHeatpumps] = useState<Heatpump[]>([
    {
      name: 'Heatpump #1',
      cap: [35000, 35000, 24000, 28000, 16000, 0],
      cop: [3.5, 3, 2, 1.8, 1.2, 1],
    },
  ]);

  const thresholds = [indoor, 8.33, -8.33, -15, -30];
  const weather = cityDataMap[city].slice();

  const newHeatpump = () => ({
    name: `Heatpump #${heatpumps.length + 1}`,
    cap: [35000, 35000, 24000, 28000, 16000, 0],
    cop: [3.5, 3, 2, 1.8, 1.2, 1],
  });

  const kwhEquivalent = gasUsage * cmGasToKwh * furnaceEfficiency;
  const heatingDegrees = weather.reduce((acc, hour, i) => {
    return acc + (indoor - hour.temp);
  }, 0);

  useEffect(() => {
    const heatpumps = JSON.parse(decodeURI(searchParams.get('heatpumps')));
    setSearchParams(searchParams);
    if (heatpumps && heatpumps.length) {
      setHeatpumps(heatpumps);
    }
    setInit(true);
  }, []);

  useEffect(() => {
    if (init) {
      searchParams.set('heatpumps', encodeURI(JSON.stringify(heatpumps)));
      setSearchParams(searchParams);
    }
  }, [heatpumps]);

  const doGasCost = (num: number) => {
    if (typeof num !== 'number') {
      setCostGas(0);
    } else {
      setCostGas(num);
    }
  };
  const doKwhCost = (num: number) => {
    if (typeof num !== 'number') {
      setCostkwh(0);
    } else {
      setCostkwh(num);
    }
  };

  let rows = getRows(thresholds, weather);
  useEffect(() => {
    rows = getRows(thresholds, weather);
  }, [heatpumps]);

  return (
    <div className="container">
      {renderNav()}
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
      <div>
        <article>
          <div className="grid">
            <div>
              <h3>Heating consumption/cost</h3>
              <p>
                <table>
                  <tr>
                    <td>Cost of gas (per cubic meter)</td>
                    <td>
                      <p>
                        <input
                          type="number"
                          value={costGas}
                          onChange={(v) =>
                            doGasCost(Number(v.currentTarget.value))
                          }
                        />
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td>Gas usage (cubic meter)</td>
                    <td>
                      <p>
                        <input
                          value={gasUsage}
                          onChange={(v) =>
                            setGasUsage(Number(v.currentTarget.value))
                          }
                        />
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td>Furnace efficiency (0-1)</td>
                    <td>
                      <p>
                        <input
                          type="number"
                          value={furnaceEfficiency}
                          onChange={(v) =>
                            setFurnaceEfficiency(Number(v.currentTarget.value))
                          }
                        />
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td>Cost per kwh ($)</td>
                    <td>
                      <p>
                        <input
                          type="number"
                          value={costKwh}
                          onChange={(v) =>
                            doKwhCost(Number(v.currentTarget.value))
                          }
                        />
                      </p>
                    </td>
                  </tr>
                </table>
              </p>
            </div>
            <div>
              <h3>Heating Design Load</h3>
              <p>
                <label>Choose a city:</label>
                <select
                  name="city"
                  onChange={(val) => setCity(val.currentTarget.value as Cities)}
                  value={city}
                >
                  <option value="ottawa">Ottawa</option>
                  <option value="toronto">Toronto</option>
                </select>
                <table>
                  <tr>
                    <td>Heating Design Load (BTUs)</td>
                    <td>
                      <p>
                        <input
                          type="number"
                          value={designBtu}
                          onChange={(v) =>
                            setDesignBtu(Number(v.currentTarget.value))
                          }
                        />
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td>Design temp (coldest 1% in c)</td>
                    <td>
                      <p>
                        <input
                          value={designTemp}
                          onChange={(v) =>
                            setDesignTemp(Number(v.currentTarget.value))
                          }
                        />
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td>Indoor set temperature (c)</td>
                    <td>
                      <p>
                        <input
                          type="number"
                          value={indoor}
                          onChange={(v) =>
                            setIndoor(Number(v.currentTarget.value))
                          }
                        />
                      </p>
                    </td>
                  </tr>
                </table>
              </p>
            </div>
          </div>
          {renderHeatPumpInputTable()}
          <details>
            <summary>Consumption by temperature range</summary>
            <p>{consumptionHourBreakdown()}</p>
          </details>
          <details>
            <summary>Performance by temperature range</summary>
            <CapacityChart
              data={getCapacityData(
                getRows(thresholds, weather, heatpumps[selected])
              )}
            />
          </details>
        </article>
        <article>
          <h3>Results Comparison</h3>
          <figure>
            <table role="grid">
              <thead>
                <td></td>
                <td>Consumption</td>
                <td>Cost</td>
              </thead>

              <tr>
                Fossil Fuel
                <td>{gasUsage} m3</td>
                <td>${costGas * gasUsage}</td>
              </tr>
              <tr>
                Baseboard Heat
                <td>{kwhEquivalent} kWh</td>
                <td> ${Math.round(kwhEquivalent * costKwh)}</td>
              </tr>
              {heatpumps.map((heatpump) => {
                const rows = getRows(thresholds, weather, heatpump);
                return (
                  <tr>
                    {heatpump.name} + electric backup
                    <td>
                      {Math.round(
                        rows.reduce(
                          (acc, row) =>
                            acc +
                            row.heatPumpKwhConsumed +
                            row.resistiveKwhConsumed,
                          0
                        )
                      )}
                      kWh
                    </td>
                    <td>
                      $
                      {Math.round(
                        rows.reduce(
                          (
                            acc,
                            { heatPumpKwhConsumed, resistiveKwhConsumed }
                          ) => acc + heatPumpKwhConsumed + resistiveKwhConsumed,
                          0
                        ) * costKwh
                      )}
                    </td>
                  </tr>
                );
              })}
              {heatpumps.map((heatpump) => {
                const rows = getRows(thresholds, weather, heatpump);
                return (
                  <tr>
                    {heatpump.name} + gas backup
                    <td>
                      {Math.round(
                        rows.reduce((acc, row) => acc + row.heatPumpDuelFuel, 0)
                      )}
                      kWh
                      <br />
                      {Math.round(
                        rows.reduce((acc, row) => acc + row.fossilFuelKwh, 0) /
                          cmGasToKwh
                      )}{' '}
                      m3
                    </td>
                    <td>
                      $
                      {Math.round(
                        rows.reduce(
                          (acc, { heatPumpDuelFuel, fossilFuelKwh }) =>
                            acc +
                            heatPumpDuelFuel * costKwh +
                            (fossilFuelKwh / cmGasToKwh) * costGas,
                          0
                        )
                      )}
                    </td>
                  </tr>
                );
              })}
            </table>
          </figure>
          <p>
            <em data-tooltip="Predicted kWh used by heatpump">
              Heat pump consumption:
            </em>{' '}
            {Math.round(
              rows.reduce((acc, row) => acc + row.heatPumpKwhConsumed, 0)
            )}{' '}
            kWh
          </p>
          <p>
            <em data-tooltip="Predicted kWh used by backup heat">
              Aux consumption:
            </em>{' '}
            {rows.reduce((acc, row) => acc + row.resistiveKwhConsumed, 0)}kwh
          </p>
          <p>
            <em data-tooltip="Average COP weighted by heating degree days (ie days are weighted proportionally to their heating degrees">
              Average COP:
            </em>{' '}
            {rows
              .reduce(
                (acc, row) =>
                  acc +
                  (row.copAverage / row.days.length) *
                    (row.heatingDegrees / heatingDegrees),
                0
              )
              .toFixed(2)}{' '}
            COP
          </p>
        </article>
      </div>
    </div>
  );

  function consumptionHourBreakdown() {
    return (
      <figure>
        <table role="grid">
          <thead>
            <td>Threshold °C</td>
            <td>% of hours / heating degree</td>
            <td>Energy Consumption</td>
            <td>Heat Pump Performance</td>
          </thead>
          {rows.map((val, i) => {
            const percent = val.percentHours.toLocaleString(undefined, {
              style: 'percent',
              minimumFractionDigits: 2,
            });
            const heatingDeltaPercent = val.heatingPercent.toLocaleString(
              undefined,
              {
                style: 'percent',
                minimumFractionDigits: 2,
              }
            );

            const heatPumpEnergy = val.heatPumpEnergy;

            return (
              <tr>
                <td>{`${val.label} °C`}</td>
                <td>
                  {percent} / {heatingDeltaPercent}
                </td>
                <td>
                  HP: {Math.round(val.heatPumpKwhConsumed)}kWh <br /> AUX:
                  {val.resistiveKwhConsumed.toFixed(2)}kWh
                </td>
                <td>
                  {heatpumps[selected].cop[i]}
                  <em data-tooltip={`COP @ ${val.max}c`}>COP</em>
                  <br />
                  {heatpumps[selected].cap[i]} BTUs
                  <br />
                  {(val.copAverage / val.days.length).toFixed(2)}{' '}
                  <em data-tooltip="COP average for range">COP</em>
                </td>
              </tr>
            );
          })}
        </table>
      </figure>
    );
  }

  function getCapacityData(rows: ReturnType<typeof getRows>) {
    return {
      labels: rows.map((row) => String(row.max)),
      // labels: [22, 0, -30],
      datasets: [
        {
          label: 'Capacity',
          data: heatpumps[selected].cap,
          // data: rows.map(({ max }, i) => ({ x: max, y: cap[i] })),
          borderColor: 'rgb(255, 99, 132)',
          backgroundColor: 'rgba(255, 99, 132, 0.5)',
          yAxisID: 'y',
        },
        {
          label: 'COP',
          data: heatpumps[selected].cop,
          // data: rows.map(({ max }, i) => ({ x: max, y: cop[i] })),
          borderColor: 'rgb(53, 162, 235)',
          backgroundColor: 'rgba(53, 162, 235, 0.5)',
          yAxisID: 'y1',
        },
        {
          label: 'Design Load',
          fill: true,
          data: rows.map(({ max }) => ({
            x: max,
            y: getDesignLoadAtTemp(max),
          })),
          borderColor: 'rgb(253, 262, 35)',
          backgroundColor: 'rgba(253, 262, 35, 0.1)',
          yAxisID: 'y',
        },
        // {
        //   label: 'bar',
        //   type: 'bar',
        //   fill: true,
        //   data: rows.map(({ percentDays }) => ({
        //     x: percentDays,
        //     y: percentDays,
        //   })),
        //   borderColor: 'rgb(203, 202, 35)',
        //   backgroundColor: 'rgba(203, 202, 35, 0.1)',
        //   yAxisID: 'y2',
        // },
      ],
    };
  }

  function getRows(
    thresholds: number[],
    weather: HourlyWeather[],
    input?: Heatpump
  ) {
    const heatpump = input || heatpumps[selected];
    const cap = heatpump.cap;
    const cop = heatpump.cop;

    return thresholds.map((val, i) => {
      const max = val;
      const min = thresholds[i + 1] || -100;
      const daysBelow = weather.filter(
        (day) => day.temp <= max && day.temp > min
      );

      const heatingDelta = daysBelow.reduce((acc, day, j) => {
        return acc + (indoor - day.temp);
      }, 0);

      const {
        resistiveKwhConsumed,
        heatPumpKwhConsumed,
        heatPumpDuelFuel,
        fossilFuelKwh,
        copAverage,
      } = daysBelow.reduce(
        (acc, day, j) => {
          const { cop: dayCop, cap: dayCap } = getEfficiencyAtTemp(
            day.temp,
            thresholds,
            heatpump
          );
          const {
            resistiveHeat: dayResitiveKwh,
            heatPump: dayHeatPumpKwh,
            heatPumpDuelFuel: dayHeatPumpDuelFuel,
            fossilFuelKwh: dayFossilFuelKwh,
          } = getEnergySource(day, dayCap, dayCop);

          return {
            resistiveKwhConsumed: acc.resistiveKwhConsumed + dayResitiveKwh,
            heatPumpKwhConsumed: acc.heatPumpKwhConsumed + dayHeatPumpKwh,
            heatPumpDuelFuel: acc.heatPumpDuelFuel + dayHeatPumpDuelFuel,
            fossilFuelKwh: acc.fossilFuelKwh + dayFossilFuelKwh,
            copAverage: acc.copAverage + dayCop,
          };
        },
        {
          resistiveKwhConsumed: 0,
          heatPumpKwhConsumed: 0,
          heatPumpDuelFuel: 0,
          fossilFuelKwh: 0,
          copAverage: 0,
        }
      );

      const daysBelowNum = daysBelow.length;
      const percent = Number(daysBelowNum / weather.length);
      const heatingDeltaPercent = Number(heatingDelta / heatingDegrees);

      const gas = gasUsage * (heatingDelta / heatingDegrees);
      const heatPumpEnergy =
        ((heatingDelta / heatingDegrees) * kwhEquivalent) /
        heatpumps[selected].cop[i];
      const costSavings = gas * costGas - heatPumpEnergy * costKwh;

      let label = '';

      if (i === thresholds.length - 1) {
        label = `< ${val}`;
      } else {
        label = `${val} to ${thresholds[i + 1]}`;
      }

      return {
        label,
        threshold: val,
        max,
        min,
        days: daysBelow,
        num: daysBelow.length,
        percentHours: percent,
        heatingDegrees: heatingDelta,
        heatingPercent: heatingDeltaPercent,
        heatPumpEnergy: heatPumpEnergy,
        gains: costSavings,
        resistiveKwhConsumed,
        heatPumpKwhConsumed,
        heatPumpDuelFuel,
        fossilFuelKwh,
        copAverage,
      };
    });
  }

  function getDesignLoadAtTemp(temp: number) {
    const designBtuPerDegree = designBtu / (indoor - designTemp);
    const heatingDegrees = indoor - temp;
    return heatingDegrees * designBtuPerDegree;
  }
  function getEnergySource(
    hour: HourlyWeather,
    btusAtTemp: number,
    copAtTemp: number
  ): {
    resistiveHeat: number;
    heatPump: number;
    heatPumpDuelFuel: number;
    fossilFuelKwh: number;
  } {
    const requiredBtus = getDesignLoadAtTemp(hour.temp);
    const heatingDegreesThisHour = indoor - hour.temp;
    const proportionOfHeatingDegrees = heatingDegreesThisHour / heatingDegrees;
    const amountOfEnergyNeeded = proportionOfHeatingDegrees * kwhEquivalent;
    const proportionHeatPump = Math.min(btusAtTemp / requiredBtus, 1);

    const resistiveHeat = (1 - proportionHeatPump) * amountOfEnergyNeeded;
    const heatPump = (proportionHeatPump * amountOfEnergyNeeded) / copAtTemp;
    const heatPumpDuelFuel = proportionHeatPump === 1 ? heatPump : 0;
    const fossilFuelKwh = proportionHeatPump === 1 ? 0 : amountOfEnergyNeeded;

    return {
      resistiveHeat,
      heatPump,
      heatPumpDuelFuel,
      fossilFuelKwh,
    };
  }

  function renderNav() {
    return (
      <div>
        <nav>
          <ul>
            <li>
              <strong>Heat Pump Calculator</strong>
            </li>
          </ul>
        </nav>
      </div>
    );
  }

  function renderDataOverview() {
    return (
      <div>
        <h2>Weather Data</h2>
        <p>Total hours in data set: </p>
        <p>Ottawa: {ottawaWeather.length}</p>
        <p>Toronto: {torontoWeather.length}</p>
        <p>
          Data span from: {weather[0].datetime.toDateString()} -
          {weather[weather.length - 1].datetime.toDateString()} (excluding June,
          July, August)
        </p>
        <p>
          <i>
            Data was pulled from{' '}
            <a
              target="_blank"
              href="https://open-meteo.com/en/docs/historical-weather-api"
            >
              open-meteo.com
            </a>{' '}
            for years 2019-2023
          </i>
        </p>
      </div>
    );
  }

  function renderExplanation() {
    return (
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
        {/* <ul>
          <h3>Caveats</h3>
          This calculator is just something I threw together in my spare time.
          If its something of interest to people then I wouldnt mind throwing
          some time into adding instructions to add your own regions data or
          increasing granularity of data from days to hours. Because the data is
          daily I take the "worst case senario" and assume the heatpump
          opperates at the minimum COP and capacity for the days minimum
          temperature and ignore any variance that might exist.
        </ul> */}
      </div>
    );
  }

  function renderHeatPumpInputTable() {
    return (
      <div>
        <h3>Heat Pump Efficiency</h3>
        <div>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            {heatpumps.map((heatpump, i) => {
              return (
                <button
                  style={{
                    display: 'flex',
                    flex: 1,
                    gap: '1rem',
                  }}
                  onClick={() => setSelected(i)}
                  className={`secondary ${i === selected ? '' : 'outline'}`}
                >
                  {heatpump.name}
                </button>
              );
            })}
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <span
              style={{ flex: 1 }}
              role="button"
              className="outline"
              onClick={() => setHeatpumps([...heatpumps, newHeatpump()])}
            >
              + add heatpump
            </span>
            {heatpumps.length > 1 && (
              <span
                style={{ flex: 1 }}
                role="button"
                className="outline"
                onClick={() => {
                  selected >= heatpumps.length - 1 && setSelected(0);
                  setHeatpumps((prevState) => {
                    const updatedArray = prevState.filter(
                      (_, i) => i !== selected
                    );

                    return updatedArray;
                  });
                }}
              >
                - remove heatpump
              </span>
            )}
          </div>
        </div>
        {heatpumps.map((heatpump, i) => {
          return i == selected ? heatpumpTable(heatpump, i) : null;
        })}
      </div>
    );
  }

  function heatpumpTable(heatpump: Heatpump, i: number) {
    return (
      <figure>
        <div
          style={{
            paddingTop: '1rem',
            gap: '1rem',

            display: 'flex',
            alignItems: 'baseline',
          }}
        >
          <p>🏷 </p>
          <input
            value={heatpump.name}
            onChange={(v) => {
              setHeatpumps((prevState) => {
                const updated = [...prevState];
                const current = updated[selected];
                current.name = v.target.value;

                return updated;
              });
            }}
          />
        </div>
        <table>
          <thead>
            <td>Temp °C / BTUs</td>
            <td>COP at temp</td>
            <td>BTU at temp</td>
          </thead>
          {rows.slice().map((val, i) => {
            return (
              <tr>
                <td>
                  {`${val.max} °C`} <br />
                  {Math.round(
                    (designBtu / (indoor - -30)) * (indoor - val.max)
                  )}{' '}
                  BTUs
                </td>
                <td>
                  <input
                    type="number"
                    value={heatpumps[selected].cop[i]}
                    onChange={(v) => {
                      setHeatpumps((prevState) => {
                        const updated = [...prevState];
                        const current = updated[selected];
                        current.cop[i] = Number(v.target.value);

                        return updated;
                      });
                    }}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={heatpumps[selected].cap[i]}
                    onChange={(v) => {
                      setHeatpumps((prevState) => {
                        const updated = [...prevState];
                        const current = updated[selected];
                        current.cap[i] = Number(v.target.value);

                        return updated;
                      });
                    }}
                  />
                </td>
              </tr>
            );
          })}
        </table>
      </figure>
    );
  }

  function getEfficiencyAtTemp(
    temp: number,
    thresholds: number[],
    heatpump: Heatpump
  ) {
    const cap = heatpump.cap;
    const cop = heatpump.cop;
    const arr: { temp: number; cap: number; cop: number }[] = thresholds.map(
      (val, i) => ({
        temp: val,
        cap: cap[i],
        cop: cop[i],
      })
    );

    const minIndex = Math.max(
      arr.findIndex((val) => val.temp < temp),
      1
    );

    const capSlope =
      (cap[minIndex] - cap[minIndex - 1]) /
      (thresholds[minIndex] - thresholds[minIndex - 1]);
    const copSlope =
      (cop[minIndex] - cop[minIndex - 1]) /
      (thresholds[minIndex] - thresholds[minIndex - 1]);
    const capIntercept = cap[minIndex] - capSlope * thresholds[minIndex];
    const copIntercept = cop[minIndex] - copSlope * thresholds[minIndex];

    return {
      cap: capSlope * temp + capIntercept,
      cop: copSlope * temp + copIntercept,
    };
  }
}
