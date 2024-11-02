import { Row, Heatpump, ChartDataPoint } from '../types'
import { getDesignLoadAtTemp } from './calculations'

export function getChartData(
    rows: Row[],
    heatpump: Heatpump,
    indoor: number,
    designTemp: number,
    designBtu: number
): ChartDataPoint[] {
    const thresholds = rows.map((row) => row.threshold)
    const capValues = heatpump.cap
    const copValues = heatpump.cop

    console.log('rows', rows)
    const dataPoints = thresholds.map((threshold, index) => ({
        temperature: threshold,
        cap: capValues[index],
        cop: copValues[index],
        design: getDesignLoadAtTemp(threshold, indoor, designTemp, designBtu),
    }))

    // Find intersection points
    const intersectionPoints = new Set(
        dataPoints
            .filter((point, index) => {
                if (index === 0) return false
                const prev = dataPoints[index - 1]
                return (
                    (point.cap >= point.design && prev.cap < prev.design) ||
                    (point.cap <= point.design && prev.cap > prev.design)
                )
            })
            .map(point => point.temperature)
    )

    // Mark intersection points in the data
    return dataPoints.map(point => ({
        ...point,
        isIntersection: intersectionPoints.has(point.temperature)
    }))
}

export function getMultipleChartData(
    rows: Row[],
    heatpumps: Heatpump[],
    indoor: number,
    designTemp: number,
    designBtu: number
): ChartDataPoint[] {
    // Get the base data points from the first heat pump
    const baseData = getChartData(rows, heatpumps[0], indoor, designTemp, designBtu)

    // Add additional heat pump data to each point
    return baseData.map((point, i) => {
        const enhancedPoint: ChartDataPoint = {
            temperature: point.temperature,
            cap: point.cap,
            cop: point.cop,
            design: point.design,
            isIntersection: point.isIntersection
        }

        // Add data for each heat pump
        heatpumps.forEach((heatpump, index) => {
            const capacity = heatpump.cap[i]
            const required = point.design

            enhancedPoint[`heatpump-${index}-cap`] = capacity
            enhancedPoint[`heatpump-${index}-cop`] = heatpump.cop[i]

            // Calculate auxiliary heat requirement - this should be the difference
            // between required heat and capacity when capacity is insufficient
            enhancedPoint[`heatpump-${index}-aux`] =
                capacity < required ? required - capacity : 0
        })

        return enhancedPoint
    })
}