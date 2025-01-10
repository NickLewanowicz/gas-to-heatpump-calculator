import React from 'react'
import { Space, Typography, Divider } from 'antd'
import { FireOutlined, ThunderboltOutlined, InfoCircleOutlined } from '@ant-design/icons'

const { Text } = Typography

interface CostAnalysisProps {
    gasCost: number
    electricCost: number
    fixedCost: number
    totalSavings: number
}

const systemPanelStyle = {
    padding: '12px',
    background: 'white',
    borderRadius: '6px',
    border: '1px solid #f0f0f0',
    marginTop: '8px'
}

const highlightBoxStyle = {
    padding: '12px',
    background: '#f6ffed',
    borderRadius: '6px',
    border: '1px solid #b7eb8f',
    marginTop: '12px'
}

export const CostAnalysis: React.FC<CostAnalysisProps> = ({
    gasCost,
    electricCost,
    fixedCost,
    totalSavings
}) => {
    const energyDiff = electricCost - gasCost

    return (
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            {/* Energy Cost Comparison */}
            <div style={systemPanelStyle}>
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                    <Text strong>Annual Energy Cost Comparison</Text>
                    <Space direction="vertical" size="small" style={{ width: '100%' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Space>
                                <FireOutlined style={{ color: '#cf1322' }} />
                                <Text>Gas Energy Cost:</Text>
                            </Space>
                            <Text>${gasCost.toFixed(2)}/year</Text>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Space>
                                <ThunderboltOutlined style={{ color: '#1890ff' }} />
                                <Text>Electric Energy Cost:</Text>
                            </Space>
                            <Text>${electricCost.toFixed(2)}/year</Text>
                        </div>
                        <Divider style={{ margin: '8px 0' }} />
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Text strong>Energy Cost Difference:</Text>
                            <Text strong>
                                ${Math.abs(energyDiff).toFixed(2)} {energyDiff > 0 ? 'more' : 'less'} with electric
                            </Text>
                        </div>
                    </Space>
                </Space>
            </div>

            {/* Fixed Cost Impact */}
            <div style={systemPanelStyle}>
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                    <Text strong>Fixed Cost Impact</Text>
                    <Space direction="vertical" size="small" style={{ width: '100%' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Space>
                                <FireOutlined style={{ color: '#cf1322' }} />
                                <Text>Current Gas Fixed Costs:</Text>
                            </Space>
                            <Text>${fixedCost.toFixed(2)}/year</Text>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Space>
                                <ThunderboltOutlined style={{ color: '#1890ff' }} />
                                <Text>After Switching:</Text>
                                <InfoCircleOutlined style={{ color: '#8c8c8c' }} />
                            </Space>
                            <Text>$0.00/year</Text>
                        </div>
                        <Divider style={{ margin: '8px 0' }} />
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Text strong>Fixed Cost Savings:</Text>
                            <Text strong>${fixedCost.toFixed(2)}/year</Text>
                        </div>
                    </Space>
                </Space>
            </div>

            {/* Bottom Line */}
            <div style={highlightBoxStyle}>
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                    <Text strong style={{ fontSize: '16px' }}>Bottom Line</Text>
                    <Space direction="vertical" size="small" style={{ width: '100%' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Text>Fixed Cost Savings:</Text>
                            <Text>+${fixedCost.toFixed(2)}</Text>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Text>Energy Cost Impact:</Text>
                            <Text>{energyDiff > 0 ? '-' : '+'}${Math.abs(energyDiff).toFixed(2)}</Text>
                        </div>
                        <Divider style={{ margin: '8px 0' }} />
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Text strong style={{ fontSize: '16px' }}>Total Annual {totalSavings > 0 ? 'Savings' : 'Cost'}:</Text>
                            <Text strong style={{ fontSize: '20px', color: totalSavings > 0 ? '#52c41a' : '#ff4d4f' }}>
                                ${Math.abs(totalSavings).toFixed(2)}
                            </Text>
                        </div>
                    </Space>
                </Space>
            </div>
        </Space>
    )
} 