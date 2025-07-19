import { fetchUtils } from 'react-admin';
import { API_ENDPOINT_FUNCTION, GET_HEADER } from "../config/config";
import extendedDataProvider from './dataProviderExtensions';


const get_path_list = {
    students: "/students",
    teachers : "/teachers",
    parents : "/parents",
    course : "/courses",
    courses : "/courses", // added plural
    Notfication : "/notifications",
    CourseMaterial : "/CourseMaterial",
    courseEnrollments : "/courseenrollments" ,
    Assessment : "/Assessment/teacher",
    attendance: "/Attendance/current-week",
    grade : "/grade/courses",
    schedules: "/schedules",
    myAssessment : "/StudentcourseEnrollments/student",
    exam: "/StudentcourseEnrollments/student",
    directors: "/directors",
    Question: "/questions",
};

const create_path = {
    students: "/students/register",
    teachers :"/teachers/register",
    parents : "/parents/register",
    course : "/courses",
    courses : "/courses", // added plural
    CourseMaterial : "/CourseMaterial",
    attendance: "/Attendance/set-attendance",
    grade : "/grade",
    schedules: "/schedules",
    directors: "/directors",
    Question: "/questions",
};

const get_one_path = {  
    students: "/students",
    teachers : "/teachers",
    parents : "/parents",
    course : "/courses",
    courses : "/courses", // added plural
    CourseMaterial : "/CourseMaterial",
    Assessment : "/Assessment",
    grade : "/grade/set-grade",
    schedules: "/schedules",
    myAssessment : "/StudentcourseEnrollments/student",
    exam: "/StudentcourseEnrollments/student",
    directors: "/directors",
     "director-grade" : "/directory/grade/student",
    Question: "/questions",
};


const delete_path = {
    students: "/students",
    teachers : "/teachers",
    parents : "/parents",
    course  : "/courses",
    courses : "/courses", // added plural
    CourseMaterial : "/CourseMaterial",
    Assessment : "/Assessment",
    schedules: "/schedules",
    directors: "/directors",
    Question: "/questions",
};

const update_path = {
    students: "/students/update",
    teachers : "/teachers/update",
    parents : "/parents/update",
    course : "/courses",
    courses : "/courses", // added plural
    CourseMaterial : "/CourseMaterial",
    grade : "/grade",
    schedules: "/schedules",
    directors: "/directors",
    "update-grade" : "/directory/grade",
    Question: "/questions",
};

const get_one_dashboard_path = {
    Admindashboard : "/dashboard/admin",
    TeacherDashboard : "/dashboard/teacher",
    ParentDashboard : "/dashboard/parent"
}

const get_update_password = {
    default : "/auth/update-password"
}

const getPathOrWarn = (map, resource, mapName) => {
    const path = map[resource];
    if (!path) {
        console.warn(`API path for resource '${resource}' not found in ${mapName}. This may cause /apiundefined errors.`);
    }
    return path;
};


