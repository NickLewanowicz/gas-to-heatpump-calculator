import React from 'react'
import 'chartjs-plugin-annotation'
import {
  Chart as ChartJS,
  CategoryScale,
  Filler,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Line } from 'react-chartjs-2'


// Register the annotation plugin
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

export interface Props {
  data?: {
    labels: string[]
    datasets: ({
      label: string
      data: any
      borderColor: string
      backgroundColor: string
      yAxisID: string
    } | any)[]
  }
  duelFuelBreakeven: number
}

export function CapacityChart({ data: dataOverride, duelFuelBreakeven }: Props) {

  const options = {
    responsive: true,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    stacked: false,
    plugins: {
      annotation: {
        annotations: [
          {
            type: 'line' as const,
            mode: 'vertical' as const,
            value: 0, // Specify the x-value where you want the vertical line
            borderColor: 'red', // Line color
            borderWidth: 2, // Line width
            label: {
              content: 'Vertical Line Label', // Optional label for the line
              enabled: true,
            },
          },
        ],
      },
      title: {
        display: true,
        text: 'Heatpump Performance Chart',
      },
    },
    scales: {
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        grid: {
          drawOnChartArea: false,
        },
      },
    },
  }


  return <>{duelFuelBreakeven}<Line options={options} data={dataOverride} /></>
}
