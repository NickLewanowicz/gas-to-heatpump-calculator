# Heat Pump Calculator

A comprehensive tool for estimating energy and cost savings when transitioning from traditional heating systems to heat pumps.

## Features

### Cost Analysis

- Compare operating costs between existing heating systems and heat pumps
- Support for different fuel types (Natural Gas, Oil, Propane)
- Detailed breakdown of energy consumption and costs
- Dual fuel analysis with both electric and fossil fuel backup options

### Performance Analysis

- Temperature-based performance modeling
- Detailed consumption breakdown by temperature ranges
- Visual capacity charts showing heat pump performance
- COP (Coefficient of Performance) analysis across temperature ranges

### Customization

- Support for multiple heat pump configurations
- Adjustable indoor temperature settings
- Custom utility rates (electricity and fuel costs)
- Furnace efficiency considerations

## How It Works

### Weather Data

The calculator uses historical weather data from 25 cities to model heating requirements throughout the year (excluding June, July, August). This data helps predict:

1. The proportion of time your location spends in different temperature ranges
2. The heating energy required for each temperature range

### Energy Calculations

The calculator uses several key principles to estimate energy usage:

1. **Heat Loss Analysis**: Uses heating degree days to determine energy requirements at different temperatures, providing:

   - Proportion of days within each temperature window
   - Approximate energy usage per temperature range

2. **Baseline Conversion**: Converts your current fuel consumption (e.g., natural gas) to kWh equivalent, establishing a baseline for comparison with electric heating systems

3. **Heat Pump Performance**: Calculates energy consumption by:

   - Using heat pump COP (Coefficient of Performance) values at different temperatures
   - Dividing required heat energy by the COP to determine electrical consumption
   - Accounting for supplemental heating when heat pump capacity is insufficient

4. **Daily Energy Distribution**: Determines daily energy requirements based on:
   - Proportion of heating degree days
   - Temperature-specific heat pump performance
   - Supplemental heating requirements

## Getting Started

1. Enter your current heating system details:

   - Annual fuel consumption
   - Fuel type
   - Furnace efficiency
   - Utility rates

2. Configure heat pump settings:

   - Performance specifications (COP and capacity at different temperatures)
   - Indoor temperature preference
   - Backup heating preferences

3. Review the results:
   - Cost comparisons
   - Energy consumption breakdown
   - Performance analysis
   - Temperature-based efficiency data

## Contributing

We welcome contributions to improve the calculator! Some areas for potential enhancement:

1. Additional regional weather data
2. Support for more heating system types
3. Enhanced visualization options
4. Additional energy calculation models