const dataProvider = {
    getList: async (resource, params) => {
        const url = API_ENDPOINT_FUNCTION(getPathOrWarn(get_path_list, resource, 'get_path_list'));
        const options = await GET_HEADER();

        // Custom handling for grades resource
        if (resource === "grade") {
            return fetchUtils.fetchJson(url, { ...options }).then(({ json }) => ({
                data: json.data[0].grades || [],
                total: (json.data[0].grades && json.data[0].grades.length) || 0,
            }));
        }

        // Default for other resources
        return fetchUtils.fetchJson(url, { ...options }).then(({ headers, json }) => ({
            data: json.data,
            total: parseInt(headers.get('content-range')?.split('/')?.pop(), 10) || json.length || json.data.length ,
        }));
    },

    getAttendanceList: async (resource, params) => {
        const url = API_ENDPOINT_FUNCTION(getPathOrWarn(get_path_list, resource, 'get_path_list'));
        const options = await GET_HEADER();
        
        return fetchUtils.fetchJson(url, { ...options }).then(({ headers, json }) => ({
            data: json,
            total: json.data.attendance,
        }));
    },

    getGradeList: async (resource, params) => {
        const url = API_ENDPOINT_FUNCTION(getPathOrWarn(get_path_list, resource, 'get_path_list'));
        const options = await GET_HEADER();
        
        return fetchUtils.fetchJson(url, { ...options }).then(({ headers, json }) => ({
            data: json.data,
            total: json.data.attendance,
        }));
    },


    getOne: async (resource, params) => {
        console.log('[dataProvider.getOne]', { resource, params });
        let url;
        if (resource === "exam" || resource === "myAssessment") {
            url = `/api/StudentcourseEnrollments/student/assessment/${params.id}`;
        } else {
            url = `${API_ENDPOINT_FUNCTION(getPathOrWarn(get_one_path, resource, 'get_one_path'))}/${params.id}`;
        }
        const options = await GET_HEADER();
        
        // Custom handling for director-grade
        if (resource === "director-grade") {
            return fetchUtils.fetchJson(url, { ...options }).then(({ json }) => ({
                data: {
                    id: params.id,
                    ...json.data // this will include grades: [...]
                }
            }));
        }

        return fetchUtils.fetchJson(url, { ...options }).then(({ json }) => ({
            data: json.data,
        }));
    },

    getMany: async (resource, params) => {
        const url = API_ENDPOINT_FUNCTION(getPathOrWarn(get_path_list, resource, 'get_path_list'));
        const options = await GET_HEADER();
        
        return fetchUtils.fetchJson(url, { ...options }).then(({ json }) => {
            const filteredData = Array.isArray(json.data) 
                ? json.data.filter(item => params.ids.includes(item.id))
                : [];
            
            return {
                data: filteredData,
            };
        });
    },
    create: async (resource, params) => {
        const url = API_ENDPOINT_FUNCTION(getPathOrWarn(create_path, resource, 'create_path'));
        const options = await GET_HEADER({
            method: 'POST',
            body: JSON.stringify(params.data)
        });
        
        return fetchUtils.fetchJson(url, { ...options }).then(({ json }) => ({
            data: { ...params.data, id: json.id },
        }));
    },
    
    update: async (resource, params) => {
        const url = `${API_ENDPOINT_FUNCTION(getPathOrWarn(update_path, resource, 'update_path'))}/${params.id}`;
        const options = await GET_HEADER({
            method: 'PUT',
            body: JSON.stringify(params.data)
        });
        
        return fetchUtils.fetchJson(url, { ...options }).then(({ json }) => ({
            data: json.data,
        }));
    },
    
    delete: async (resource, params) => {
        const url = `${API_ENDPOINT_FUNCTION(getPathOrWarn(delete_path, resource, 'delete_path'))}/${params.id}`;
        const options = await GET_HEADER({
            method: 'DELETE'
        });
        
        return fetchUtils.fetchJson(url, { ...options }).then(({ json }) => ({
            data: json,
        }));
    },
    getDashboard : async (resource ,params) =>{
        const url = API_ENDPOINT_FUNCTION(getPathOrWarn(get_one_dashboard_path, resource, 'get_one_dashboard_path'));
        const options = await GET_HEADER();
        
        return fetchUtils.fetchJson(url, { ...options }).then(({ json }) => ({
            data: json.data,
        }));
    },

    updatePassword: async (params) => {
        const { oldPassword, newPassword, confirmPassword } = params.data;
        const url = API_ENDPOINT_FUNCTION(get_update_password.default);
        const options = await GET_HEADER({
            method: 'PUT',
            body: JSON.stringify({ oldPassword, newPassword, confirmPassword }),
        });
        return fetchUtils.fetchJson(url, { ...options }).then(({ json }) => ({
            data: json.data,
        }));
      },
      // Custom methods for attendance management
      getAttendanceByDate: async (courseId, date) => {
          const url = `${API_ENDPOINT_FUNCTION('/attendance/records')}?courseId=${courseId}&date=${date}`;
          const options = await GET_HEADER();
          
          return fetchUtils.fetchJson(url, { ...options }).then(({ json }) => ({
              data: json.data || [],
          }));
      },
      
      getTeacherCourses: async () => {
          const url = API_ENDPOINT_FUNCTION('/attendance/teacher/courses');
          const options = await GET_HEADER();
          
          return fetchUtils.fetchJson(url, { ...options }).then(({ json }) => ({
              data: json.data || [],
          }));
      },
      
      getStudentsForAttendance: async (courseId) => {
          const url = `${API_ENDPOINT_FUNCTION('/attendance/teacher/students')}?courseId=${courseId}`;
          const options = await GET_HEADER();
          
          return fetchUtils.fetchJson(url, { ...options }).then(({ json }) => ({
              data: json.data || [],
          }));
      },
      
      bulkMarkAttendance: async (data) => {
          const url = API_ENDPOINT_FUNCTION('/attendance/bulk');
          const options = await GET_HEADER({
              method: 'POST',
              body: JSON.stringify(data)
          });
          
          return fetchUtils.fetchJson(url, { ...options }).then(({ json }) => ({
              data: json.data || {},
          }));
      },
      
      ...extendedDataProvider
};

export default dataProvider;
