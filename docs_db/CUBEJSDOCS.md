@cubejs-client/react
@cubejs-client/react provides React Components for easy Cube integration in a React app.

useCubeQuery
useCubeQuery‹TData›(query: Query | Query[], options?: UseCubeQueryOptions): UseCubeQueryResult‹Query, TData›

A React hook for executing Cube queries

import React from 'react';
import { Table } from 'antd';
import { useCubeQuery } from '@cubejs-client/react';

export default function App() {
const { resultSet, isLoading, error, progress } = useCubeQuery({
measures: ['Orders.count'],
dimensions: ['Orders.createdAt.month'],
});

if (isLoading) {
return <div>{progress && progress.stage && progress.stage.stage || 'Loading...'}</div>;
}

if (error) {
return <div>{error.toString()}</div>;
}

if (!resultSet) {
return null;
}

const dataSource = resultSet.tablePivot();
const columns = resultSet.tableColumns();

return <Table columns={columns} dataSource={dataSource} />;
}

Type parameters:

TData
UseCubeQueryOptions
Name Type Description Optional?
cubeApi CubeApi A CubeApi instance to use. Taken from the context if the param is not passed ✅ Yes
resetResultSetOnChange boolean When true the resultSet will be reset to null first ✅ Yes
skip boolean Query execution will be skipped when skip is set to true. You can use this flag to avoid sending incomplete queries. ✅ Yes
subscribe boolean Use continuous fetch behavior. See Real-Time Data Fetch ✅ Yes
castNumerics boolean Pass true if you'd like all members with the number type to be automatically converted to JavaScript Number type. Note that this is a potentially unsafe operation since numbers more than Number.MAX_SAFE_INTEGER(opens in a new tab) or less than Number.MIN_SAFE_INTEGER can't be represented as JavaScript Number ✅ Yes
UseCubeQueryResult<TQuery, TData>
Name Type
error Error | null
isLoading boolean
previousQuery TQuery
progress ProgressResponse
resultSet ResultSet‹TData› | null
isQueryPresent
isQueryPresent(query: Query | Query[]): boolean

Checks whether the query is ready

QueryBuilder
QueryBuilder extends React.Component ‹QueryBuilderProps, QueryBuilderState›:

<QueryBuilder /> is used to build interactive analytics query builders. It abstracts state management and API calls to Cube API. It uses render prop technique and doesn’t render anything itself, but calls the render function instead.

Example

Open in CodeSandbox(opens in a new tab)

import React from 'react';
import ReactDOM from 'react-dom';
import { Layout, Divider, Empty, Select } from 'antd';
import { QueryBuilder } from '@cubejs-client/react';
import cube from '@cubejs-client/core';
import 'antd/dist/antd.css';

import ChartRenderer from './ChartRenderer';

const cubeApi = cube('YOUR-CUBE-API-TOKEN', {
apiUrl: 'http://localhost:4000/cubejs-api/v1',
});

const App = () => (
<QueryBuilder
query={{
      timeDimensions: [
        {
          dimension: 'LineItems.createdAt',
          granularity: 'month',
        },
      ],
    }}
cubeApi={cubeApi}
render={({ resultSet, measures, availableMeasures, updateMeasures }) => (
<Layout.Content style={{ padding: '20px' }}>
<Select
mode="multiple"
style={{ width: '100%' }}
placeholder="Please select"
onSelect={(measure) => updateMeasures.add(measure)}
onDeselect={(measure) => updateMeasures.remove(measure)} >
{availableMeasures.map((measure) => (
<Select.Option key={measure.name} value={measure}>
{measure.title}
</Select.Option>
))}
</Select>
<Divider />
{measures.length > 0 ? (
<ChartRenderer resultSet={resultSet} />
) : (
<Empty description="Select measure or dimension to get started" />
)}
</Layout.Content>
)}
/>
);

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);

QueryBuilderProps
Name Type Description
cubeApi CubeApi CubeApi instance to use
defaultChartType? ChartType -
disableHeuristics? boolean Defaults to false. This means that the default heuristics will be applied. For example: when the query is empty and you select a measure that has a default time dimension it will be pushed to the query.
query? Query Default query
render (renderProps: QueryBuilderRenderProps) => React.ReactNode -
setQuery? (query: Query) => void Called by the QueryBuilder when the query state has changed. Use it when state is maintained outside of the QueryBuilder component.
setVizState? (vizState: VizState) => void -
stateChangeHeuristics? (state: QueryBuilderState) => QueryBuilderState A function that accepts the newState just before it's applied. You can use it to override the defaultHeuristics or to tweak the query or the vizState in any way.
vizState? VizState -
wrapWithQueryRenderer? boolean Defaults to true. Use QueryRenderer to render. Set this to false to use your own QueryRenderer.
QueryBuilderRenderProps
Name Type Description
availableDimensions TCubeDimension[] An array of available dimensions to select. They are loaded via the API from Cube.
availableMeasures TCubeMeasure[] An array of available measures to select. They are loaded via the API from Cube.
availableSegments TCubeMember[] An array of available segments to select. They are loaded via the API from Cube.
availableTimeDimensions TCubeDimension[] An array of available time dimensions to select. They are loaded via the API from Cube.
dimensions string[] -
error? Error | null -
isQueryPresent boolean Indicates whether the query is ready to be displayed or not
loadingState? TLoadingState -
measures string[] -
resultSet? ResultSet | null -
segments string[] -
timeDimensions Filter[] -
updateDimensions MemberUpdater -
updateMeasures MemberUpdater -
updateQuery (query: Query) => void Used for partial of full query update
updateSegments MemberUpdater -
updateTimeDimensions MemberUpdater -
QueryBuilderState
QueryBuilderState: VizState & object

