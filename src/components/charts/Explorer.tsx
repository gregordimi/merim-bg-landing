import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronRight } from 'lucide-react';

export default function UnfoldingRelationshipVisualization() {
  const data = [
    { municipality: "", city: "", retailer: "Аптеки Марешки" },
    { municipality: "Айтос", city: "Айтос", retailer: "Билла" },
    { municipality: "Айтос", city: "Айтос", retailer: "дм България" },
    { municipality: "Айтос", city: "Айтос", retailer: "Кауфланд България" },
    { municipality: "Айтос", city: "Айтос", retailer: "Лидл България" },
    { municipality: "Айтос", city: "Айтос", retailer: "Минимарт" },
    { municipality: "Аксаково", city: "Аксаково", retailer: "НОЛЕВ" },
    { municipality: "Аксаково", city: "Аксаково", retailer: "СОФАРМАСИ" },
    { municipality: "Асеновград", city: "Асеновград", retailer: "ABC MARKET" },
    { municipality: "Асеновград", city: "Асеновград", retailer: "Бурлекс (ЦБА)" },
    { municipality: "Асеновград", city: "Асеновград", retailer: "Лидл България" },
    { municipality: "Асеновград", city: "Асеновград", retailer: "PARKMART" },
    { municipality: "Асеновград", city: "Асеновград", retailer: "Билла" },
    { municipality: "Асеновград", city: "Асеновград", retailer: "МИКРИТЕ" },
    { municipality: "Асеновград", city: "Асеновград", retailer: "Бурлекс (ЦБА)" },
    { municipality: "Асеновград", city: "Асеновград", retailer: "T Market" },
    { municipality: "Асеновград", city: "Асеновград", retailer: "БОГАТ БЕДЕН" },
    { municipality: "Балчик", city: "Балчик", retailer: "БОГАТ БЕДЕН" },
    { municipality: "Балчик", city: "Балчик", retailer: "KAM" },
    { municipality: "Балчик", city: "Балчик", retailer: "Mr.Bricolage" },
    { municipality: "Банско", city: "Банско", retailer: "Аптеки Марешки" },
    { municipality: "Банско", city: "Банско", retailer: "Аптеки Нота Бене" },
    { municipality: "Белоградчик", city: "Белоградчик", retailer: "Билла" },
    { municipality: "Белослав", city: "Белослав", retailer: "дм България" },
    { municipality: "Берковица", city: "Берковица", retailer: "Кауфланд България" },
    { municipality: "Берковица", city: "Берковица", retailer: "Лидл България" },
    { municipality: "Бързия", city: "Берковица", retailer: "Метро България" },
    { municipality: "Благоевград", city: "Благоевград", retailer: "Минимарт" },
    { municipality: "Благоевград", city: "Благоевград", retailer: "СОФАРМАСИ" },
    { municipality: "Благоевград", city: "Благоевград", retailer: "СТОМИ" },
    { municipality: "Благоевград", city: "Благоевград", retailer: "СОФАРМАСИ" },
    { municipality: "Благоевград", city: "Благоевград", retailer: "T Market" },
    { municipality: "Благоевград", city: "Благоевград", retailer: "HOT MARKET" },
    { municipality: "Благоевград", city: "Благоевград", retailer: "T Market" },
    { municipality: "Благоевград", city: "Благоевград", retailer: "Фреш Маркет" },
    { municipality: "Благоевград", city: "Благоевград", retailer: "T Market" },
    { municipality: "Благоевград", city: "Благоевград", retailer: "дм България" },
    { municipality: "Благоевград", city: "Благоевград", retailer: "Кауфланд България" },
    { municipality: "Благоевград", city: "Благоевград", retailer: "Лидл България" },
    { municipality: "Габрово", city: "Благоевград", retailer: "ФАНТАСТИКО" },
    { municipality: "Бобов дол", city: "Бобов дол", retailer: "Фреш Маркет" },
    { municipality: "Божурище", city: "Божурище", retailer: "Минимарт" },
    { municipality: "Божурище", city: "Божурище", retailer: "БОГАТ БЕДЕН" },
    { municipality: "Божурище", city: "Божурище", retailer: "BulMag" },
    { municipality: "Попово", city: "Болярово", retailer: "DOUGLAS (ДЪГЛАС)" },
    { municipality: "Ботевград", city: "Ботевград", retailer: "DS HOME" },
    { municipality: "Ботевград", city: "Ботевград", retailer: "JUMBO" },
    { municipality: "Ботевград", city: "Ботевград", retailer: "Mr.Bricolage" },
    { municipality: "Ботевград", city: "Ботевград", retailer: "PARKMART" },
    { municipality: "Ботевград", city: "Ботевград", retailer: "T Market" },
    { municipality: "Брезник", city: "Брезник", retailer: "Travel FREE" },
    { municipality: "Брусарци", city: "Брусарци", retailer: "АВАНТИ" },
    { municipality: "Бургас", city: "Бургас", retailer: "АНЕТ 3" },
    { municipality: "Бургас", city: "Бургас", retailer: "АНЕТ 4" },
    { municipality: "Бургас", city: "Бургас", retailer: "Аптеки Марешки" },
    { municipality: "Бургас", city: "Бургас", retailer: "Аптеки Нота Бене" },
  ].filter(d => d.municipality && d.city && d.retailer);

  const [selectedMunicipality, setSelectedMunicipality] = useState(null);
  const [selectedCity, setSelectedCity] = useState(null);

  // Get unique values
  const municipalities = [...new Set(data.map(d => d.municipality))].sort();

  // Get cities for selected municipality
  const getCitiesForMunicipality = (mun) => {
    return [...new Set(data.filter(d => d.municipality === mun).map(d => d.city))].sort();
  };

  // Get retailers for selected city
  const getRetailersForCity = (city) => {
    return [...new Set(data.filter(d => d.city === city).map(d => d.retailer))].sort();
  };

  const handleMunicipalitySelect = (mun) => {
    setSelectedMunicipality(mun);
    setSelectedCity(null); // Reset city selection
  };

  const handleCitySelect = (city) => {
    setSelectedCity(city);
  };

  const handleStartOver = () => {
    setSelectedMunicipality(null);
    setSelectedCity(null);
  };

  const cities = selectedMunicipality ? getCitiesForMunicipality(selectedMunicipality) : [];
  const retailers = selectedCity ? getRetailersForCity(selectedCity) : [];

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Municipality → City → Retailer Explorer</CardTitle>
          {selectedMunicipality && (
            <button
              onClick={handleStartOver}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 text-sm"
            >
              Start Over
            </button>
          )}
        </div>
        <p className="text-sm text-gray-600">Select a municipality to begin exploring</p>
      </CardHeader>
      <CardContent>
        <div className="flex gap-6 items-start">
          {/* Step 1: Municipality Selection */}
          <div className="flex-shrink-0 w-72">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold">1</div>
              <h3 className="font-semibold">Select Municipality</h3>
            </div>
            <div className="space-y-2 max-h-[500px] overflow-y-auto border rounded-lg p-3 bg-gray-50">
              {municipalities.map(mun => (
                <div
                  key={mun}
                  onClick={() => handleMunicipalitySelect(mun)}
                  className={`p-3 rounded cursor-pointer transition-all ${
                    selectedMunicipality === mun
                      ? 'bg-blue-500 text-white shadow-lg'
                      : 'bg-white hover:bg-blue-50 hover:shadow'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{mun}</span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Step 2: City Selection (only shows when municipality is selected) */}
          {selectedMunicipality && (
            <>
              <ChevronRight className="w-8 h-8 text-gray-400 mt-12 flex-shrink-0" />
              <div className="flex-shrink-0 w-72 animate-in slide-in-from-left">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center font-bold">2</div>
                  <h3 className="font-semibold">Select City</h3>
                </div>
                <div className="mb-2 text-sm text-gray-600">
                  in <span className="font-semibold text-blue-600">{selectedMunicipality}</span>
                </div>
                <div className="space-y-2 max-h-[500px] overflow-y-auto border rounded-lg p-3 bg-gray-50">
                  {cities.map(city => (
                    <div
                      key={city}
                      onClick={() => handleCitySelect(city)}
                      className={`p-3 rounded cursor-pointer transition-all ${
                        selectedCity === city
                          ? 'bg-green-500 text-white shadow-lg'
                          : 'bg-white hover:bg-green-50 hover:shadow'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{city}</span>
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Step 3: Retailers Display (only shows when city is selected) */}
          {selectedCity && (
            <>
              <ChevronRight className="w-8 h-8 text-gray-400 mt-12 flex-shrink-0" />
              <div className="flex-shrink-0 w-72 animate-in slide-in-from-left">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-full bg-purple-500 text-white flex items-center justify-center font-bold">3</div>
                  <h3 className="font-semibold">Retailers</h3>
                </div>
                <div className="mb-2 text-sm text-gray-600">
                  in <span className="font-semibold text-green-600">{selectedCity}</span>
                </div>
                <div className="space-y-2 max-h-[500px] overflow-y-auto border rounded-lg p-3 bg-gray-50">
                  {retailers.map((retailer, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded bg-purple-50 border border-purple-200"
                    >
                      <span className="font-medium text-purple-900">{retailer}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-3 p-3 bg-purple-100 rounded text-sm">
                  <span className="font-semibold">{retailers.length}</span> retailer{retailers.length !== 1 ? 's' : ''} found
                </div>
              </div>
            </>
          )}
        </div>

        {/* Breadcrumb */}
        {selectedMunicipality && (
          <div className="mt-6 p-4 bg-gray-100 rounded-lg">
            <div className="text-sm font-medium text-gray-600 mb-1">Current Selection:</div>
            <div className="flex items-center gap-2 text-lg">
              <span className="font-semibold text-blue-600">{selectedMunicipality}</span>
              {selectedCity && (
                <>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                  <span className="font-semibold text-green-600">{selectedCity}</span>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                  <span className="font-semibold text-purple-600">{retailers.length} retailers</span>
                </>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}