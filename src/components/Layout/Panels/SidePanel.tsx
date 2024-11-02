import React from 'react'
import { theme } from 'antd'

interface SidePanelProps {
    isVisible: boolean
    width?: number
    position: 'left' | 'right'
    children: React.ReactNode
}

export const SidePanel: React.FC<SidePanelProps> = ({
    isVisible,
    width = 320,
    position,
    children
}) => {
    const { token } = theme.useToken()

    return (
        <div style={{
            position: 'fixed',
            [position]: isVisible ? 0 : `-${width}px`,
            top: 48,
            bottom: 56,
            width,
            background: token.colorBgElevated,
            [position === 'left' ? 'borderRight' : 'borderLeft']: `1px solid ${token.colorBorder}`,
            transition: `${position} 0.3s`,
            zIndex: token.zIndexBase + 10,
            display: 'flex',
            flexDirection: 'column',
            boxShadow: isVisible ? token.boxShadowSecondary : 'none'
        }}>
            <div style={{
                flex: 1,
                overflowY: 'auto',
                padding: token.padding
            }}>
                {children}
            </div>
        </div>
    )
}
