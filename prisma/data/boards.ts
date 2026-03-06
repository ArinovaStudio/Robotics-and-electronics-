const developmentBoards = {
    parent: { name: "Development Boards", description: "Microcontrollers and Core Boards" },
    subcategories: [
        {
            name: "Core Development Boards",
            products: [
            { title: "Arduino Uno (Clone - CH340)", sku: "DEV-001", price: 499, salePrice: 399 },
            { title: "NodeMCU (ESP8266)", sku: "DEV-002", price: 299, salePrice: 249 },
            { title: "ESP32 Dev Board", sku: "DEV-003", price: 399, salePrice: 349 },
            { title: "Raspberry Pi Pico", sku: "DEV-004", price: 459, salePrice: null },
            { title: "ESP32 Dev Board", sku: "DEV-005", price: 999, salePrice: 699 },
            ]
        },
        {
            name: "Microcontroller ICs",
            products: [
            { title: "ATmega328P (DIP)", sku: "IC-001", price: 150, salePrice: 130 },
            { title: "ATmega16", sku: "IC-002", price: 90, salePrice: null },
            { title: "ATmega8", sku: "IC-003", price: 139, salePrice: 99 },
            { title: "ATtiny85", sku: "IC-004", price: 59, salePrice: null },
            { title: "PIC16F877A", sku: "IC-005", price: 79, salePrice: 19 },
            ]
        },
        {
            name: "Programmers & USB Interfaces",
            products: [
            { title: "USBasp AVR Programmer", sku: "PRG-011", price: 250, salePrice: 199 },
            { title: "USB to TTL (CH340)", sku: "PRG-012", price: 120, salePrice: 99 },
            { title: "FTDI FT232RL Module", sku: "PRG-013", price: 220, salePrice: 189 },
            { title: "ESP-01 USB Programmer", sku: "PRG-014", price: 110, salePrice: null },
            { title: "CP2102 USB to Serial", sku: "PRG-015", price: 150, salePrice: 129 },
            ]
        },
        {
            name: "Wireless Modules",
            products: [
            { title: "ESP8266 ESP-01", sku: "WRL-016", price: 120, salePrice: 99 },
            { title: "ESP-12E Module", sku: "WRL-017", price: 160, salePrice: 139 },
            { title: "HC-05 Bluetooth", sku: "WRL-018", price: 220, salePrice: 189 },
            { title: "HC-06 Bluetooth", sku: "WRL-019", price: 200, salePrice: 169 },
            { title: "NRF24L01 RF", sku: "WRL-020", price: 140, salePrice: 119 },
            ]
        },
        {
            name: "Small Dev Boards",
            products: [
            { title: "STM32 Blue Pill", sku: "DEV-021", price: 250, salePrice: 219 },
            { title: "Arduino Pro Mini", sku: "DEV-022", price: 180, salePrice: 149 },
            { title: "ESP32-CAM", sku: "DEV-023", price: 450, salePrice: 399 },
            { title: "Digispark ATtiny85", sku: "DEV-024", price: 150, salePrice: 129 },
            { title: "Raspberry Pi Pico W", sku: "DEV-025", price: 550, salePrice: 499 },
            ]
        },
        {
            name: "Expansion & Power Board",
            products: [
            { title: "Arduino Nano Expansion Board", sku: "EXP-026", price: 180, salePrice: 149 },
            { title: "NodeMCU Expansion Board", sku: "EXP-027", price: 200, salePrice: 169 },
            { title: "ESP32 Expansion Board", sku: "EXP-028", price: 220, salePrice: 189 },
            { title: "Arduino Nano Expansion Board", sku: "EXP-029", price: 180, salePrice: 149 },
            { title: "Breadboard Power Supply (MB102)", sku: "EXP-030", price: 120, salePrice: 99 },
            ]
        }
    ]
};

export default developmentBoards;