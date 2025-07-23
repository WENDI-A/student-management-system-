# Advanced Searching & Filtering with the CRUD API

Your backend supports powerful advanced queries on all CRUD endpoints (like `/students`, `/teachers`, `/assessments`, etc.) using query parameters with intelligent field validation and automatic reverse relation detection:

- `filter`: Filter records (Prisma-style JSON with field validation)
- `select`: Select specific fields (including forward and reverse relations via nested select)
- `orderBy`: Sort results (validated against model fields)
- `skip`/`take`: Pagination with configurable limits

All parameters are passed as JSON strings in the query string and are automatically validated against the database schema.

---

## 1. Filtering Records

**Example:** Get all students with last name "Smith":

```
GET /students?filter={"lastName":"Smith"}
```

**Example:** Get all students created after Jan 1, 2024:

```
GET /students?filter={"createdAt":{"gte":"2024-01-01T00:00:00.000Z"}}
```

---

## 2. Selecting Fields (Including Forward and Reverse Relations)

The backend automatically detects both forward relations (via foreign keys) and reverse relations (where other models reference this model) for intelligent field selection.

### Basic Field Selection

**Example:** Get only `id`, `firstName`, and `email` for all students:

```
GET /students?select={"id":true,"firstName":true,"email":true}
```

### Forward Relations (Following Foreign Keys)

**Example:** Get students with their class information:

```
GET /students?select={"id":true,"firstName":true,"class":{"select":{"id":true,"name":true,"section":true}}}
```

### Reverse Relations (Automatically Detected)

**Example:** Get students and their grades (reverse relation - Grade.studentId references Student):

```
GET /students?select={"id":true,"firstName":true,"grades":{"select":{"id":true,"value":true,"assessment":{"select":{"title":true}}}}}
```

**Example:** Get assessments with their questions (reverse relation - Question.assessmentId references Assessment):

```
GET /assessments?select={"id":true,"title":true,"questions":{"select":{"id":true,"text":true,"type":true,"marks":true}}}
```

### Complex Nested Relations

**Example:** Get assessments with questions, course info, and teacher details:

```
GET /assessments?select={
  "id":true,
  "title":true,
  "type":true,
  "date":true,
  "course":{
    "select":{
      "id":true,
      "name":true,
      "code":true
    }
  },
  "teacher":{
    "select":{
      "id":true,
      "firstName":true,
      "lastName":true
    }
  },
  "questions":{
    "select":{
      "id":true,
      "text":true,
      "type":true,
      "marks":true,
      "options":true,
      "correctAnswer":true
    }
  }
}
```

---

## 3. Pagination

- `skip`: How many records to skip
- `take`: How many records to return

**Example:** Get 10 students, skipping the first 20:

```
GET /students?skip=20&take=10
```

---

## 4. Sorting

**Example:** Get all students, sorted by last name ascending:

```
GET /students?orderBy={"lastName":"asc"}
```

---

## 5. Combining Everything: Teacher's Students Example

**Goal:** Get all students for a specific teacher (e.g., `teacherId = "abc123"`), including their grades, and only select `id`, `firstName`, `lastName`, and `grades` fields.

**Request:**
```
GET /students?filter={"enrollments":{"some":{"course":{"teachers":{"some":{"teacherId":"abc123"}}}}}}&select={"id":true,"firstName":true,"lastName":true,"grades":true}
```

- **filter**: Finds students enrolled in any course taught by the teacher.
- **select**: Returns only the specified fields (including relations).

---

## 6. More Complex Filters

**Example:** Students with at least one grade above 90:
```
GET /students?filter={"grades":{"some":{"value":{"gt":90}}}}
```

**Example:** Students enrolled in a course with code "MATH101":
```
GET /students?filter={"enrollments":{"some":{"course":{"code":"MATH101"}}}}
```

---

## 7. Selecting Student with Class, Grades, and Attendance (Nested Select)

**Goal:** Fetch students with their class, grades, and attendances in one request.

**Request:**
```
GET /students?select={
  "id":true,
  "firstName":true,
  "lastName":true,
  "email":true,
  "class":{
    "select":{
      "id":true,
      "name":true,
      "section":true
    }
  },
  "grades":{
    "select":{
      "id":true,
      "assessmentId":true,
      "value":true
    }
  },
  "attendances":{
    "select":{
      "id":true,
      "courseId":true,
      "date":true,
      "status":true
    }
  }
}
```

**(URL-encoded for browser/curl/Postman):**
```
/students?select=%7B%22id%22%3Atrue%2C%22firstName%22%3Atrue%2C%22lastName%22%3Atrue%2C%22email%22%3Atrue%2C%22class%22%3A%7B%22select%22%3A%7B%22id%22%3Atrue%2C%22name%22%3Atrue%2C%22section%22%3Atrue%7D%7D%2C%22grades%22%3A%7B%22select%22%3A%7B%22id%22%3Atrue%2C%22assessmentId%22%3Atrue%2C%22value%22%3Atrue%7D%7D%2C%22attendances%22%3A%7B%22select%22%3A%7B%22id%22%3Atrue%2C%22courseId%22%3Atrue%2C%22date%22%3Atrue%2C%22status%22%3Atrue%7D%7D%7D
```

**What this returns:**
```json
[
  {
    "id": "clx123...",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "class": {
      "id": "clx456...",
      "name": "Grade 10",
      "section": "A"
    },
    "grades": [
      { "id": "g1", "assessmentId": "a1", "value": 95 },
      { "id": "g2", "assessmentId": "a2", "value": 88 }
    ],
    "attendances": [
      { "id": "att1", "courseId": "c1", "date": "2024-06-01T08:00:00.000Z", "status": "PRESENT" }
    ]
  }
]
```

