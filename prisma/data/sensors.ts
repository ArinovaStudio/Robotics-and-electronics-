const sensorsCategory = {
  parent: {  name: "Sensors", description: "Environmental, Motion, and Distance sensors" },
  subcategories: [
    {
      name: "Temperature & Environment Sensors",
      products: [
        { title: "DHT11 Temperature & Humidity", sku: "SEN-001", price: 90, salePrice: 75 },
        { title: "DHT22 (AM2302)", sku: "SEN-002", price: 180, salePrice: 160 },
        { title: "LM35 Temperature Sensor", sku: "SEN-003", price: 60, salePrice: 49 },
        { title: "BMP280 Pressure Sensor", sku: "SEN-004", price: 220, salePrice: 199 },
        { title: "MQ-2 Gas Sensor", sku: "SEN-005", price: 150, salePrice: 129 },
      ]
    },
    {
      name: "Distance & Motion Sensors",
      products: [
        { title: "HC-SR04 Ultrasonic Sensor", sku: "SEN-006", price: 75, salePrice: 65 },
        { title: "IR Obstacle Sensor", sku: "SEN-007", price: 70, salePrice: 59 },
        { title: "PIR Motion Sensor (HC-SR501)", sku: "SEN-008", price: 110, salePrice: 95 },
        { title: "TCRT5000 IR Line Sensor", sku: "SEN-009", price: 85, salePrice: 70 },
        { title: "VL53L0X Laser ToF Sensor", sku: "SEN-010", price: 420, salePrice: 389 },
      ]
    },
    {
      name: "Sound, Light & Basic Sensors",
      products: [
        { title: "Sound Sensor Module", sku: "SEN-011", price: 90, salePrice: 75 },
        { title: "LDR Module", sku: "SEN-012", price: 50, salePrice: 39 },
        { title: "Flame Sensor", sku: "SEN-013", price: 80, salePrice: 69 },
        { title: "Rain Sensor", sku: "SEN-014", price: 120, salePrice: 99 },
        { title: "Soil Moisture Sensor", sku: "SEN-015", price: 70, salePrice: 59 },
      ]
    },
    {
      name: "Advanced & Trending Sensors",
      products: [
        { title: "MPU6050 (Gyro + Accelerometer)", sku: "SEN-016", price: 180, salePrice: 159 },
        { title: "ADXL345 Accelerometer", sku: "SEN-017", price: 220, salePrice: 199 },
        { title: "MAX30100 Pulse Sensor", sku: "SEN-018", price: 350, salePrice: 320 },
        { title: "ACS712 Current Sensor", sku: "SEN-019", price: 150, salePrice: 129 },
        { title: "INA219 Current Sensor", sku: "SEN-020", price: 200, salePrice: 179 },
      ]
    }
  ]
};

export default sensorsCategory;