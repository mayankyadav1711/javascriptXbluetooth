const deviceImages = {
  "realme buds":
    "https://rukminim2.flixcart.com/image/416/416/kt0enww0/headphone/q/8/9/rma2008-realme-original-imag6ge7xabedfhg.jpeg?q=70&crop=false",
  "Toad One Plus":
    "https://www.portronics.com/cdn/shop/products/1200x1200-1_dd9bf964-bdce-4013-b5aa-6cddce7a3396_4000x.progressive.jpg?v=1664003603",
  "iPhone 15 Pro":
    "https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/iphone-15-pro-finish-select-202309-6-1inch-naturaltitanium?wid=5120&hei=2880&fmt=webp&qlt=70&.v=VW44dkRidm5wazhwcGxtL0cyaEJ2VTkrNXBUdUJSK1k4NE5seUtJaW80ZEk5aWVjRmFBS2tnWEF6QzlCMm5HL0pOZTBYalh5Vk90cEc1K2wwRzFGejRMeXJHUnUva2huMjl4akFHOXNwVjA0YXFmK3VWSWZuRE9oVEFyUFR0T2hBa0RRdWFDUTBBczVnS0JqV3BGbkxRPT0=&traceId=1",
  // You can add more devices and their respective image urls
};

document.addEventListener("DOMContentLoaded", () => {
  const button = document.getElementById("getDetails");
  const details = document.getElementById("details");

  button.addEventListener("click", async () => {
    try {
      // Request the Bluetooth device through browser
      const device = await navigator.bluetooth.requestDevice({
        optionalServices: ["battery_service", "device_information"],
        acceptAllDevices: true,
      });

      // Connect to the GATT server
      // We also get the name of the Bluetooth device here
      let deviceName = device.gatt.device.name;
      const imageUrl =
        deviceImages[deviceName] ||
        "https://cdn3d.iconscout.com/3d/premium/thumb/bluetooth-2997166-2516204.png";
      const server = await device.gatt.connect();

      // Getting the services we mentioned before through GATT server
      const batteryService = await server.getPrimaryService("battery_service");
      const infoService = await server.getPrimaryService("device_information");

      // Getting the current battery level
      const batteryLevelCharacteristic = await batteryService.getCharacteristic(
        "battery_level"
      );
      // Convert received buffer to number
      const batteryLevel = await batteryLevelCharacteristic.readValue();
      const batteryPercent = await batteryLevel.getUint8(0);

      // Getting device information
      // We will get all characteristics from device_information
      const infoCharacteristics = await infoService.getCharacteristics();
      console.log(infoCharacteristics);
      let infoValues = [];
      const promise = new Promise((resolve, reject) => {
        infoCharacteristics.forEach(async (characteristic, index, array) => {
          // Returns a buffer
          const value = await characteristic.readValue();
          console.log(new TextDecoder().decode(value));
          // Convert the buffer to string
          infoValues.push(new TextDecoder().decode(value));
          if (index === array.length - 1) resolve();
        });
      });

      promise.then(() => {
        // Display all the information on the screen
        // use innerHTML
        document.getElementById("deviceImage").src = imageUrl;

        details.innerHTML = `
      <h2>Device Name - ${deviceName}</h2>
            <h2>Battery Level - ${batteryPercent}%</h2>
            <h3>Device Information:</h3>
            <ul>
              ${infoValues.map((value) => `<li>${value}</li>`).join("")}
            </ul>
          `;
      });
    } catch (err) {
      console.error(err);
      alert("An error occurred while fetching device details");
    }
  });
});
