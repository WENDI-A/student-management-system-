import { fetchUtils } from 'react-admin';
import { API_ENDPOINT_FUNCTION, GET_HEADER } from "../config/config";

const get_path = {
    students: "/students"
};

const create_path = {
    students: "/students/register"
};

const get_one_path = {  
    students: "/profile"
};


const delete_path = {
    students: "/students"
};

const update_path = {
    students: "/students/update"
};
const dataProvider = {
    getList: async (resource, params) => {
        const url = API_ENDPOINT_FUNCTION(get_path[resource]);
        const options = await GET_HEADER();
        
        return fetchUtils.fetchJson(url, { ...options }).then(({ headers, json }) => ({
            data: json.data,
            total: parseInt(headers.get('content-range')?.split('/')?.pop(), 10) || json.length,
        }));
    },

    getOne: async (resource, params) => {
        const url = `${API_ENDPOINT_FUNCTION(get_one_path[resource])}/${params.id}`;
        const options = await GET_HEADER();
        
        return fetchUtils.fetchJson(url, { ...options }).then(({ json }) => ({
            data: json,
        }));
    },
    
    create: async (resource, params) => {
        const url = API_ENDPOINT_FUNCTION(create_path[resource]);
        const options = await GET_HEADER({
            method: 'POST',
            body: JSON.stringify(params.data)
        });
        
        return fetchUtils.fetchJson(url, { ...options }).then(({ json }) => ({
            data: { ...params.data, id: json.id },
        }));
    },
    
    update: async (resource, params) => {
        const url = `${API_ENDPOINT_FUNCTION(update_path[resource])}/${params.id}`;
        const options = await GET_HEADER({
            method: 'PUT',
            body: JSON.stringify(params.data)
        });
        
        return fetchUtils.fetchJson(url, { ...options }).then(({ json }) => ({
            data: json,
        }));
    },
    
    delete: async (resource, params) => {
        const url = `${API_ENDPOINT_FUNCTION(delete_path[resource])}/${params.id}`;
        const options = await GET_HEADER({
            method: 'DELETE'
        });
        
        return fetchUtils.fetchJson(url, { ...options }).then(({ json }) => ({
            data: json,
        }));
    }
};

export default dataProvider;
