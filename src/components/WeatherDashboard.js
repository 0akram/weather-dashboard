import { useState } from "react";
import { Search, Trash, Cloud, Sun, CloudRain } from "lucide-react";
import { Input } from "./ui/Input";
import { Button } from "./ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/Card";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register chart components for usage in the graph
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// Weather icon component to display different weather conditions
const WeatherIcon = ({ icon }) => {
  switch (icon) {
    case "cloud":
      return <Cloud className="w-12 h-12 text-gray-600" />;
    case "sun":
      return <Sun className="w-12 h-12 text-yellow-400" />;
    case "cloud-rain":
      return <CloudRain className="w-12 h-12 text-blue-400" />;
    default:
      return <Cloud className="w-12 h-12 text-gray-600" />;
  }
};

export default function WeatherDashboard() {
  // State hooks
  const [cityInput, setCityInput] = useState(""); // City input state
  const [cities, setCities] = useState([]); // List of cities with weather data
  const [error, setError] = useState(""); // Error message for user feedback
  const [selectedCity, setSelectedCity] = useState(null); // Selected city for graph

  const apiKey = "f8afd35a480f26b4f233a7044154a9c8"; // OpenWeatherMap API Key

  // Function to fetch weather data for a city
  const fetchWeather = async (city) => {
    try {
      setError(""); // Clear previous errors

      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${apiKey}`
      );

      if (!response.ok) {
        throw new Error("City not found. Please try again.");
      }

      const data = await response.json();
      const currentWeather = {
        city: data.city.name,
        temp: data.list[0].main.temp,
        high: data.list[0].main.temp_max,
        low: data.list[0].main.temp_min,
        weather: data.list[0].weather[0].main,
        forecast: data.list
          .slice(1, 13) // Get the first 12 entries (3 days of 4 forecast intervals)
          .map((forecast) => ({
            date: new Date(forecast.dt * 1000).toLocaleDateString("en-US", {
              weekday: "short",
            }),
            high: forecast.main.temp_max,
            low: forecast.main.temp_min,
            weather: forecast.weather[0].main,
          }))
          .filter(
            // Filter to get unique dates
            (value, index, self) =>
              index === self.findIndex((t) => t.date === value.date)
          ),
      };

      setCities((prevCities) => [...prevCities, currentWeather]);
    } catch (err) {
      setError("There was an error fetching the weather data. Please try again.");
    }
  };

  // Handle adding a city and fetching its weather data
  const handleAddCity = () => {
    if (cityInput.trim() === "") {
      setError("City name cannot be empty.");
      return;
    }
    fetchWeather(cityInput);
    setCityInput(""); // Reset city input after adding
  };

  // Handle removing a city from the list
  const handleRemoveCity = (city) => {
    setCities((prevCities) => prevCities.filter((c) => c.city !== city));
    if (selectedCity && selectedCity.city === city) {
      setSelectedCity(null); // Deselect city if it is removed
    }
  };

  // Handle showing temperature trend chart for a selected city
  const handleShowChart = (city) => {
    setSelectedCity(city);
  };

  // Get the data required for rendering the temperature trend chart
  const getChartData = () => {
    if (!selectedCity) return {};

    return {
      labels: selectedCity.forecast.map((day) => day.date),
      datasets: [
        {
          label: "High Temperature (°C)",
          data: selectedCity.forecast.map((day) => day.high),
          borderColor: "rgba(255, 99, 132, 1)",
          backgroundColor: "rgba(255, 99, 132, 0.2)",
          fill: true, // Fill area under the line
          tension: 0.4, // Smooth the line
        },
        {
          label: "Low Temperature (°C)",
          data: selectedCity.forecast.map((day) => day.low),
          borderColor: "rgba(54, 162, 235, 1)",
          backgroundColor: "rgba(54, 162, 235, 0.2)",
          fill: true,
          tension: 0.4,
        },
      ],
    };
  };

  return (
    <div className="min-h-screen p-4 bg-gradient-to-br from-blue-400 to-blue-600 flex flex-col items-center">
      {/* Weather dashboard main card */}
      <Card className="w-full max-w-3xl bg-white/80 backdrop-blur-md shadow-lg rounded-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center text-gray-800">
            Weather Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* City input section */}
          <div className="flex gap-2 mb-6">
            <Input
              type="text"
              placeholder="Enter city name"
              value={cityInput}
              onChange={(e) => setCityInput(e.target.value)}
              className="flex-grow"
            />
            <Button onClick={handleAddCity} className="bg-blue-500 text-white">
              <Search className="h-4 w-4" />
            </Button>
          </div>

          {/* Display error message if there is one */}
          {error && <p className="text-red-500 text-center">{error}</p>}

          {/* Display list of cities with weather data */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {cities.map((cityData, index) => (
              <Card key={index} className="relative p-4 shadow-md rounded-lg bg-white">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold">{cityData.city}</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  {/* Display weather icon based on weather condition */}
                  <WeatherIcon icon={cityData.weather.toLowerCase()} />
                  <p className="text-2xl font-bold text-gray-800">
                    {Math.round(cityData.temp)}°C
                  </p>
                  <p className="text-gray-600">Condition: {cityData.weather}</p>
                  <p className="text-gray-600">
                    High: {Math.round(cityData.high)}°C | Low:{" "}
                    {Math.round(cityData.low)}°C
                  </p>

                  {/* Display 3-day forecast */}
                  <div>
                    {cityData.forecast.map((forecast, index) => (
                      <div key={forecast.date} className="flex justify-between mt-2">
                        <span>{forecast.date}</span>
                        <span className="text-gray-600">
                          {Math.round(forecast.high)}°C / {Math.round(forecast.low)}°C
                        </span>
                      </div>
                    ))}
                  </div>

                  <br />
                  <Button
                    onClick={() => handleShowChart(cityData)}
                    className="bg-blue-500 text-white"
                  >
                    Show Temperature Trend
                  </Button>
                </CardContent>

                {/* Button to remove city from list */}
                <Button
                  className="mt-4 absolute bottom-2 right-2 bg-red-500 text-white"
                  variant="danger"
                  onClick={() => handleRemoveCity(cityData.city)}
                >
                  <Trash />
                </Button>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Graph showing temperature trend for selected city */}
      <div className="mt-8 w-full max-w-3xl">
        <Card className="w-full max-w-3xl bg-white/80 backdrop-blur-md shadow-lg rounded-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center text-gray-800">Temperature Trend</CardTitle>
          </CardHeader>

          {selectedCity && (
            <div>
              <h3 className="text-center text-xl font-semibold text-gray-700">
                {selectedCity.city} Temperature Trend
              </h3>
              <Line data={getChartData()} options={{
                responsive: true,
                plugins: {
                  tooltip: {
                    callbacks: {
                      label: function (context) {
                        return `${context.dataset.label}: ${context.raw}°C`;
                      }
                    }
                  }
                }}
              } />
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
