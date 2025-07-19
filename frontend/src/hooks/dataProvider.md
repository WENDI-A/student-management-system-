 # dataProvider Hook Documentation

A unified data provider for CRUD operations in the Student Management System frontend, built with React Query, Axios, and notistack for notifications.

## Overview

dataProvider provides a set of hooks for interacting with backend resources (students, teachers, courses, etc.) using RESTful endpoints. It supports:
- List, get one, create, update, and delete operations
- Pagination and filtering for lists
- Automatic success/error notifications via notistack
- Custom onSuccess/onError handlers for advanced use
- Full TypeScript support

## Available Hooks

- `useListQuery(resource, options?, queryOptions?)`
- `useGetOneQuery(resource, options)`
- `useCreateMutation(resource, mutationOptions?)`
- `useUpdateMutation(resource, mutationOptions?)`
- `useDeleteMutation(resource, mutationOptions?)`

## Usage

### 1. List Query (with Pagination & Filtering)
```tsx
const { data, isLoading, error } = dataProvider.useListQuery('students', {
  page: 1,
  perPage: 10,
  filter: { name: 'John' },
});
```
- `resource`: one of the supported resource keys (e.g. 'students', 'teachers')
- `options.page`/`perPage`: pagination
- `options.filter`: object for filtering (e.g. `{ name: 'John' }`)

### 2. Get One
```tsx
const { data, isLoading } = dataProvider.useGetOneQuery('students', { id: '123' });
```
- `resource`: resource key
- `options.id`: item ID

### 3. Create
```tsx
const createStudent = dataProvider.useCreateMutation('students');
createStudent.mutate({ data: { firstName: 'Jane', lastName: 'Doe' } });
```
- `resource`: resource key
- `data`: object to create

### 4. Update
```tsx
const updateStudent = dataProvider.useUpdateMutation('students');
updateStudent.mutate({ id: '123', data: { firstName: 'Janet' } });
```
- `id`: item ID
- `data`: fields to update

### 5. Delete
```tsx
const deleteStudent = dataProvider.useDeleteMutation('students');
deleteStudent.mutate({ id: '123' });
```

## Notifications (notistack)
- All hooks show a snackbar notification on success or error by default.
- To override, provide your own `onSuccess` or `onError` handler:

```tsx
const { mutate } = dataProvider.useCreateMutation('students', {
  onSuccess: (data) => {
    // custom logic
  },
  onError: (error) => {
    // custom error handling
  },
});
```

## Typing
- All hooks are fully typed with TypeScript.
- The return types match React Query's `UseQueryResult` and `UseMutationResult`.

## Advanced
- You can use all React Query options (e.g. `enabled`, `select`, etc.) via the third argument to `useListQuery` or as part of mutation options.
- Filtering and pagination are passed as query params to the backend.

## Supported Resources
- students, teachers, parents, courses, CourseMaterial, attendance, grade, schedules, directors, etc.
- See `dataProvider.ts` for the full list.

---

For more details, see the source code in `dataProvider.ts` or ask your team lead for advanced usage patterns.
