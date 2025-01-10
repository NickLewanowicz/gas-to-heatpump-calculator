import React from 'react'
import { Card, Typography, Row, Col } from 'antd'
import { useApp } from '../../context/AppContext'
import type { Heatpump } from '../../types'

const { Text } = Typography

export const MarginalHeatingCost: React.FC = () => {
    const {
        costKwh: electricityRate,
        costGas: gasRate,
        furnaceEfficiency,
        heatpumps,
        selected: selectedHeatpump
    } = useApp()

    return (
        <div style={{ width: '100%', height: '100%' }}>
            {/* Current Settings Summary */}
            <Card size="small" style={{ marginBottom: '16px' }}>
                <Row gutter={[16, 8]}>
                    <Col span={12}>
                        <Text strong>Heat Pump: </Text>
                        <Text>{heatpumps[selectedHeatpump].name}</Text>
                    </Col>
                    <Col span={12}>
                        <Text strong>Electricity Rate: </Text>
                        <Text>${electricityRate}/kWh</Text>
                    </Col>
                    <Col span={12}>
                        <Text strong>Gas Rate: </Text>
                        <Text>${gasRate}/m³</Text>
                    </Col>
                    <Col span={12}>
                        <Text strong>Furnace Efficiency: </Text>
                        <Text>{(furnaceEfficiency * 100).toFixed(0)}%</Text>
                    </Col>
                </Row>
            </Card>

            {/* Rest of the component */}
            {/* ... existing content ... */}
        </div>
    )
} 