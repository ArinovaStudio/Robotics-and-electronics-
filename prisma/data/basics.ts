const basicCategory = {
  parent: {
    name: "Basic Components",
    description: "Resistors, Capacitors, and ICs"
  },
  subcategories: [
    {
      name: "Resistors, Capacitors & Passive Basics",
      products: [
        { title: "Resistor Assortment Kit (100pcs)", sku: "CMP-001", price: 199, salePrice: 149 },
        { title: "Capacitor Kit (Ceramic + Electrolytic)", sku: "CMP-002", price: 249, salePrice: 199 },
        { title: "Inductor Kit", sku: "CMP-003", price: 199, salePrice: 169 },
        { title: "Diode 1N4148", sku: "CMP-004", price: 20, salePrice: 15 },
        { title: "LED Assortment Pack", sku: "CMP-005", price: 150, salePrice: 120 },
      ]
    },
    {
      name: "Transistors & Regulators",
      products: [
        { title: "BC547 NPN Transistors", sku: "CMP-006", price: 60, salePrice: 49 },
        { title: "BC337 Transistors", sku: "CMP-007", price: 70, salePrice: 59 },
        { title: "2N2222 Transistors", sku: "CMP-008", price: 80, salePrice: 69 },
        { title: "7805 Voltage Regulator", sku: "CMP-009", price: 25, salePrice: 19 },
        { title: "LM317 Adjustable Regulator", sku: "CMP-010", price: 35, salePrice: 29 },
      ]
    },
    {
      name: "Logic ICs & Timer Chips",
      products: [
        { title: "555 Timer IC", sku: "CMP-011", price: 25, salePrice: 15 },
        { title: "74HC Logic IC Assortment", sku: "CMP-012", price: 180, salePrice: 149 },
        { title: "CD4017 Decade Counter IC", sku: "CMP-013", price: 30, salePrice: null },
        { title: "LM358 OpAmp IC", sku: "CMP-014", price: 35, salePrice: 25 },
        { title: "74HC595 Shift Register", sku: "CMP-015", price: 40, salePrice: 30 },
      ]
    },
    {
      name: "Connectors, Headers & Switches",
      products: [
        { title: "Jumper Wires (Male - Female Pack)", sku: "CMP-016", price: 120, salePrice: 99 },
        { title: "2.54mm Pin Header (Pack)", sku: "CMP-017", price: 60, salePrice: 49 },
        { title: "Tactile Push Button", sku: "CMP-018", price: 20, salePrice: 15 },
        { title: "Slide Switch", sku: "CMP-019", price: 25, salePrice: 19 },
        { title: "DC Barrel Power Jack", sku: "CMP-020", price: 30, salePrice: 24 },
      ]
    },
    {
      name: "Sensors & Small Modules (Circuit Essentials)",
      products: [
        { title: "Solderless Breadboard (MB102 type)", sku: "CMP-021", price: 120, salePrice: 99 },
        { title: "Prototype PCB Board", sku: "CMP-022", price: 80, salePrice: 65 },
        { title: "Potentiometer (Pack)", sku: "CMP-023", price: 100, salePrice: 85 },
        { title: "Tilt Sensor / Switch", sku: "CMP-024", price: 35, salePrice: 25 },
        { title: "Crystal Oscillator (16 MHz)", sku: "CMP-025", price: 40, salePrice: 30 },
      ]
    },
    {
      name: "Power & Passive Extras",
      products: [
        { title: "9V Battery Clip", sku: "CMP-026", price: 25, salePrice: 19 },
        { title: "Slide Potentiometer", sku: "CMP-027", price: 50, salePrice: 39 },
        { title: "Heat Shrink Tube Pack", sku: "CMP-028", price: 120, salePrice: 99 },
        { title: "Fuse Holder", sku: "CMP-029", price: 30, salePrice: 24 },
        { title: "Coin Cell Battery Holder", sku: "CMP-030", price: 35, salePrice: 28 },
      ]
    }
  ]
};

export default basicCategory;