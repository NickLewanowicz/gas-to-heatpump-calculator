import { FuelType, SeasonView } from '../types'

export const DEFAULTS = {
    CITY: 'Ottawa',
    YEAR: 2022,
    SEASON_VIEW: 'heating' as SeasonView,
    COST_ELECTRICITY: 0.10,  // $0.10 per kWh
    COST_GAS: 0.45,         // $0.45 per m³
    FUEL_USAGE: 1300,       // 1300 m³
    FURNACE_EFFICIENCY: 0.96, // 96%
    FUEL_TYPE: FuelType.NATURAL_GAS,
    INDOOR_TEMP: 21,        // 21°C
    DESIGN_TEMP: -30,       // -30°C
    DESIGN_BTU: 48000,      // 48,000 BTU
} 