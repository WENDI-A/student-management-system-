# Student Management System API Documentation

## Base URL
```
http://localhost:3002/api
```

## Authentication

### Login
**POST** `/auth/login`

Authenticate a user with email/identifier and password.

**Request Body:**
```json
{
  "identifier": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": "user_id",
    "firstName": "John",
    "lastName": "Doe",
    "email": "user@example.com",
    "role": "student"
  },
  "token": "jwt_token_here"
}
```

### Forgot Password
**POST** `/auth/forgot-password`

Request password reset for a user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "role": "student"
}
```

### Reset Password
**POST** `/auth/reset-password/:token`

Reset password using token.

**Request Body:**
```json
{
  "token": "reset_token",
  "password": "new_password",
  "role": "student"
}
```

### Refresh Token
**GET** `/auth/token-refresh/:token`

Refresh an expired JWT token.

### Update Password
**PUT** `/auth/update-password`

Update user password (requires authentication).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "currentPassword": "old_password",
  "newPassword": "new_password"
}
```

## User Models

### Students
**Base Path:** `/students`

**Data Schema:**
```json
{
  "code": "string (format: 1378/14)",
  "firstName": "string",
  "lastName": "string", 
  "email": "string (email)",
  "password": "string",
  "classId": "string"
}
```

**CRUD Operations:**
- `GET /students` - Get all students
- `GET /students/:id` - Get student by ID
- `POST /students` - Create new student
- `PUT /students/:id` - Update student
- `DELETE /students/:id` - Delete student

### Teachers
**Base Path:** `/teachers`

**Data Schema:**
```json
{
  "firstName": "string",
  "lastName": "string",
  "email": "string (email)",
  "password": "string"
}
```

**CRUD Operations:**
- `GET /teachers` - Get all teachers
- `GET /teachers/:id` - Get teacher by ID
- `POST /teachers` - Create new teacher
- `PUT /teachers/:id` - Update teacher
- `DELETE /teachers/:id` - Delete teacher

### Parents
**Base Path:** `/parents`

**Data Schema:**
```json
{
  "firstName": "string",
  "lastName": "string",
  "email": "string (email)",
  "password": "string"
}
```

**CRUD Operations:**
- `GET /parents` - Get all parents
- `GET /parents/:id` - Get parent by ID
- `POST /parents` - Create new parent
- `PUT /parents/:id` - Update parent
- `DELETE /parents/:id` - Delete parent

### Directors
**Base Path:** `/directors`

**Data Schema:**
```json
{
  "firstName": "string",
  "lastName": "string",
  "email": "string (email)",
  "password": "string"
}
```

**CRUD Operations:**
- `GET /directors` - Get all directors
- `GET /directors/:id` - Get director by ID
- `POST /directors` - Create new director
- `PUT /directors/:id` - Update director
- `DELETE /directors/:id` - Delete director

### Guests
**Base Path:** `/guests`

**Data Schema:**
```json
{
  "firstName": "string",
  "lastName": "string",
  "email": "string (email)",
  "password": "string"
}
```

**CRUD Operations:**
- `GET /guests` - Get all guests
- `GET /guests/:id` - Get guest by ID
- `POST /guests` - Create new guest
- `PUT /guests/:id` - Update guest
- `DELETE /guests/:id` - Delete guest

## Academic Models

### Classes
**Base Path:** `/classes`

**Data Schema:**
```json
{
  "name": "string",
  "section": "string (optional)"
}
```

**CRUD Operations:**
- `GET /classes` - Get all classes
- `GET /classes/:id` - Get class by ID
- `POST /classes` - Create new class
- `PUT /classes/:id` - Update class
- `DELETE /classes/:id` - Delete class

### Courses
**Base Path:** `/courses`

**Data Schema:**
```json
{
  "name": "string",
  "code": "string (unique)",
  "classId": "string (optional)"
}
```

**CRUD Operations:**
- `GET /courses` - Get all courses
- `GET /courses/:id` - Get course by ID
- `POST /courses` - Create new course
- `PUT /courses/:id` - Update course
- `DELETE /courses/:id` - Delete course

### Course Enrollments
**Base Path:** `/course-enrollments`

**Data Schema:**
```json
{
  "studentId": "string",
  "courseId": "string"
}
```

**CRUD Operations:**
- `GET /course-enrollments` - Get all enrollments
- `GET /course-enrollments/:id` - Get enrollment by ID
- `POST /course-enrollments` - Create new enrollment
- `PUT /course-enrollments/:id` - Update enrollment
- `DELETE /course-enrollments/:id` - Delete enrollment

### Course Teachers
**Base Path:** `/course-teachers`

**Data Schema:**
```json
{
  "teacherId": "string",
  "courseId": "string"
}
```

**CRUD Operations:**
- `GET /course-teachers` - Get all course teachers
- `GET /course-teachers/:id` - Get course teacher by ID
- `POST /course-teachers` - Create new course teacher
- `PUT /course-teachers/:id` - Update course teacher
- `DELETE /course-teachers/:id` - Delete course teacher

## Assessment Models

### Assessments
**Base Path:** `/assessments`

**Data Schema:**
```json
{
  "title": "string",
  "type": "EXAM | QUIZ | ASSIGNMENT | PROJECT | OTHER",
  "courseId": "string",
  "teacherId": "string",
  "date": "datetime"
}
```

**CRUD Operations:**
- `GET /assessments` - Get all assessments
- `GET /assessments/:id` - Get assessment by ID
- `POST /assessments` - Create new assessment
- `PUT /assessments/:id` - Update assessment
- `DELETE /assessments/:id` - Delete assessment

