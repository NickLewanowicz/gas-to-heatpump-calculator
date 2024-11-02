import React from 'react'
import { Heatpump, Row } from '../../types'
import { Table, Input, Button, Card, Space, theme, Typography, Tabs } from 'antd'
import { PlusOutlined, MinusOutlined, EditOutlined } from '@ant-design/icons'

interface HeatPumpInputTableProps {
    heatpumps: Heatpump[]
    selected: number
    setSelected: (index: number) => void
    addHeatpump: (heatpump: Heatpump) => void
    removeHeatpump: (index: number) => void
    updateHeatpump: (index: number, updatedHeatpump: Partial<Heatpump>) => void
    rows: Row[]
    indoor: number
    designBtu: number
}

export const HeatPumpInputTable: React.FC<HeatPumpInputTableProps> = ({
    heatpumps,
    selected,
    setSelected,
    addHeatpump,
    removeHeatpump,
    updateHeatpump,
    rows,
    indoor,
    designBtu,
}) => {
    const { token } = theme.useToken()

    const newHeatpump = (): Heatpump => ({
        name: `Heatpump #${heatpumps.length + 1}`,
        cap: [35000, 35000, 24000, 28000, 16000, 0],
        cop: [3.5, 3, 2, 1.8, 1.2, 1],
    })

    const columns = [
        {
            title: 'Temp °C / BTUs',
            dataIndex: 'temp',
            key: 'temp',
            render: (_, record) => (
                <>
                    {`${record.max} °C`} <br />
                    {Math.round((designBtu / (indoor - -30)) * (indoor - record.max))} BTUs
                </>
            ),
        },
        {
            title: 'COP at temp',
            dataIndex: 'cop',
            key: 'cop',
            render: (_, record, index) => (
                <Input
                    type="number"
                    value={heatpumps[selected].cop[index] || ''}
                    onChange={(e) => {
                        let updated = { ...heatpumps[selected] }
                        updated.cop[index] = e.target.value === '' ? undefined : Number(e.target.value)
                        updateHeatpump(selected, updated)
                    }}
                />
            ),
        },
        {
            title: 'BTU at temp',
            dataIndex: 'btu',
            key: 'btu',
            render: (_, record, index) => (
                <Input
                    type="number"
                    value={heatpumps[selected].cap[index] || ''}
                    onChange={(e) => {
                        let updated = { ...heatpumps[selected] }
                        updated.cap[index] = e.target.value === '' ? undefined : Number(e.target.value)
                        updateHeatpump(selected, updated)
                    }}
                />
            ),
        },
    ]

    const [editingIndex, setEditingIndex] = React.useState<number | null>(null)

    const handleNameChange = (index: number, newName: string) => {
        const updated = { ...heatpumps[index], name: newName }
        updateHeatpump(index, updated)
    }

    const items = heatpumps.map((heatpump, index) => ({
        key: index.toString(),
        label: (
            <Space>
                {editingIndex === index ? (
                    <Input
                        value={heatpump.name}
                        onChange={(e) => handleNameChange(index, e.target.value)}
                        onBlur={() => setEditingIndex(null)}
                        style={{ width: '150px' }}
                    />
                ) : (
                    <span>{heatpump.name}</span>
                )}
                {selected === index && (
                    <Button
                        type="text"
                        icon={<EditOutlined />}
                        onClick={() => setEditingIndex(index)}
                        size="small"
                        style={{ padding: 0, marginLeft: 4, color: 'gray' }}
                    />
                )}
            </Space>
        ),
        children: (
            <Table
                size="small"
                pagination={false}
                style={{
                    background: token.colorBgContainer,
                    color: token.colorTextSecondary
                }}
                columns={columns}
                dataSource={rows}
                rowKey="index"
                scroll={{ y: 400 }}
            />
        )
    }))

    return (
        <Space
            direction="vertical"
            style={{
                width: '100%',
                height: '100%',
                overflow: 'hidden',
                display: 'flex'
            }}
            size="large"
        >
            <Tabs
                activeKey={selected.toString()}
                items={items}
                onChange={(key) => setSelected(Number(key))}
                style={{
                    flex: 1,
                    overflow: 'hidden'
                }}
                tabBarStyle={{
                    margin: 0,
                    whiteSpace: 'nowrap',
                    overflow: 'auto',
                    scrollbarWidth: 'none',

                }}
                tabBarExtraContent={{
                    right: (
                        <Space style={{ flexShrink: 0 }}>
                            <Button
                                type="text"
                                icon={<PlusOutlined />}
                                onClick={() => addHeatpump(newHeatpump())}
                                size="small"
                                title="Add Heat Pump"
                            />
                            {heatpumps.length > 1 && (
                                <Button
                                    type="text"
                                    icon={<MinusOutlined />}
                                    onClick={() => {
                                        removeHeatpump(selected)
                                        selected >= heatpumps.length - 1 && setSelected(0)
                                    }}
                                    size="small"
                                    title="Remove Heat Pump"
                                />
                            )}
                        </Space>
                    ),
                }}
            />
        </Space>
    )
}
