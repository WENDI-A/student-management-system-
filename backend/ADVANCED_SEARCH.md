# Advanced Searching & Filtering with the CRUD API

Your backend supports powerful advanced queries on all CRUD endpoints (like `/students`, `/teachers`, etc.) using query parameters:

- `filter`: Filter records (Prisma-style JSON)
- `select`: Select specific fields (including related models via nested select)
- `orderBy`: Sort results
- `skip`/`take`: Pagination

All parameters are passed as JSON strings in the query string.

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

## 2. Selecting Fields (Including Relations)

**Example:** Get only `id`, `firstName`, and `email` for all students:

```
GET /students?select={"id":true,"firstName":true,"email":true}
```

**Example:** Get all students and their grades:

```
GET /students?select={"id":true,"firstName":true,"grades":true}
```

**Example:** Get all students and select only the `id` and `value` fields from their grades:

```
GET /students?select={"id":true,"firstName":true,"grades":{"select":{"id":true,"value":true}}}
```

**Example:** Get all students and their enrollments and the course for each enrollment (nested select):

```
GET /students?select={"id":true,"firstName":true,"enrollments":{"select":{"id":true,"course":{"select":{"id":true,"name":true}}}}}
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

## 8. Notes
- All query parameters must be valid JSON strings.
- You can combine `filter`, `select`, `orderBy`, `skip`, and `take` as needed.
- This works for all models, not just students.

---

## 9. Troubleshooting
- If you get an error, check your JSON formatting (use double quotes, not single quotes).
- For date/time, use ISO strings (e.g., `"2024-01-01T00:00:00.000Z"`).
- If you need help building a query, ask your backend developer or consult the Prisma documentation for filter syntax.

---

Happy querying! 



