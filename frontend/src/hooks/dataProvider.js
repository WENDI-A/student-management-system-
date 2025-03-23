// In a real application, this would connect to your API
import { fetchUtils } from 'react-admin';
import { stringify } from 'query-string';

const apiUrl = 'http://localhost:3002';
const httpClient = fetchUtils.fetchJson;

const dataProvider = {
    getList: (resource, params) => {
        const { page, perPage } = params.pagination;
        const { field, order } = params.sort;
        
        const query = {
            sort: JSON.stringify([field, order]),
            range: JSON.stringify([(page - 1) * perPage, page * perPage - 1]),
            filter: JSON.stringify(params.filter),
        };
        
        const url = `${apiUrl}/${resource}?${stringify(query)}`;
        
        return httpClient(url).then(({ headers, json }) => ({
            data: json,
            total: parseInt(headers.get('content-range').split('/').pop(), 10),
        }));
    },

    getOne: (resource, params) =>
        httpClient(`${apiUrl}/${resource}/${params.id}`).then(({ json }) => ({
            data: json,
        })),
};

export default dataProvider;