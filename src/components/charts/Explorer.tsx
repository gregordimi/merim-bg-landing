import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ChevronRight, Search } from "lucide-react";
import { GlobalFilters } from "@/utils/cube/filterUtils";
import { useCubeQuery } from "@cubejs-client/react";

interface ExplorerProps {
  globalFilters: GlobalFilters;
}

export default function UnfoldingRelationshipVisualization({
  globalFilters,
}: ExplorerProps) {
  // Selection states
  const [selectedMunicipality, setSelectedMunicipality] = useState<
    string | null
  >(null);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [selectedRetailer, setSelectedRetailer] = useState<string | null>(null);

  // Search states
  const [municipalitySearch, setMunicipalitySearch] = useState("");
  const [citySearch, setCitySearch] = useState("");
  const [retailerSearch, setRetailerSearch] = useState("");
  const [storeSearch, setStoreSearch] = useState("");

  // Cube.js queries for progressive data loading
  const municipalitiesQuery = useMemo(
    () => ({
      dimensions: ["municipality.name"],
      filters: [
        {
          member: "stores.settlement_name",
          operator: "set" as const,
        },
        // Apply global filters
        ...(globalFilters.retailers && globalFilters.retailers.length > 0
          ? [
              {
                member: "retailers.name",
                operator: "equals" as const,
                values: globalFilters.retailers,
              },
            ]
          : []),
        ...(globalFilters.settlements && globalFilters.settlements.length > 0
          ? [
              {
                member: "settlements.name_bg",
                operator: "equals" as const,
                values: globalFilters.settlements,
              },
            ]
          : []),
        ...(globalFilters.categories && globalFilters.categories.length > 0
          ? [
              {
                member: "store_categories.name",
                operator: "equals" as const,
                values: globalFilters.categories,
              },
            ]
          : []),
      ],
      measures: [],
    }),
    [
      globalFilters.retailers,
      globalFilters.settlements,
      globalFilters.categories,
    ]
  );

  const citiesQuery = useMemo(
    () =>
      selectedMunicipality
        ? {
            dimensions: ["settlements.name_bg"],
            filters: [
              {
                member: "municipality.name",
                operator: "equals" as const,
                values: [selectedMunicipality],
              },
              {
                member: "stores.settlement_name",
                operator: "set" as const,
              },
              // Apply global filters
              ...(globalFilters.retailers && globalFilters.retailers.length > 0
                ? [
                    {
                      member: "retailers.name",
                      operator: "equals" as const,
                      values: globalFilters.retailers,
                    },
                  ]
                : []),
              ...(globalFilters.categories &&
              globalFilters.categories.length > 0
                ? [
                    {
                      member: "store_categories.name",
                      operator: "equals" as const,
                      values: globalFilters.categories,
                    },
                  ]
                : []),
            ],
            measures: [],
          }
        : null,
    [selectedMunicipality, globalFilters.retailers, globalFilters.categories]
  );

  const retailersQuery = useMemo(
    () =>
      selectedMunicipality && selectedCity
        ? {
            dimensions: ["retailers.name"],
            filters: [
              {
                member: "municipality.name",
                operator: "equals" as const,
                values: [selectedMunicipality],
              },
              {
                member: "settlements.name_bg",
                operator: "equals" as const,
                values: [selectedCity],
              },
              {
                member: "stores.settlement_name",
                operator: "set" as const,
              },
              // Apply global filters
              ...(globalFilters.retailers && globalFilters.retailers.length > 0
                ? [
                    {
                      member: "retailers.name",
                      operator: "equals" as const,
                      values: globalFilters.retailers,
                    },
                  ]
                : []),
              ...(globalFilters.categories &&
              globalFilters.categories.length > 0
                ? [
                    {
                      member: "store_categories.name",
                      operator: "equals" as const,
                      values: globalFilters.categories,
                    },
                  ]
                : []),
            ],
            measures: [],
          }
        : null,
    [
      selectedMunicipality,
      selectedCity,
      globalFilters.retailers,
      globalFilters.categories,
    ]
  );

  const storesQuery = useMemo(
    () =>
      selectedMunicipality && selectedCity && selectedRetailer
        ? {
            dimensions: ["stores.original_id"],
            filters: [
              {
                member: "municipality.name",
                operator: "equals" as const,
                values: [selectedMunicipality],
              },
              {
                member: "settlements.name_bg",
                operator: "equals" as const,
                values: [selectedCity],
              },
              {
                member: "retailers.name",
                operator: "equals" as const,
                values: [selectedRetailer],
              },
              {
                member: "stores.settlement_name",
                operator: "set" as const,
              },
              // Apply global filters
              ...(globalFilters.categories &&
              globalFilters.categories.length > 0
                ? [
                    {
                      member: "store_categories.name",
                      operator: "equals" as const,
                      values: globalFilters.categories,
                    },
                  ]
                : []),
            ],
            measures: [],
          }
        : null,
    [
      selectedMunicipality,
      selectedCity,
      selectedRetailer,
      globalFilters.categories,
    ]
  );

  // Execute queries
  const {
    resultSet: municipalitiesResult,
    isLoading: loadingMunicipalities,
    error: municipalitiesError,
  } = useCubeQuery(municipalitiesQuery);
  const {
    resultSet: citiesResult,
    isLoading: loadingCities,
    error: citiesError,
  } = useCubeQuery(citiesQuery || { dimensions: [], measures: [] }, {
    skip: !citiesQuery,
  });
  const {
    resultSet: retailersResult,
    isLoading: loadingRetailers,
    error: retailersError,
  } = useCubeQuery(retailersQuery || { dimensions: [], measures: [] }, {
    skip: !retailersQuery,
  });
  const {
    resultSet: storesResult,
    isLoading: loadingStores,
    error: storesError,
  } = useCubeQuery(storesQuery || { dimensions: [], measures: [] }, {
    skip: !storesQuery,
  });

  // Process data
  const municipalities = useMemo(() => {
    if (!municipalitiesResult) return [];
    const pivot = municipalitiesResult.tablePivot();
    const names = pivot
      .map((row: any) => row["municipality.name"])
      .filter(Boolean);
    return [...new Set(names)].sort();
  }, [municipalitiesResult]);

  const cities = useMemo(() => {
    if (!citiesResult) return [];
    const pivot = citiesResult.tablePivot();
    const names = pivot
      .map((row: any) => row["settlements.name_bg"])
      .filter(Boolean);
    return [...new Set(names)].sort();
  }, [citiesResult]);

  const retailers = useMemo(() => {
    if (!retailersResult) return [];
    const pivot = retailersResult.tablePivot();
    const names = pivot
      .map((row: any) => row["retailers.name"])
      .filter(Boolean);
    return [...new Set(names)].sort();
  }, [retailersResult]);

  const stores = useMemo(() => {
    if (!storesResult) return [];
    const pivot = storesResult.tablePivot();
    const names = pivot
      .map((row: any) => row["stores.original_id"])
      .filter(Boolean);
    return [...new Set(names)].sort();
  }, [storesResult]);

  // Event handlers
  const handleMunicipalitySelect = (mun: string) => {
    setSelectedMunicipality(mun);
    setSelectedCity(null);
    setSelectedRetailer(null);
    setCitySearch("");
    setRetailerSearch("");
    setStoreSearch("");
  };

  const handleCitySelect = (city: string) => {
    setSelectedCity(city);
    setSelectedRetailer(null);
    setRetailerSearch("");
    setStoreSearch("");
  };

  const handleRetailerSelect = (retailer: string) => {
    setSelectedRetailer(retailer);
    setStoreSearch("");
  };

  const handleStartOver = () => {
    setSelectedMunicipality(null);
    setSelectedCity(null);
    setSelectedRetailer(null);
    setMunicipalitySearch("");
    setCitySearch("");
    setRetailerSearch("");
    setStoreSearch("");
  };

  // Filter data based on search
  const filteredMunicipalities = municipalities.filter((mun) =>
    mun.toLowerCase().includes(municipalitySearch.toLowerCase())
  );

  const filteredCities = cities.filter((city) =>
    city.toLowerCase().includes(citySearch.toLowerCase())
  );

  const filteredRetailers = retailers.filter((retailer) =>
    retailer.toLowerCase().includes(retailerSearch.toLowerCase())
  );

  const filteredStores = stores.filter((store) =>
    store.toLowerCase().includes(storeSearch.toLowerCase())
  );

  const error =
    municipalitiesError || citiesError || retailersError || storesError;

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">Store Explorer</CardTitle>
          {selectedMunicipality && (
            <button
              onClick={handleStartOver}
              className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 text-xs"
            >
              Reset
            </button>
          )}
        </div>
        <p className="text-xs text-gray-600">
          Progressive navigation: Municipality → City → Retailer → Store
        </p>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="flex items-center justify-center p-8">
            <div className="text-red-500">Error: {error.message}</div>
          </div>
        )}

        <div className="flex gap-3 items-start overflow-x-auto">
          {/* Step 1: Municipality Selection */}
          <div className="flex-shrink-0 w-56">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-bold">
                1
              </div>
              <h3 className="text-sm font-semibold">Municipality</h3>
              {loadingMunicipalities && (
                <div className="text-xs text-gray-500">Loading...</div>
              )}
            </div>

            <div className="mb-2">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3" />
                <Input
                  placeholder="Search..."
                  value={municipalitySearch}
                  onChange={(e) => setMunicipalitySearch(e.target.value)}
                  className="pl-7 h-8 text-sm"
                />
              </div>
            </div>

            <div className="space-y-1 max-h-[250px] overflow-y-auto border rounded p-2 bg-gray-50">
              {filteredMunicipalities.length === 0 && municipalitySearch && (
                <div className="p-2 text-center text-gray-500 text-xs">
                  No municipalities found
                </div>
              )}
              {filteredMunicipalities.map((mun) => (
                <div
                  key={mun}
                  onClick={() => handleMunicipalitySelect(mun)}
                  className={`p-2 rounded cursor-pointer transition-all text-sm ${
                    selectedMunicipality === mun
                      ? "bg-blue-500 text-white shadow"
                      : "bg-white hover:bg-blue-50 hover:shadow"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium truncate">{mun}</span>
                    <ChevronRight className="w-3 h-3 flex-shrink-0" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Step 2: City Selection */}
          {selectedMunicipality && (
            <>
              <ChevronRight className="w-6 h-6 text-gray-400 mt-8 flex-shrink-0" />
              <div className="flex-shrink-0 w-56 animate-in slide-in-from-left">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center text-sm font-bold">
                    2
                  </div>
                  <h3 className="text-sm font-semibold">City</h3>
                  {loadingCities && (
                    <div className="text-xs text-gray-500">Loading...</div>
                  )}
                </div>
                <div className="mb-2 text-xs text-gray-600">
                  in{" "}
                  <span className="font-semibold text-blue-600">
                    {selectedMunicipality}
                  </span>
                </div>

                <div className="mb-2">
                  <div className="relative">
                    <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3" />
                    <Input
                      placeholder="Search..."
                      value={citySearch}
                      onChange={(e) => setCitySearch(e.target.value)}
                      className="pl-7 h-8 text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-1 max-h-[250px] overflow-y-auto border rounded p-2 bg-gray-50">
                  {filteredCities.length === 0 && citySearch && (
                    <div className="p-2 text-center text-gray-500 text-xs">
                      No cities found
                    </div>
                  )}
                  {filteredCities.map((city) => (
                    <div
                      key={city}
                      onClick={() => handleCitySelect(city)}
                      className={`p-2 rounded cursor-pointer transition-all text-sm ${
                        selectedCity === city
                          ? "bg-green-500 text-white shadow"
                          : "bg-white hover:bg-green-50 hover:shadow"
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-medium truncate">{city}</span>
                        <ChevronRight className="w-3 h-3 flex-shrink-0" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Step 3: Retailer Selection */}
          {selectedCity && (
            <>
              <ChevronRight className="w-6 h-6 text-gray-400 mt-8 flex-shrink-0" />
              <div className="flex-shrink-0 w-56 animate-in slide-in-from-left">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-full bg-purple-500 text-white flex items-center justify-center text-sm font-bold">
                    3
                  </div>
                  <h3 className="text-sm font-semibold">Retailer</h3>
                  {loadingRetailers && (
                    <div className="text-xs text-gray-500">Loading...</div>
                  )}
                </div>
                <div className="mb-2 text-xs text-gray-600">
                  in{" "}
                  <span className="font-semibold text-green-600">
                    {selectedCity}
                  </span>
                </div>

                <div className="mb-2">
                  <div className="relative">
                    <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3" />
                    <Input
                      placeholder="Search..."
                      value={retailerSearch}
                      onChange={(e) => setRetailerSearch(e.target.value)}
                      className="pl-7 h-8 text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-1 max-h-[250px] overflow-y-auto border rounded p-2 bg-gray-50">
                  {filteredRetailers.length === 0 && retailerSearch && (
                    <div className="p-2 text-center text-gray-500 text-xs">
                      No retailers found
                    </div>
                  )}
                  {filteredRetailers.map((retailer) => (
                    <div
                      key={retailer}
                      onClick={() => handleRetailerSelect(retailer)}
                      className={`p-2 rounded cursor-pointer transition-all text-sm ${
                        selectedRetailer === retailer
                          ? "bg-purple-500 text-white shadow"
                          : "bg-white hover:bg-purple-50 hover:shadow"
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-medium truncate">{retailer}</span>
                        <ChevronRight className="w-3 h-3 flex-shrink-0" />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-2 p-2 bg-purple-100 rounded text-xs">
                  <span className="font-semibold">
                    {filteredRetailers.length}
                  </span>{" "}
                  retailer{filteredRetailers.length !== 1 ? "s" : ""} found
                </div>
              </div>
            </>
          )}

          {/* Step 4: Stores Display */}
          {selectedRetailer && (
            <>
              <ChevronRight className="w-6 h-6 text-gray-400 mt-8 flex-shrink-0" />
              <div className="flex-shrink-0 w-56 animate-in slide-in-from-left">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-full bg-orange-500 text-white flex items-center justify-center text-sm font-bold">
                    4
                  </div>
                  <h3 className="text-sm font-semibold">Stores</h3>
                  {loadingStores && (
                    <div className="text-xs text-gray-500">Loading...</div>
                  )}
                </div>
                <div className="mb-2 text-xs text-gray-600">
                  <span className="font-semibold text-purple-600">
                    {selectedRetailer}
                  </span>{" "}
                  in{" "}
                  <span className="font-semibold text-green-600">
                    {selectedCity}
                  </span>
                </div>

                <div className="mb-2">
                  <div className="relative">
                    <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3" />
                    <Input
                      placeholder="Search..."
                      value={storeSearch}
                      onChange={(e) => setStoreSearch(e.target.value)}
                      className="pl-7 h-8 text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-1 max-h-[250px] overflow-y-auto border rounded p-2 bg-gray-50">
                  {filteredStores.length === 0 && storeSearch && (
                    <div className="p-2 text-center text-gray-500 text-xs">
                      No stores found
                    </div>
                  )}
                  {filteredStores.map((store) => (
                    <div
                      key={store}
                      className="p-2 rounded bg-orange-50 border border-orange-200 text-sm"
                    >
                      <span className="font-medium text-orange-900 truncate block">
                        {store}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-2 p-2 bg-orange-100 rounded text-xs">
                  <span className="font-semibold">{filteredStores.length}</span>{" "}
                  store{filteredStores.length !== 1 ? "s" : ""} found
                </div>
              </div>
            </>
          )}
        </div>

        {/* Breadcrumb */}
        {selectedMunicipality && (
          <div className="mt-4 p-3 bg-gray-100 rounded">
            <div className="text-xs font-medium text-gray-600 mb-1">
              Current Path:
            </div>
            <div className="flex items-center gap-1 text-sm flex-wrap">
              <span className="font-semibold text-blue-600 truncate">
                {selectedMunicipality}
              </span>
              {selectedCity && (
                <>
                  <ChevronRight className="w-3 h-3 text-gray-400" />
                  <span className="font-semibold text-green-600 truncate">
                    {selectedCity}
                  </span>
                </>
              )}
              {selectedRetailer && (
                <>
                  <ChevronRight className="w-3 h-3 text-gray-400" />
                  <span className="font-semibold text-purple-600 truncate">
                    {selectedRetailer}
                  </span>
                  <ChevronRight className="w-3 h-3 text-gray-400" />
                  <span className="font-semibold text-orange-600">
                    {filteredStores.length} stores
                  </span>
                </>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
