import React from 'react'
import { Space, Switch, Tooltip, InputNumber, Button, Typography } from 'antd'
import {
    SettingOutlined,
    InfoCircleOutlined,
    FireOutlined,
    ThunderboltOutlined
} from '@ant-design/icons'
import { FuelType } from '../../types'

const { Text } = Typography

interface ApplianceCardProps {
    title: string
    enabled: boolean
    onToggle: (checked: boolean) => void
    tooltip: string
    gasSystem: {
        value: number
        efficiency: number
        onValueChange: (value: number) => void
        onEfficiencyChange: (value: number) => void
        unit: string
        valueLabel?: string
        showSettings?: boolean
    }
    electricSystem: {
        value: number
        efficiency: number
        onValueChange: (value: number) => void
        valueLabel: string
        tooltip: string
    }
    stats: {
        gasInput: string
        heatOutput: string
        electricInput: string
    }
}

const systemPanelStyle = {
    padding: '12px',
    background: 'white',
    borderRadius: '6px',
    border: '1px solid #f0f0f0',
    marginTop: '8px'
}

const disabledSystemStyle = {
    ...systemPanelStyle,
    background: '#fafafa',
    opacity: 0.65
}

const statsBoxStyle = {
    padding: '8px 12px',
    background: '#fafafa',
    borderRadius: '6px',
    marginTop: '8px'
}

export const ApplianceCard: React.FC<ApplianceCardProps> = ({
    title,
    enabled,
    onToggle,
    tooltip,
    gasSystem,
    electricSystem,
    stats
}) => {
    return (
        <div style={systemPanelStyle}>
            <Space direction="vertical" size="small" style={{ width: '100%' }}>
                {/* Header with Switch */}
                <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                    <Space size="small">
                        <Switch
                            checked={enabled}
                            onChange={onToggle}
                            style={{
                                backgroundColor: enabled ? '#ff7a45' : undefined,
                                width: '70px',
                                height: '22px'
                            }}
                            checkedChildren="Remove"
                            unCheckedChildren="Add"
                        />
                        <Text style={{ fontSize: '14px', fontWeight: 500 }}>{title}</Text>
                        <Tooltip title={tooltip}>
                            <InfoCircleOutlined style={{ color: '#8c8c8c' }} />
                        </Tooltip>
                    </Space>
                </Space>

                {/* Current Gas System */}
                <div style={enabled ? systemPanelStyle : disabledSystemStyle}>
                    <Space direction="vertical" size="small" style={{ width: '100%' }}>
                        <Space size="small">
                            <FireOutlined style={{
                                fontSize: '16px',
                                color: enabled ? '#cf1322' : '#d9d9d9'
                            }} />
                            <Text strong style={{ fontSize: '14px' }}>Current Gas System</Text>
                        </Space>
                        {!enabled && (
                            <Text type="secondary">Enable above if you use gas for {title.toLowerCase()}</Text>
                        )}
                        {enabled && (
                            <>
                                <Space align="center">
                                    <Text style={{ fontSize: '14px', color: 'rgba(0, 0, 0, 0.65)' }}>
                                        {gasSystem.value.toLocaleString()} {gasSystem.unit}
                                    </Text>
                                    {gasSystem.showSettings && (
                                        <Button
                                            type="text"
                                            size="small"
                                            icon={<SettingOutlined style={{ color: '#8c8c8c' }} />}
                                            onClick={() => document.querySelector('.ant-float-btn')?.dispatchEvent(
                                                new MouseEvent('click', { bubbles: true })
                                            )}
                                        />
                                    )}
                                </Space>
                                <Space wrap>
                                    <Text type="secondary">Gas Efficiency:</Text>
                                    <InputNumber
                                        value={gasSystem.efficiency}
                                        onChange={gasSystem.onEfficiencyChange}
                                        min={0.2}
                                        max={1}
                                        step={0.05}
                                        precision={2}
                                        addonAfter="%"
                                        formatter={value => `${(value * 100).toFixed(0)}`}
                                        parser={value => (parseFloat(value) || 0) / 100}
                                        style={{ width: '100px' }}
                                    />
                                </Space>
                            </>
                        )}
                    </Space>
                </div>

                {/* Electric Alternative */}
                {enabled && (
                    <div style={systemPanelStyle}>
                        <Space direction="vertical" size="small" style={{ width: '100%' }}>
                            <Space size="small">
                                <ThunderboltOutlined style={{
                                    fontSize: '16px',
                                    color: '#1890ff'
                                }} />
                                <Text strong style={{ fontSize: '14px' }}>{electricSystem.valueLabel}</Text>
                                <Tooltip title={electricSystem.tooltip}>
                                    <InfoCircleOutlined style={{ color: '#8c8c8c' }} />
                                </Tooltip>
                            </Space>
                            <Space size="large">
                                <Text style={{ fontSize: '14px', color: 'rgba(0, 0, 0, 0.65)' }}>Efficiency:</Text>
                                <Space>
                                    <InputNumber
                                        value={electricSystem.efficiency}
                                        onChange={electricSystem.onValueChange}
                                        min={0.6}
                                        max={4}
                                        step={0.1}
                                        precision={2}
                                        addonAfter="%"
                                        formatter={value => `${(value * 100).toFixed(0)}`}
                                        parser={value => (parseFloat(value) || 0) / 100}
                                        style={{ width: '80px' }}
                                    />
                                </Space>
                            </Space>
                        </Space>
                    </div>
                )}

                {/* Stats Box */}
                {enabled && (
                    <div style={statsBoxStyle}>
                        <Space direction="vertical" size="small" style={{ width: '100%' }}>
                            <Text type="secondary">{stats.gasInput}</Text>
                            <Text type="secondary">{stats.heatOutput}</Text>
                            <Text type="secondary">{stats.electricInput}</Text>
                        </Space>
                    </div>
                )}
            </Space>
        </div>
    )
} 