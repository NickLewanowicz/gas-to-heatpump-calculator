import React from 'react'
import { Form, Select, Radio, Space } from 'antd'
import { cities, CityName } from '../../data/weather'
import { SeasonView } from '../../types'

interface LocationYearFormProps {
    city: CityName
    setCity: (city: CityName) => void
    year: number
    setYear: (year: number) => void
    seasonView: SeasonView
    setSeasonView: (view: SeasonView) => void
    availableYears: {
        value: number
        label: string
        startDate: Date
        endDate: Date
    }[]
}

export const LocationYearForm: React.FC<LocationYearFormProps> = ({
    city,
    setCity,
    year,
    setYear,
    seasonView,
    setSeasonView,
    availableYears
}) => {
    return (
        <Form layout="vertical" size="small">
            <Form.Item label="Choose a city">
                <Select
                    value={city}
                    onChange={setCity}
                    options={cities.map(city => ({ value: city, label: city }))}
                />
            </Form.Item>

            <Form.Item label="Time Period">
                <Space direction="vertical" style={{ width: '100%' }}>
                    <Radio.Group
                        value={seasonView}
                        onChange={e => setSeasonView(e.target.value)}
                        optionType="button"
                        buttonStyle="solid"
                    >
                        <Radio.Button value="heating">Heating Season</Radio.Button>
                        <Radio.Button value="calendar">Calendar Year</Radio.Button>
                    </Radio.Group>

                    <Select
                        value={year}
                        onChange={setYear}
                        options={availableYears}
                        style={{ width: '100%' }}
                    />
                </Space>
            </Form.Item>
        </Form>
    )
} 