### Questions
**Base Path:** `/questions`

**Data Schema:**
```json
{
  "assessmentId": "string",
  "text": "string"
}
```

**CRUD Operations:**
- `GET /questions` - Get all questions
- `GET /questions/:id` - Get question by ID
- `POST /questions` - Create new question
- `PUT /questions/:id` - Update question
- `DELETE /questions/:id` - Delete question

### Student Answers
**Base Path:** `/student-answers`

**Data Schema:**
```json
{
  "questionId": "string",
  "studentId": "string",
  "answer": "string"
}
```

**CRUD Operations:**
- `GET /student-answers` - Get all student answers
- `GET /student-answers/:id` - Get student answer by ID
- `POST /student-answers` - Create new student answer
- `PUT /student-answers/:id` - Update student answer
- `DELETE /student-answers/:id` - Delete student answer

## Grade Models

### Grades
**Base Path:** `/grades`

**Data Schema:**
```json
{
  "assessmentId": "string",
  "studentId": "string",
  "value": "float"
}
```

**CRUD Operations:**
- `GET /grades` - Get all grades
- `GET /grades/:id` - Get grade by ID
- `POST /grades` - Create new grade
- `PUT /grades/:id` - Update grade
- `DELETE /grades/:id` - Delete grade

### Grade Summaries
**Base Path:** `/grade-summaries`

**Data Schema:**
```json
{
  "studentId": "string",
  "courseId": "string",
  "average": "float"
}
```

**CRUD Operations:**
- `GET /grade-summaries` - Get all grade summaries
- `GET /grade-summaries/:id` - Get grade summary by ID
- `POST /grade-summaries` - Create new grade summary
- `PUT /grade-summaries/:id` - Update grade summary
- `DELETE /grade-summaries/:id` - Delete grade summary

## Attendance Models

### Attendance
**Base Path:** `/attendances`

**Data Schema:**
```json
{
  "studentId": "string",
  "courseId": "string",
  "date": "datetime",
  "status": "PRESENT | ABSENT | LATE | EXCUSED"
}
```

**CRUD Operations:**
- `GET /attendances` - Get all attendance records
- `GET /attendances/:id` - Get attendance by ID
- `POST /attendances` - Create new attendance record
- `PUT /attendances/:id` - Update attendance record
- `DELETE /attendances/:id` - Delete attendance record

## Course Materials

### Course Materials
**Base Path:** `/course-materials`

**Data Schema:**
```json
{
  "courseId": "string",
  "teacherId": "string",
  "title": "string",
  "description": "string (optional)",
  "url": "string (optional)"
}
```

**CRUD Operations:**
- `GET /course-materials` - Get all course materials
- `GET /course-materials/:id` - Get course material by ID
- `POST /course-materials` - Create new course material
- `PUT /course-materials/:id` - Update course material
- `DELETE /course-materials/:id` - Delete course material

## Notifications

### Notifications
**Base Path:** `/notifications`

**Data Schema:**
```json
{
  "studentId": "string (optional)",
  "teacherId": "string (optional)",
  "parentId": "string (optional)",
  "adminId": "string (optional)",
  "directorId": "string (optional)",
  "guestId": "string (optional)",
  "type": "TEXT | IMAGE | FILE | ALERT | OTHER",
  "content": "string",
  "fileUrl": "string (optional)"
}
```

**CRUD Operations:**
- `GET /notifications` - Get all notifications
- `GET /notifications/:id` - Get notification by ID
- `POST /notifications` - Create new notification
- `PUT /notifications/:id` - Update notification
- `DELETE /notifications/:id` - Delete notification

## Parent-Student Relationships

### Parent Students
**Base Path:** `/parent-students`

**Data Schema:**
```json
{
  "parentId": "string",
  "studentId": "string"
}
```

**CRUD Operations:**
- `GET /parent-students` - Get all parent-student relationships
- `GET /parent-students/:id` - Get parent-student relationship by ID
- `POST /parent-students` - Create new parent-student relationship
- `PUT /parent-students/:id` - Update parent-student relationship
- `DELETE /parent-students/:id` - Delete parent-student relationship

## Schedules

### Schedules
**Base Path:** `/schedules`

**Data Schema:**
```json
{
  "courseId": "string",
  "teacherId": "string",
  "dayOfWeek": "MONDAY | TUESDAY | WEDNESDAY | THURSDAY | FRIDAY | SATURDAY | SUNDAY",
  "startTime": "string (HH:MM format)",
  "endTime": "string (HH:MM format)",
  "room": "string (optional)"
}
```

**CRUD Operations:**
- `GET /schedules` - Get all schedules
- `GET /schedules/:id` - Get schedule by ID
- `POST /schedules` - Create new schedule
- `PUT /schedules/:id` - Update schedule
- `DELETE /schedules/:id` - Delete schedule

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "success": false,
  "message": "Validation error",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Unauthorized access"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Access denied"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Internal server error"
}
```

## Authentication Headers

For protected endpoints, include the JWT token in the Authorization header:

```
Authorization: Bearer <jwt_token>
```

## Pagination

List endpoints support pagination with query parameters:

```
GET /students?page=1&limit=10&search=john&sortBy=firstName&sortOrder=asc
```

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10, max: 100)
- `search` - Search term for filtering
- `sortBy` - Field to sort by
- `sortOrder` - Sort order (asc/desc)

**Response Format:**
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```
