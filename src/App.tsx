import React, { useEffect, useState } from 'react';

import {
  hourlyOttawa,
  edmonton,
  torontoWeather,
  Cities,
  HourlyWeather,
} from './data/weather';

import { CapacityChart } from './components/CapacityChart';
import { useSearchParams } from 'react-router-dom';

const KWH_BTU = 3412;

// After discussions with many folks it seems consistent
// that the manual j calculations considerably over estimate heat loss
// this margin is somewhere arount 2.4 - 2.5x so to offset this we multiply
// the energy needed by heatpump by 0.45
const MAGIC_REDUCTION = 0.4;

export interface Heatpump {
  name: string;
  cop: number[];
  cap: number[];
}

export interface Row {
  label: String;
  threshold: number;
  max: number;
  min: number;
  hours: HourlyWeather[];
  num: number;
  percentHours: number;
  heatingDegrees: number;
  heatingPercent: number;
  gains: number;
  resistiveKwhConsumed: number;
  heatPumpKwhConsumed: number;
  heatPumpDuelFuel: number;
  fossilFuelKwh: number;
  copAverage: number;
  amountOfEnergyNeeded: number;
}

export default function App() {
  const cityDataMap = {
    ottawa: hourlyOttawa,
    toronto: torontoWeather,
    edmonton: edmonton,
  };

  const cmGasToKwh = 10.55;
  const [searchParams, setSearchParams] = useSearchParams();
  const [init, setInit] = useState(false);
  const [indoor, setIndoor] = useState(22);
  const [designTemp, setDesignTemp] = useState(-30);
  const [designBtu, setDesignBtu] = useState(48000);
  const [gasUsage, setGasUsage] = useState(1300);
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
    console.log(rows.map((row) => row.amountOfEnergyNeeded));
    console.log(rows.reduce((acc, row) => acc + row.amountOfEnergyNeeded, 0));
  }, [heatpumps]);

  return (
    <div className="container">
      {renderNav()}
      {renderQuestions()}
      <div>
        <article>
          <div className="grid">
            {renderHeatingConsumption()}
            {renderDesignHeatingLoad()}
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
        {renderResults()}
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
                  {(val.copAverage / val.hours.length).toFixed(2)}{' '}
                  <em data-tooltip="COP average for range">COP</em>
                  {/* <br />
                  {(val.heatPumpEnergy).toFixed(2)}{' '}
                  <em data-tooltip="Output of energy">kw</em> */}
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
      ],
    };
  }

  function getHoursInTempRange(
    hours: HourlyWeather[],
    min: number,
    max: number
  ): HourlyWeather[] {
    return hours.filter((hour) => hour.temp <= max && hour.temp > min);
  }

  function getRows(
    thresholds: number[],
    weather: HourlyWeather[],
    input?: Heatpump
  ): Row[] {
    const heatpump = input || heatpumps[selected];

    return thresholds.map((val, i) => {
      const max = val;
      const min = thresholds[i + 1] || -100;
      const hoursInRange = getHoursInTempRange(weather, min, max);

      const {
        resistiveKwhConsumed,
        heatPumpKwhConsumed,
        heatPumpDuelFuel,
        fossilFuelKwh,
        copAverage,
        heatingDelta,
        amountOfEnergyNeeded,
      } = hoursInRange.reduce(
        (acc, hour, j) => {
          const { cop: hourCop, cap: hourCap } = getEfficiencyAtTemp(
            hour.temp,
            thresholds,
            heatpump
          );

          const {
            resistiveHeat: hourResitiveKwh,
            heatPump: hourHeatPumpKwh,
            heatPumpDuelFuel: hourHeatPumpDuelFuel,
            fossilFuelKwh: hourFossilFuelKwh,
            amountOfEnergyNeeded,
          } = getEnergySource(hour, hourCap, hourCop);

          return {
            heatingDelta: acc.heatingDelta + (indoor - hour.temp),
            resistiveKwhConsumed: acc.resistiveKwhConsumed + hourResitiveKwh,
            heatPumpKwhConsumed: acc.heatPumpKwhConsumed + hourHeatPumpKwh,
            heatPumpDuelFuel: acc.heatPumpDuelFuel + hourHeatPumpDuelFuel,
            fossilFuelKwh: acc.fossilFuelKwh + hourFossilFuelKwh,
            amountOfEnergyNeeded:
              acc.amountOfEnergyNeeded + amountOfEnergyNeeded,
            copAverage: acc.copAverage + hourCop,
          };
        },
        {
          heatingDelta: 0,
          resistiveKwhConsumed: 0,
          heatPumpKwhConsumed: 0,
          heatPumpDuelFuel: 0,
          fossilFuelKwh: 0,
          copAverage: 0,
          amountOfEnergyNeeded: 0,
        }
      );

      const hoursBelowNum = hoursInRange.length;
      const percent = Number(hoursBelowNum / weather.length);
      const heatingDeltaPercent = Number(heatingDelta / heatingDegrees);
      const gas = gasUsage * (heatingDelta / heatingDegrees);
      const costSavings = gas * costGas - heatPumpKwhConsumed * costKwh;

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
        hours: hoursInRange,
        num: hoursInRange.length,
        percentHours: percent,
        heatingDegrees: heatingDelta,
        heatingPercent: heatingDeltaPercent,
        gains: costSavings,
        resistiveKwhConsumed: resistiveKwhConsumed,
        heatPumpKwhConsumed: heatPumpKwhConsumed,
        heatPumpDuelFuel: heatPumpDuelFuel,
        fossilFuelKwh: fossilFuelKwh,
        copAverage,
        amountOfEnergyNeeded,
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
    amountOfEnergyNeeded: number;
  } {
    const requiredBtus = getDesignLoadAtTemp(hour.temp);
    const amountOfEnergyNeeded = requiredBtus / KWH_BTU;
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
      amountOfEnergyNeeded,
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

  function renderQuestions() {
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
    );
  }

  function renderHeatingConsumption() {
    return (
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
                    onChange={(v) => doGasCost(Number(v.currentTarget.value))}
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
                    onChange={(v) => setGasUsage(Number(v.currentTarget.value))}
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
                    onChange={(v) => doKwhCost(Number(v.currentTarget.value))}
                  />
                </p>
              </td>
            </tr>
          </table>
        </p>
      </div>
    );
  }

  function renderDesignHeatingLoad() {
    return (
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
                    onChange={(v) => setIndoor(Number(v.currentTarget.value))}
                  />
                </p>
              </td>
            </tr>
          </table>
        </p>
      </div>
    );
  }

  function getTotals(rows: Row[]): {
    totalConsumed: number;
    totalOutput: number;
    heatpumpConsumed: number;
    auxConsumed: number;
    heatpumpOutput: number;
    auxOutput: number;
  } {
    return rows.reduce(
      (acc, row) => {
        return {
          totalConsumed:
            acc.totalConsumed +
            row.heatPumpKwhConsumed * MAGIC_REDUCTION +
            row.resistiveKwhConsumed * MAGIC_REDUCTION,
          totalOutput: acc.totalOutput + row.amountOfEnergyNeeded,
          heatpumpConsumed:
            acc.heatpumpConsumed + row.heatPumpKwhConsumed * MAGIC_REDUCTION,
          auxConsumed:
            acc.auxConsumed + row.resistiveKwhConsumed * MAGIC_REDUCTION,
          heatpumpOutput:
            acc.heatpumpOutput + row.heatPumpKwhConsumed * row.copAverage,
          auxOutput: acc.auxConsumed + row.resistiveKwhConsumed,
        };
      },
      {
        totalConsumed: 0,
        totalOutput: 0,
        heatpumpConsumed: 0,
        auxConsumed: 0,
        heatpumpOutput: 0,
        auxOutput: 0,
      }
    );
  }

  function renderResults() {
    const totals = getTotals(rows);

    return (
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
              const totals = getTotals(rows);
              return (
                <tr>
                  {heatpump.name} + electric backup
                  <td>
                    {Math.round(totals.totalConsumed)}
                    kWh
                  </td>
                  <td>${Math.round(totals.totalConsumed * costKwh)}</td>
                </tr>
              );
            })}
            {heatpumps.map((heatpump) => {
              const rows = getRows(thresholds, weather, heatpump);
              const totals = getTotals(rows);
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
          {Math.round(totals.heatpumpConsumed)} kWh
        </p>
        <p>
          <em data-tooltip="Predicted kWh used by backup heat">
            Aux consumption:
          </em>{' '}
          {Math.round(totals.auxConsumed)}
          kwh
        </p>
        <p>
          <em data-tooltip="Average COP weighted by heating degree hours (ie hours are weighted proportionally to their heating degrees">
            Average COP:
          </em>{' '}
          {rows
            .reduce(
              (acc, row) =>
                acc +
                (row.copAverage / row.hours.length) *
                  (row.heatingDegrees / heatingDegrees),
              0
            )
            .toFixed(2)}{' '}
          COP
        </p>
      </article>
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
