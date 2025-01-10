import React from 'react'
import { Typography, Card, Row, Col, Space, Button } from 'antd'
import { CalculatorOutlined, PercentageOutlined, LineChartOutlined } from '@ant-design/icons'
import { Link } from 'react-router-dom'

const { Title, Paragraph } = Typography

export const Home = () => {
    return (
        <div style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
                <Typography>
                    <Title>Heat Pump Calculator</Title>
                    <Paragraph>
                        This tool helps you evaluate the potential benefits of switching from a fossil fuel heating system
                        to a heat pump by analyzing real weather data and system performance characteristics.
                    </Paragraph>
                </Typography>

                <Row gutter={[24, 24]}>
                    <Col xs={24} md={8}>
                        <Card
                            title={
                                <Space>
                                    <CalculatorOutlined />
                                    System Comparison
                                </Space>
                            }
                            extra={<Link to="/compare"><Button type="link">Open</Button></Link>}
                        >
                            <Paragraph>
                                Compare your current heating system with a heat pump by:
                            </Paragraph>
                            <ul>
                                <li>Analyzing energy consumption patterns</li>
                                <li>Calculating operating costs</li>
                                <li>Evaluating heat pump performance at different temperatures</li>
                                <li>Understanding seasonal efficiency variations</li>
                            </ul>
                        </Card>
                    </Col>

                    <Col xs={24} md={8}>
                        <Card
                            title={
                                <Space>
                                    <PercentageOutlined />
                                    Marginal Heating Cost
                                </Space>
                            }
                            extra={<Link to="/marginal"><Button type="link">Open</Button></Link>}
                        >
                            <Paragraph>
                                Calculate potential savings from temperature setbacks:
                            </Paragraph>
                            <ul>
                                <li>Analyze savings from lowering thermostat</li>
                                <li>Compare 24/7 vs overnight setbacks</li>
                                <li>View heating degree hours by month</li>
                                <li>Explore daily and hourly breakdowns</li>
                            </ul>
                        </Card>
                    </Col>

                    <Col xs={24} md={8}>
                        <Card
                            title={
                                <Space>
                                    <LineChartOutlined />
                                    Breakeven Analysis
                                </Space>
                            }
                            extra={<Button type="link" disabled>Coming Soon</Button>}
                        >
                            <Paragraph>
                                Coming soon - Analyze the long-term financial impact:
                            </Paragraph>
                            <ul>
                                <li>Calculate payback period</li>
                                <li>Compare installation costs</li>
                                <li>Evaluate financing options</li>
                                <li>Project long-term savings</li>
                            </ul>
                        </Card>
                    </Col>
                </Row>

                <Card title="How It Works">
                    <Row gutter={[24, 24]}>
                        <Col xs={24} md={12}>
                            <Title level={4}>Data-Driven Analysis</Title>
                            <Paragraph>
                                Our calculator uses historical weather data to provide accurate
                                heating requirement calculations based on real temperature patterns in your area.
                            </Paragraph>
                        </Col>
                        <Col xs={24} md={12}>
                            <Title level={4}>Customizable Inputs</Title>
                            <Paragraph>
                                Input your specific heating system details, fuel costs, and heat pump specifications
                                to get personalized analysis and recommendations.
                            </Paragraph>
                        </Col>
                    </Row>
                </Card>
            </Space>
        </div>
    )
} 