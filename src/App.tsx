import React, { PureComponent, useEffect, useState } from 'react';
import { LineChart, Line } from 'recharts';

// import './style.css';
import data, { DailyWeather } from './data';

export default function App() {
  const weather = data.slice();
  const totalDays = weather.length;

  const cmGasToKwh = 10.55;
  const cops = [1, 2, 3];
  const [indoor, setIndoor] = useState(22);
  const [designTemp, setDesignTemp] = useState(-30);
  const [designBtu, setDesignBtu] = useState(48000);
  const [cop, setCop] = useState([3.5, 3, 2, 1.8, 1.2]);
  const [cap, setCap] = useState([35000, 35000, 24000, 28000, 16000]);
  const [gasUsage, setGasUsage] = useState(1000);
  const [furnaceEfficiency, setFurnaceEfficiency] = useState(0.96);
  const [costGas, setCostGas] = useState(0.45);
  const [costKwh, setCostkwh] = useState(0.1);
  const thresholds = [indoor, 8.33, -8.33, -15, -30];

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

  const doCopChange = (num: number, i: number) => {
    const newCop = cop.slice();
    newCop[i] = num;
    setCop(newCop);
  };

  const doCapChange = (num: number, i: number) => {
    const newCap = cap.slice();
    newCap[i] = num;
    setCap(newCap);
  };

  let rows = getRows(thresholds, weather);
  useEffect(() => {
    rows = getRows(thresholds, weather);
  }, [cop]);

  return (
    <main>
      <article>
        <header>
          <h1>Heat Pump Calculator for Ottawa</h1>
          <p>
            Tool for estimating the energy and cost savings from using a heat
            pump
          </p>
        </header>
        <aside>
          <h2>Overall Data</h2>
          <p>Total days in data set: {totalDays}</p>
          <p>
            Data span from: {weather[0].datetime.toDateString()} -
            {weather[weather.length - 1].datetime.toDateString()} (excluding
            June, July, August)
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
        </aside>
        <br />
        <aside>
          <h2>Theoretical explanation</h2>
          <ol>
            <li>
              Heat loss is directly proportional to heating degrees so by using
              historical weather data in Ottawa we can identify both <b>(1)</b>{' '}
              the proportion of days that you will be within a temperature
              window and <b>(2)</b> the aproximate proportion of energy will be
              used at the given temperature window
            </li>
            <li>
              By providing your natural gas consumption and furnace efficiency
              we can convert it to kwh and use that as a baseline for the amount
              of energy you would otherwise consume with a resitive heat system
              (baseboard heat){' '}
            </li>
            <li>
              By providing the heat pump COPs we simply need to divide the heat
              energy needed for a given threshold by the COP at that temperature
              to find the amount of kwh needed for the given heat pump to heat
              your home at for that range in the average year{' '}
            </li>
          </ol>
          <ul>
            <h3>Assumptions</h3>
            <li>
              This calculator does not consider heatpump capacity and the use of
              auxiliary heat, it assumes your heatpump provides enough heat at
              all temperatures
            </li>
          </ul>
          <p></p>

          <p>
            <i>
              Data was pulled from{' '}
              <a target="_blank" href="http://visualcrossing.com">
                visualcrossing.com
              </a>{' '}
              for years 2019-2023
            </i>
          </p>
        </aside>
      </article>
      <section>
        <h2>Gas to Hydro</h2>
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
        <h2>Heating Design Load</h2>
        <p>
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

        <p>Equivalent energy in kwh: {kwhEquivalent}</p>

        <p>Cost of natural gas: ${costGas * gasUsage}</p>
        <p>Cost of resistive heat: ${Math.round(kwhEquivalent * costKwh)}</p>
        <p>
          Consumption of heat pump:{' '}
          {rows.reduce((acc, row) => acc + row.heatPumpKwhConsumed, 0)}kwh
        </p>
        <p>
          Consumption of aux:{' '}
          {rows.reduce((acc, row) => acc + row.resistiveKwhConsumed, 0)}kwh
        </p>
        <p>
          Consumption of heat pump + aux:{' '}
          {rows.reduce(
            (acc, row) =>
              acc + row.heatPumpKwhConsumed + row.resistiveKwhConsumed,
            0
          )}
          kwh
        </p>
        <p>
          Cost of heatpump + aux: $
          {Math.round(
            rows.reduce(
              (acc, { heatPumpKwhConsumed, resistiveKwhConsumed }) =>
                acc + heatPumpKwhConsumed + resistiveKwhConsumed,
              0
            ) * costKwh
          )}
        </p>

        <table>
          <thead>
            <td>Threshold °C</td>
            <td>% of days / heating degree</td>
            <td>Energy Consumption</td>
            <td>COP at temp</td>
            <td>BTU at temp</td>
          </thead>
          {rows.map((val, i) => {
            const daysBelowNum = val.num;
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
                <td>{`HP: ${val.heatPumpEnergy} KWH | AUX:${val.resistiveKwhConsumed}KWH`}</td>
                <td>
                  <input
                    type="number"
                    value={cop[i]}
                    onChange={(v) => {
                      doCopChange(Number(v.currentTarget.value), i);
                    }}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={cap[i]}
                    onChange={(v) => {
                      doCapChange(Number(v.currentTarget.value), i);
                    }}
                  />
                </td>
              </tr>
            );
          })}
        </table>
      </section>
    </main>
  );

  function getRows(thresholds: Number[], weather: DailyWeather[]) {
    return thresholds.map((val, i) => {
      const max = val;
      const min = thresholds[i + 1] || -100;
      const daysBelow = weather.filter(
        (day) => day.tempmin <= max && day.tempmin > min
      );

      const heatingDelta = daysBelow.reduce((acc, day, j) => {
        return acc + (indoor - (day.tempmax + day.tempmin) / 2);
      }, 0);

      const { resistiveKwhConsumed, heatPumpKwhConsumed } = daysBelow.reduce(
        (acc, day, j) => {
          const { resistiveHeat: dayResitiveKwh, heatPump: dayHeatPumpKwh } =
            getEnergySource(day, cap[i], cop[i]);

          return {
            resistiveKwhConsumed: acc.resistiveKwhConsumed + dayResitiveKwh,
            heatPumpKwhConsumed: acc.heatPumpKwhConsumed + dayHeatPumpKwh,
          };
        },
        { resistiveKwhConsumed: 0, heatPumpKwhConsumed: 0 }
      );

      const daysBelowNum = daysBelow.length;
      const percent = Number(daysBelowNum / totalDays);
      const heatingDeltaPercent = Number(heatingDelta / heatingDegrees);

      const resitiveEnergy = Math.round(
        (heatingDelta / heatingDegrees) * kwhEquivalent
      );
      const gas = Math.round(gasUsage * (heatingDelta / heatingDegrees));
      const heatPumpEnergy = Math.round(
        ((heatingDelta / heatingDegrees) * kwhEquivalent) / cop[i]
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
  ): { resistiveHeat: number; heatPump: number } {
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
    // console.log(btusAtTemp);
    return {
      resistiveHeat,
      heatPump,
    };
  }
}
