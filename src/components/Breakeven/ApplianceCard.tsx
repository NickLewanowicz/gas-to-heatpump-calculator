import React from 'react'
import { Space, Switch, Tooltip, InputNumber, Button, Typography, Select } from 'antd'
import {
    SettingOutlined,
    InfoCircleOutlined,
    FireOutlined,
    ThunderboltOutlined
} from '@ant-design/icons'
import { FuelType } from '../../types'

const { Text } = Typography

type InputConfig = {
    type: 'select' | 'number' | 'readonly'
    options?: Array<{ value: number; label: string }>
    min?: number
    max?: number
    tooltip?: string
}

interface ApplianceCardProps {
    title: string
    enabled: boolean
    onToggle: (checked: boolean) => void
    tooltip: string
    fuelType: FuelType
    usage?: {
        value: number
        onChange: (value: number) => void
        unit: string
        inputConfig: InputConfig
    }
    gasSystem: {
        efficiency: number
        onEfficiencyChange: (value: number) => void
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

const cardSectionStyle = {
    ...systemPanelStyle,
    flex: '1 1 300px',
    minWidth: '300px',
    marginTop: 0
}

const disabledSystemStyle = {
    ...cardSectionStyle,
    background: '#fafafa',
    opacity: 0.65
}

const statsBoxStyle = {
    padding: '8px 12px',
    background: '#fafafa',
    borderRadius: '6px',
    marginTop: '8px'
}

const ValueInput: React.FC<{
    config?: InputConfig
    value: number
    onChange: (value: number) => void
    unit: string
}> = ({ config, value, onChange, unit }) => {
    if (!config || config.type === 'readonly') {
        return (
            <Text style={{ fontSize: '14px', color: 'rgba(0, 0, 0, 0.65)' }}>
                {value.toLocaleString()} {unit}
            </Text>
        )
    }

    if (config.type === 'select' && config.options) {
        return (
            <Space>
                <Select
                    value={value}
                    onChange={onChange}
                    options={config.options}
                    style={{ width: 120 }}
                />
                {config.tooltip && (
                    <Tooltip title={config.tooltip}>
                        <InfoCircleOutlined style={{ color: '#8c8c8c' }} />
                    </Tooltip>
                )}
            </Space>
        )
    }

    if (config.type === 'number') {
        return (
            <Space>
                <InputNumber
                    value={value}
                    onChange={val => onChange(val || config.min || 0)}
                    min={config.min}
                    max={config.max}
                    addonAfter={unit}
                    style={{ width: 150 }}
                />
                {config.tooltip && (
                    <Tooltip title={config.tooltip}>
                        <InfoCircleOutlined style={{ color: '#8c8c8c' }} />
                    </Tooltip>
                )}
            </Space>
        )
    }

    return null
}

export const ApplianceCard: React.FC<ApplianceCardProps> = ({
    title,
    enabled,
    onToggle,
    tooltip,
    fuelType,
    usage,
    gasSystem,
    electricSystem,
    stats
}) => {
    const fuelLabel = fuelType === FuelType.NATURAL_GAS ? 'Gas' : fuelType.charAt(0).toUpperCase() + fuelType.slice(1).toLowerCase()

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
                                width: '85px',
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

                {enabled && (
                    <>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                            {/* Usage Input */}
                            {usage && (
                                <div style={cardSectionStyle}>
                                    <Space direction="vertical" size="small" style={{ width: '100%' }}>
                                        <Text strong style={{ fontSize: '14px' }}>Usage</Text>
                                        <Space align="center">
                                            <ValueInput
                                                config={usage.inputConfig}
                                                value={usage.value}
                                                onChange={usage.onChange}
                                                unit={usage.unit}
                                            />
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
                                    </Space>
                                </div>
                            )}

                            {/* Current Fuel System */}
                            <div style={cardSectionStyle}>
                                <Space direction="vertical" size="small" style={{ width: '100%' }}>
                                    <Space size="small">
                                        <FireOutlined style={{
                                            fontSize: '16px',
                                            color: enabled ? '#cf1322' : '#d9d9d9'
                                        }} />
                                        <Text strong style={{ fontSize: '14px' }}>Current {fuelLabel} System</Text>
                                    </Space>
                                    {!enabled && (
                                        <Text type="secondary">Enable above if you use {fuelLabel.toLowerCase()} for {title.toLowerCase()}</Text>
                                    )}
                                    {enabled && (
                                        <Space wrap>
                                            <Text type="secondary">{fuelLabel} Efficiency:</Text>
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
                                    )}
                                </Space>
                            </div>

                            {/* Electric Alternative */}
                            <div style={cardSectionStyle}>
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
                                                style={{ width: '100px' }}
                                            />
                                        </Space>
                                    </Space>
                                </Space>
                            </div>
                        </div>

                        {/* Stats Box */}
                        <div style={statsBoxStyle}>
                            <Space direction="vertical" size="small" style={{ width: '100%' }}>
                                <Text type="secondary">{stats.gasInput}</Text>
                                <Text type="secondary">{stats.heatOutput}</Text>
                                <Text type="secondary">{stats.electricInput}</Text>
                            </Space>
                        </div>
                    </>
                )}
            </Space>
        </div>
    )
} 