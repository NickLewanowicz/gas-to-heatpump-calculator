import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Layout, Menu } from 'antd'
import { HomeOutlined, CalculatorOutlined, LineChartOutlined } from '@ant-design/icons'

const { Header } = Layout

export const Navigation = () => {
    const location = useLocation()

    const items = [
        {
            key: '/',
            label: <Link to="/">Home</Link>,
            icon: <HomeOutlined />,
        },
        {
            key: '/compare',
            label: <Link to="/compare">System Comparison</Link>,
            icon: <CalculatorOutlined />,
        },
        {
            key: '/marginal',
            label: <Link to="/marginal">Marginal Heating Cost</Link>,
            icon: <LineChartOutlined />,
        },
    ]

    return (
        <Header style={{ padding: 0 }}>
            <Menu
                theme="dark"
                mode="horizontal"
                selectedKeys={[location.pathname]}
                items={items}
                style={{ flex: 1, minWidth: 0 }}
            />
        </Header>
    )
}