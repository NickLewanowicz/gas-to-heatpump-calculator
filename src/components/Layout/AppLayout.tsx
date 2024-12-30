import React from 'react'
import { Layout, Button, theme, Card, Space, Typography } from 'antd'
import { HomeOutlined, ThunderboltOutlined } from '@ant-design/icons'
import { InputForm } from '../InputForm/InputForm'
import { CapacityChart } from '../CapacityChart/CapacityChart'
import { HeatPumpInputTable } from '../HeatPumpInputTable/HeatPumpInputTable'
import { Results } from '../Results/Results'
import { AppLayoutProps } from './types'
import { useMediaQuery } from '../../hooks/useMediaQuery'
import { SidePanel } from './Panels/SidePanel'
import { getMultipleChartData } from '../../utils/chartData'
import { ConsumptionBreakdown } from '../ConsumptionBreakdown/ConsumptionBreakdown'

const { Header, Content, Footer } = Layout
const { Title } = Typography

type PanelType = 'none' | 'inputs'

export const AppLayout: React.FC<AppLayoutProps> = (props) => {
    const {
        formState,
        cities,
        heatpumps,
        selected,
        setSelected,
        addHeatpump,
        removeHeatpump,
        updateHeatpump,
        rows,
        indoor,
        designTemp,
        designBtu,
        weather,
        filteredWeather,
        thresholds,
        kwhEquivalent,
        fuelUsage,
        fuelType,
        costGas,
        costKwh,
        heatingDegrees,
        getRows,
        convertToKwh
    } = props

    const isDesktop = useMediaQuery('(min-width: 1200px)')
    const { token } = theme.useToken()
    const [activePanel, setActivePanel] = React.useState<PanelType>('none')
    const [showHeatpumpInputs, setShowHeatpumpInputs] = React.useState(false)

    const handlePanelChange = (panel: PanelType) => {
        setActivePanel(panel === activePanel ? 'none' : panel)
    }

    const duelFuelBreakeven = costKwh / (costGas / (convertToKwh(fuelType, 1) * formState.furnaceEfficiency))

    // Compute magic number once at the top level
    const totalEnergy = rows.reduce(
        (acc, row) => acc + row.amountOfEnergyNeeded,
        0
    )
    const magicNumber = kwhEquivalent / totalEnergy

    return (
        <Layout style={{ minHeight: '100vh', overflowX: 'hidden', maxWidth: '100VW' }}>
            <Layout>
                <SidePanel
                    isVisible={activePanel === 'inputs'}
                    position="left"
                >
                    <InputForm
                        formState={formState}
                        cities={cities}
                        weather={weather}
                    />
                </SidePanel>

                <Layout style={{ background: token.colorBgContainer }}>
                    <Content style={{
                        position: 'fixed',
                        top: 48,
                        left: 0,
                        right: 0,
                        bottom: 56,
                        padding: isDesktop ? token.padding : '8px',
                        background: token.colorBgElevated,
                        display: 'flex',
                        flexDirection: 'column',
                        overflowY: 'auto',
                        WebkitOverflowScrolling: 'touch'
                    }}>
                        <div style={{
                            width: '100%',
                            maxWidth: isDesktop ? 1600 : '100%',
                            margin: '0 auto',
                            display: 'grid',
                            gridTemplateColumns: isDesktop ? 'minmax(320px, 400px) 1fr' : '1fr',
                            gap: token.padding,
                            minHeight: 'min-content',
                            padding: token.padding
                        }}>

                            <Results
                                rows={rows}
                                kwhEquivalent={kwhEquivalent}
                                fuelUsage={fuelUsage}
                                fuelType={fuelType}
                                costGas={costGas}
                                costKwh={costKwh}
                                heatpumps={heatpumps}
                                heatingDegrees={heatingDegrees}
                                getRows={getRows}
                                thresholds={thresholds}
                                weather={filteredWeather}
                                convertToKwh={convertToKwh}
                                magicNumber={magicNumber}
                            />
                            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                                <div style={{ maxWidth: '90VW' }}>
                                    <ConsumptionBreakdown
                                        rows={rows}
                                        heatpumps={heatpumps}
                                        selected={selected}
                                        magicNumber={magicNumber}
                                    />
                                </div>
                                <Title level={4}>Performance Analysis</Title>
                                <Card size="small">
                                    <div style={{
                                        width: '100%',
                                        overflow: 'hidden'
                                    }}>
                                        <CapacityChart
                                            data={getMultipleChartData(rows, heatpumps, indoor, designTemp, designBtu)}
                                            duelFuelBreakeven={duelFuelBreakeven}
                                            heatpumps={heatpumps}
                                            selected={selected}
                                            weather={filteredWeather}
                                        />
                                    </div>
                                </Card>
                            </Space>
                        </div>
                    </Content>

                    <Layout.Footer style={{
                        position: 'fixed',
                        bottom: 56,
                        height: showHeatpumpInputs ? 500 : 0,
                        padding: 0,
                        width: '100%',
                        background: token.colorBgElevated,
                        borderRadius: `${token.borderRadiusLG}px ${token.borderRadiusLG}px 0 0`,
                        transition: 'all 0.3s',
                        zIndex: token.zIndexBase + 10,
                        opacity: showHeatpumpInputs ? 1 : 0,
                        visibility: showHeatpumpInputs ? 'visible' : 'hidden',
                        boxShadow: token.boxShadowSecondary,
                        overflow: 'hidden'
                    }}>
                        <div style={{
                            height: '100%',
                            overflowY: 'auto',
                            padding: token.padding
                        }}>
                            <HeatPumpInputTable {...props} />
                        </div>
                    </Layout.Footer>
                </Layout>
            </Layout>

            <Footer style={{
                position: 'fixed',
                left: 0,
                right: 0,
                bottom: 0,
                height: 56,
                padding: 0,
                background: token.colorBgElevated,
                borderTop: `1px solid ${token.colorBorder}`,
                zIndex: token.zIndexBase + 11,
                display: 'flex',
                justifyContent: 'space-around',
                alignItems: 'center',
                fontSize: 'clamp(12px, 3.2vw, 14px)'
            }}>
                <Button
                    type={activePanel === 'inputs' ? 'primary' : 'text'}
                    icon={<HomeOutlined />}
                    onClick={() => handlePanelChange('inputs')}
                    style={{ fontSize: 'inherit' }}
                >
                    House
                </Button>
                <Button
                    type={showHeatpumpInputs ? 'primary' : 'text'}
                    icon={<ThunderboltOutlined />}
                    onClick={() => setShowHeatpumpInputs(!showHeatpumpInputs)}
                    style={{ fontSize: 'inherit' }}
                >
                    Heat Pump
                </Button>
            </Footer>
        </Layout>
    )
}