---

## 8. Automatic Reverse Relations Detection

The backend automatically detects reverse relations by analyzing the database schema. Here are common reverse relations for each model:

### Assessment Model
- `questions` → Question.assessmentId references Assessment
- `grades` → Grade.assessmentId references Assessment

### Course Model  
- `assessments` → Assessment.courseId references Course
- `materials` → CourseMaterial.courseId references Course
- `enrollments` → CourseEnrollment.courseId references Course
- `attendances` → Attendance.courseId references Course
- `schedules` → Schedule.courseId references Course
- `gradeSummaries` → GradeSummary.courseId references Course

### Student Model
- `grades` → Grade.studentId references Student
- `attendances` → Attendance.studentId references Student
- `enrollments` → CourseEnrollment.studentId references Student
- `parentLinks` → ParentStudent.studentId references Student
- `gradeSummaries` → GradeSummary.studentId references Student
- `studentAnswers` → StudentAnswer.studentId references Student
- `notifications` → Notification.studentId references Student

### Teacher Model
- `courses` → CourseTeacher.teacherId references Teacher
- `assessments` → Assessment.teacherId references Teacher
- `materials` → CourseMaterial.teacherId references Teacher
- `notifications` → Notification.teacherId references Teacher

### Question Model
- `studentAnswers` → StudentAnswer.questionId references Question

---

## 9. Field Validation and Security

The backend includes intelligent field validation that:

- **Validates all fields** against the actual database schema
- **Filters out excluded fields** (like passwords) automatically
- **Prevents SQL injection** through proper field validation
- **Limits query complexity** to prevent performance issues
- **Provides helpful error messages** for invalid fields

### Excluded Fields
These fields are automatically excluded from all queries for security:
- `password` (all user models)
- `deletedAt` (soft delete fields)

### Query Limits
- **Maximum select depth**: 5 levels of nesting
- **Maximum fields per level**: 50 fields
- **Maximum complexity score**: 100 points
- **Maximum take limit**: 1000 records per request
- **Default take**: 100 records

---

## 10. Real-World Examples

### Get Teacher's Complete Assessment Data
```
GET /assessments?filter={"teacherId":"teacher123"}&select={
  "id":true,
  "title":true,
  "type":true,
  "date":true,
  "totalMarks":true,
  "course":{"select":{"name":true,"code":true}},
  "questions":{"select":{"text":true,"type":true,"marks":true,"options":true}},
  "grades":{"select":{"value":true,"student":{"select":{"firstName":true,"lastName":true}}}}
}
```

### Get Student Performance Overview
```
GET /students?filter={"id":"student123"}&select={
  "id":true,
  "firstName":true,
  "lastName":true,
  "class":{"select":{"name":true,"section":true}},
  "grades":{"select":{"value":true,"assessment":{"select":{"title":true,"type":true,"course":{"select":{"name":true}}}}}},
  "attendances":{"select":{"date":true,"status":true,"course":{"select":{"name":true}}}}
}
```

### Get Course with All Related Data
```
GET /courses?filter={"id":"course123"}&select={
  "id":true,
  "name":true,
  "code":true,
  "class":{"select":{"name":true,"section":true}},
  "teachers":{"select":{"teacher":{"select":{"firstName":true,"lastName":true}}}},
  "assessments":{"select":{"title":true,"type":true,"date":true,"totalMarks":true}},
  "materials":{"select":{"title":true,"description":true,"url":true}},
  "enrollments":{"select":{"student":{"select":{"firstName":true,"lastName":true}}}}
}
```

---

## 11. Error Handling

The backend provides detailed error messages for common issues:

### Invalid Field Names
```json
{
  "success": false,
  "message": "Query processing failed: Invalid select parameter",
  "errors": ["Unknown field 'invalidField' will be skipped - Available fields: id, title, type, courseId, teacherId, date, totalMarks, questions, course, teacher, grades"]
}
```

### Query Too Complex
```json
{
  "success": false,
  "message": "Select query too complex (score: 150, max: 100)"
}
```

### Invalid JSON
```json
{
  "success": false,
  "message": "Invalid select parameter: Unexpected token in JSON"
}
```

---

## 12. Performance Tips

1. **Select only needed fields** - Don't use `"fieldName":true` for fields you don't need
2. **Limit nested depth** - Deep nesting can impact performance
3. **Use pagination** - Always use `take` parameter for large datasets
4. **Filter early** - Apply filters before selecting related data
5. **Avoid complex nested filters** - Simple filters perform better

### Good Performance Example
```
GET /students?take=20&filter={"classId":"class123"}&select={"id":true,"firstName":true,"lastName":true}
```

### Poor Performance Example (avoid)
```
GET /students?select={"id":true,"firstName":true,"grades":{"select":{"assessment":{"select":{"course":{"select":{"teachers":{"select":{"notifications":true}}}}}}}}
```

---

## 13. Notes
- All query parameters must be valid JSON strings
- Field names are case-sensitive
- Relations are automatically detected and validated
- Unknown fields are filtered out with warnings
- You can combine `filter`, `select`, `orderBy`, `skip`, and `take` as needed
- This works for all models in the system

---

## 14. Troubleshooting
- **Invalid JSON**: Check your JSON formatting (use double quotes, not single quotes)
- **Unknown fields**: Check the error message for available field names
- **Performance issues**: Reduce query complexity or add pagination
- **Empty results**: Verify your filter conditions and field names
- **Date/time**: Use ISO strings (e.g., `"2024-01-01T00:00:00.000Z"`)

---

Happy querying! 🚀 



