import React, { useEffect, useState } from 'react';

import { DailyWeather, ottawaWeather, torontoWeather, Cities } from './data';

import { CapacityChart } from './components/CapacityChart';

export interface Heatpump {
  name: string;
  cop: number[];
  cap: number[];
}
export default function App() {
  const cityDataMap = {
    ottawa: ottawaWeather,
    toronto: torontoWeather,
  };

  const cmGasToKwh = 10.55;
  const [indoor, setIndoor] = useState(22);
  const [designTemp, setDesignTemp] = useState(-30);
  const [designBtu, setDesignBtu] = useState(48000);
  // const [cop, setCop] = useState([3.5, 3, 2, 1.8, 1.2, 1]);
  // const [cap, setCap] = useState([35000, 35000, 24000, 28000, 16000, 0]);
  const [gasUsage, setGasUsage] = useState(1000);
  const [city, setCity] = useState<Cities>('ottawa');
  const [furnaceEfficiency, setFurnaceEfficiency] = useState(0.96);
  const [costGas, setCostGas] = useState(0.45);
  const [costKwh, setCostkwh] = useState(0.1);
  const thresholds = [indoor, 8.33, -8.33, -15, -30];
  const weather = cityDataMap[city].slice();
  const [selected, setSelected] = useState(0);
  const [heatpumps, setHeatpumps] = useState<Heatpump[]>([
    {
      name: 'Heatpump #1',
      cap: [35000, 35000, 24000, 28000, 16000, 0],
      cop: [3.5, 3, 2, 1.8, 1.2, 1],
    },
  ]);

  const newHeatpump = () => ({
    name: `Heatpump #${heatpumps.length + 1}`,
    cap: [35000, 35000, 24000, 28000, 16000, 0],
    cop: [3.5, 3, 2, 1.8, 1.2, 1],
  });

  const kwhEquivalent = gasUsage * cmGasToKwh * furnaceEfficiency;
  const heatingDegrees = weather.reduce((acc, day, i) => {
    return acc + (indoor - (day.tempmax + day.tempmin) / 2);
  }, 0);

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

  console.log(heatpumps);

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
            <p>{consumptionDayBreakdown()}</p>
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
                      {rows.reduce(
                        (acc, row) =>
                          acc +
                          row.heatPumpKwhConsumed +
                          row.resistiveKwhConsumed,
                        0
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
                      {rows.reduce((acc, row) => acc + row.heatPumpDuelFuel, 0)}
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
              {/* <tr>
                Duel Fuel
                <td>
                  {rows.reduce((acc, row) => acc + row.heatPumpDuelFuel, 0)}
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
              </tr> */}
            </table>
          </figure>
          <p>
            <em data-tooltip="Predicted kWh used by heatpump">
              Heat pump consumption:
            </em>{' '}
            {rows.reduce((acc, row) => acc + row.heatPumpKwhConsumed, 0)} kWh
          </p>
          <p>
            <em data-tooltip="Predicted kWh used by backup heat">
              Aux consumption:
            </em>{' '}
            {rows.reduce((acc, row) => acc + row.resistiveKwhConsumed, 0)}kwh
          </p>
        </article>
      </div>
    </div>
  );

  function consumptionDayBreakdown() {
    return (
      <figure>
        <table role="grid">
          <thead>
            <td>Threshold °C</td>
            <td>% of days / heating degree</td>
            <td>Energy Consumption</td>
            <td>Heat Pump Performance</td>
          </thead>
          {rows.map((val, i) => {
            const percent = val.percentDays.toLocaleString(undefined, {
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

            // const resitiveEnergy = Math.round(
            //   (heatingDelta / heatingDegrees) * kwhEquivalent
            // );
            // const gas = Math.round(gasUsage * (heatingDelta / heatingDegrees));
            const heatPumpEnergy = val.heatPumpEnergy;

            return (
              <tr>
                <td>{`${val.label} °C`}</td>
                <td>
                  {percent} / {heatingDeltaPercent}
                </td>
                <td>
                  HP: {val.heatPumpKwhConsumed}kWh <br /> AUX:
                  {val.resistiveKwhConsumed}kWh
                </td>
                <td>
                  {heatpumps[selected].cop[i]}COP
                  <br />
                  {heatpumps[selected].cap[i]} BTUs
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
    weather: DailyWeather[],
    input?: Heatpump
  ) {
    const heatpump = input || heatpumps[selected];
    const cap = heatpump.cap;
    const cop = heatpump.cop;
    function getEfficiencyAtTemp(temp: number) {
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
    return thresholds.map((val, i) => {
      const max = val;
      const min = thresholds[i + 1] || -100;
      const daysBelow = weather.filter(
        (day) => day.tempmin <= max && day.tempmin > min
      );

      const heatingDelta = daysBelow.reduce((acc, day, j) => {
        return acc + (indoor - (day.tempmax + day.tempmin) / 2);
      }, 0);

      const {
        resistiveKwhConsumed,
        heatPumpKwhConsumed,
        heatPumpDuelFuel,
        fossilFuelKwh,
      } = daysBelow.reduce(
        (acc, day, j) => {
          const { cop: dayCop, cap: dayCap } = getEfficiencyAtTemp(day.temp);
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
          };
        },
        {
          resistiveKwhConsumed: 0,
          heatPumpKwhConsumed: 0,
          heatPumpDuelFuel: 0,
          fossilFuelKwh: 0,
        }
      );

      const daysBelowNum = daysBelow.length;
      const percent = Number(daysBelowNum / weather.length);
      const heatingDeltaPercent = Number(heatingDelta / heatingDegrees);

      // const resitiveEnergy = Math.round(
      //   (heatingDelta / heatingDegrees) * kwhEquivalent
      // );
      const gas = Math.round(gasUsage * (heatingDelta / heatingDegrees));
      const heatPumpEnergy = Math.round(
        ((heatingDelta / heatingDegrees) * kwhEquivalent) /
          heatpumps[selected].cop[i]
      );

      const costSavings = Math.round(gas * costGas - heatPumpEnergy * costKwh);

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
        percentDays: percent,
        heatingDegrees: heatingDelta,
        heatingPercent: heatingDeltaPercent,
        heatPumpEnergy: heatPumpEnergy,
        gains: costSavings,
        resistiveKwhConsumed,
        heatPumpKwhConsumed,
        heatPumpDuelFuel,
        fossilFuelKwh,
      };
    });
  }

  function getDesignLoadAtTemp(temp: number) {
    const designBtuPerDegree = designBtu / (indoor - designTemp);
    const heatingDegrees = indoor - temp;
    return heatingDegrees * designBtuPerDegree;
  }
  function getEnergySource(
    day: DailyWeather,
    btusAtTemp: number,
    copAtTemp: number
  ): {
    resistiveHeat: number;
    heatPump: number;
    heatPumpDuelFuel: number;
    fossilFuelKwh: number;
  } {
    const requiredBtus = getDesignLoadAtTemp(day.tempmin);
    const heatingDegreesToday = indoor - (day.tempmax + day.tempmin) / 2;
    const proportionOfHeatingDegrees = heatingDegreesToday / heatingDegrees;
    const amountOfEnergyNeeded = proportionOfHeatingDegrees * kwhEquivalent;
    const proportionHeatPump = Math.min(btusAtTemp / requiredBtus, 1);
    const resistiveHeat = Math.round(
      (1 - proportionHeatPump) * amountOfEnergyNeeded
    );
    const heatPump = Math.round(
      (proportionHeatPump * amountOfEnergyNeeded) / copAtTemp
    );
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
        <p>Total days in data set: </p>
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
            <a target="_blank" href="http://visualcrossing.com">
              visualcrossing.com
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
        <ul>
          <h3>Caveats</h3>
          This calculator is just something I threw together in my spare time.
          If its something of interest to people then I wouldnt mind throwing
          some time into adding instructions to add your own regions data or
          increasing granularity of data from days to hours. Because the data is
          daily I take the "worst case senario" and assume the heatpump
          opperates at the minimum COP and capacity for the days minimum
          temperature and ignore any variance that might exist.
        </ul>
      </div>
    );
  }

  function renderHeatPumpInputTable() {
    return (
      <div>
        <h3>Heat Pump Efficiency</h3>
        <div>
          {heatpumps.map((heatpump, i) => {
            return (
              <button
                onClick={() => setSelected(i)}
                className={`secondary ${i === selected ? '' : 'outline'}`}
              >
                {heatpump.name}
              </button>
            );
          })}
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
        {heatpumpTable(heatpumps[selected])}
      </div>
    );
  }

  function heatpumpTable(heatpump: Heatpump) {
    return (
      <figure>
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
}
