import React from 'react'
import { Card, Table, Input, Button, Space, Tabs } from 'antd'
import { PlusOutlined, MinusOutlined } from '@ant-design/icons'
import { useApp } from '../../context/AppContext'

export const HeatPumpSettings = () => {
    const {
        heatpumps,
        addHeatpump,
        removeHeatpump,
        updateHeatpump,
        selected,
        setSelected,
        indoor,
        designBtu,
    } = useApp()

    const newHeatpump = () => ({
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

    const rows = [
        { max: indoor },
        { max: 8.33 },
        { max: -8.33 },
        { max: -15 },
        { max: -30 },
    ]

    const items = heatpumps.map((heatpump, index) => ({
        key: index.toString(),
        label: (
            <Input
                value={heatpump.name}
                onChange={(e) => {
                    let updated = { ...heatpump }
                    updated.name = e.target.value
                    updateHeatpump(index, updated)
                }}
                style={{ width: 120 }}
            />
        ),
        children: (
            <Table
                dataSource={rows}
                columns={columns}
                pagination={false}
                size="small"
            />
        ),
    }))

    return (
        <Card title="Heat Pump Settings">
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
        </Card>
    )
} 