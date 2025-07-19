# Advanced Searching & Filtering with the CRUD API

Your backend supports powerful advanced queries on all CRUD endpoints (like `/students`, `/teachers`, etc.) using query parameters:

- `filter`: Filter records (Prisma-style JSON)
- `select`: Select specific fields
- `include`: Include related models (relations)
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

## 2. Selecting Fields

**Example:** Get only `id`, `firstName`, and `email` for all students:

```
GET /students?select={"id":true,"firstName":true,"email":true}
```

---

## 3. Including Relations

**Example:** Get all students and include their grades:

```
GET /students?include={"grades":true}
```

**Example:** Get all students and include their enrollments and the course for each enrollment:

```
GET /students?include={"enrollments":{"include":{"course":true}}}
```

---

## 4. Pagination

- `skip`: How many records to skip
- `take`: How many records to return

**Example:** Get 10 students, skipping the first 20:

```
GET /students?skip=20&take=10
```

---

## 5. Sorting

**Example:** Get all students, sorted by last name ascending:

```
GET /students?orderBy={"lastName":"asc"}
```

---

## 6. Combining Everything: Teacher's Students Example

**Goal:** Get all students for a specific teacher (e.g., `teacherId = "abc123"`), including their grades, and only select `id`, `firstName`, `lastName`, and `grades` fields.

**Request:**
```
GET /students?filter={"enrollments":{"some":{"course":{"teachers":{"some":{"teacherId":"abc123"}}}}}}&include={"grades":true}&select={"id":true,"firstName":true,"lastName":true,"grades":true}
```

- **filter**: Finds students enrolled in any course taught by the teacher.
- **include**: Includes their grades.
- **select**: Returns only the specified fields.

---

## 7. More Complex Filters

**Example:** Students with at least one grade above 90:
```
GET /students?filter={"grades":{"some":{"value":{"gt":90}}}}
```

**Example:** Students enrolled in a course with code "MATH101":
```
GET /students?filter={"enrollments":{"some":{"course":{"code":"MATH101"}}}}
```

---

## 8. Notes
- All query parameters must be valid JSON strings.
- You can combine `filter`, `select`, `include`, `orderBy`, `skip`, and `take` as needed.
- This works for all models, not just students.

---

## 9. Troubleshooting
- If you get an error, check your JSON formatting (use double quotes, not single quotes).
- For date/time, use ISO strings (e.g., `"2024-01-01T00:00:00.000Z"`).
- If you need help building a query, ask your backend developer or consult the Prisma documentation for filter syntax.

---

Happy querying! 