QueryRenderer
QueryRenderer extends React.Component ‹QueryRendererProps›:

<QueryRenderer /> a react component that accepts a query, fetches the given query, and uses the render prop to render the resulting data

QueryRendererProps
Name Type Description
cubeApi CubeApi CubeApi instance to use
loadSql? "only" | boolean Indicates whether the SQL Code generated by Cube should be requested. See rest-api#sql. When set to only then only the request to /v1/sql will be performed. When set to true the sql request will be performed along with the query request. Will not be performed if set to false
queries? object -
query Query Analytic query. Learn more about it's format
render (renderProps: QueryRendererRenderProps) => void Output of this function will be rendered by the QueryRenderer
resetResultSetOnChange? boolean When true the resultSet will be reset to null first on every state change
updateOnlyOnStateChange? boolean -
QueryRendererRenderProps
Name Type
error Error | null
loadingState TLoadingState
resultSet ResultSet | null
CubeProvider
CubeProvider: React.FC‹CubeProviderProps›

Cube context provider

import React from 'react';
import cube from '@cubejs-client/core';
import { CubeProvider } from '@cubejs-client/react';

const API_URL = 'https://harsh-eel.aws-us-east-2.cubecloudapp.dev';
const CUBE_TOKEN =
'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9._ eyJpYXQiOjE1OTE3MDcxNDgsImV4cCI6MTU5NDI5OTE0OH0._ n5jGLQJ14igg6_Hri_Autx9qOIzVqp4oYxmX27V-4T4';

const cubeApi = cube(CUBE_TOKEN, {
apiUrl: `${API_URL}/cubejs-api/v1`,
});

export default function App() {
return (
<CubeProvider cubeApi={cubeApi}>
//...
</CubeProvider>
)
}

CubeContext
CubeContext: Context‹CubeContextProps›

In case when you need direct access to cubeApi you can use CubeContext anywhere in your app

import React from 'react';
import { CubeContext } from '@cubejs-client/react';

export default function DisplayComponent() {
const { cubeApi } = React.useContext(CubeContext);
const [rawResults, setRawResults] = React.useState([]);
const query = {
...
};

React.useEffect(() => {
cubeApi.load(query).then((resultSet) => {
setRawResults(resultSet.rawData());
});
}, [query]);

return (
<>
{rawResults.map(row => (
...
))}
</>
)
}

Types
ChartType
ChartType: "line" | "bar" | "table" | "area"

CubeContextProps
Name Type Optional?
cubeApi CubeApi ❌ No
options CubeProviderOptions ✅ Yes
CubeProviderProps
Name Type Optional?
cubeApi CubeApi ❌ No
children React.ReactNode ❌ No
options CubeProviderOptions ✅ Yes
CubeProviderOptions
Name Type Optional?
castNumerics boolean ✅ Yes
MemberUpdater
You can use the following methods for member manipulaltion

<QueryBuilder
// ...
cubeApi={cubeApi}
render={({
// ...
availableMeasures,
updateMeasures,
}) => {
return (
// ...
<Select
mode="multiple"
placeholder="Please select"
onSelect={(measure) => updateMeasures.add(measure)}
onDeselect={(measure) => updateMeasures.remove(measure)} >
{availableMeasures.map((measure) => (
<Select.Option key={measure.name} value={measure}>
{measure.title}
</Select.Option>
))}
</Select>
);
}}
/>

NOTE: if you need to add or remove more than one member at a time you should use updateQuery prop of QueryBuilderRenderProps

<QueryBuilder
// ...
cubeApi={cubeApi}
render={({
// ...
measures,
updateMeasures,
updateQuery,
}) => {
// ...
return (
<>
// WRONG: This code will not work properly
<button
onClick={() =>
measures.forEach((measure) => updateMeasures.remove(measure))
} >
Remove all
</button>

        // CORRECT: Using `updateQuery` for removing all measures
        <button
          onClick={() =>
            updateQuery({
              measures: [],
            })
          }
        >
          Remove all
        </button>
      </>
    );

}}
/>

Name Type
add (member: MemberType) => void
remove (member: MemberType) => void
update (member: MemberType, updateWith: MemberType) => void
TLoadingState
Name Type
isLoading boolean
VizState
Name Type
chartType? ChartType
pivotConfig? PivotConfig
shouldApplyHeuristicOrder? boolean
