import dataProvider from '@/hooks/dataProvider';
import { useState } from 'react';

export function useTeacherList(page = 1, perPage = 10, filter = {}) {
  // Add include: { courses: true } to the filter, as the backend supports it as a query param
  const filterWithInclude = {
    ...filter,
    include: JSON.stringify({ courses: true })
  };
  return dataProvider.useListQuery('teachers', { page, perPage, filter: filterWithInclude });
}
export function useCreateTeacher(options: any) {
  return dataProvider.useCreateMutation('teachers', options);
}
export function useUpdateTeacher(options: any) {
  return dataProvider.useUpdateMutation('teachers', options);
}
export function useDeleteTeacher(options: any) {
  return dataProvider.useDeleteMutation('teachers', options);
}
export function useCourseList() {
  return dataProvider.useListQuery('courses', { page: 1, perPage: 100 });
}

export function useTeacherAdminState() {
  const [open, setOpen] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [editTeacher, setEditTeacher] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const teachersPerPage = 10;

  const {
    data: teacherData,
    isLoading,
    error,
    refetch,
  } = useTeacherList(currentPage, teachersPerPage);

  const createTeacher = useCreateTeacher({
    onSuccess: () => {
      setOpen(false);
      setFirstName("");
      setLastName("");
      setEmail("");
      setSelectedCourse("");
      setCurrentPage(1);
      refetch();
    },
  });
  const updateTeacher = useUpdateTeacher({
    onSuccess: () => {
      setEditId(null);
      setEditTeacher(null);
      refetch();
    },
  });
  const deleteTeacher = useDeleteTeacher({
    onSuccess: () => {
      refetch();
    },
  });

  const { data: courseData, isLoading: courseLoading } = useCourseList();
  const courses = courseData?.data || [];
  const teachers = teacherData?.data || [];
  const total = teacherData?.total || 0;
  const totalPages = Math.ceil(total / teachersPerPage);
  const startIndex = (currentPage - 1) * teachersPerPage;
  const endIndex = startIndex + teachersPerPage;

  function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    createTeacher.mutate({
      data: {
        firstName,
        lastName,
        email,
        courses: {
          create: selectedCourse ? [{ courseId: selectedCourse }] : [],
        },
      },
    });
  }

  function handleEditSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editId || !editTeacher) return;
    const updateData: any = {
      ...editTeacher,
    };
    if (editTeacher.courses && editTeacher.courses.length > 0) {
      updateData.courses = {
        connect: editTeacher.courses.map((c: any) => ({ id: c.id })),
      };
    }
    updateTeacher.mutate({
      id: editId,
      data: updateData,
    });
  }

  function handleDelete(id: string) {
    deleteTeacher.mutate({ id });
  }

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  return {
    open, setOpen,
    firstName, setFirstName,
    lastName, setLastName,
    email, setEmail,
    selectedCourse, setSelectedCourse,
    editId, setEditId,
    editTeacher, setEditTeacher,
    currentPage, setCurrentPage,
    teachersPerPage,
    isLoading, error,
    createTeacher, updateTeacher, deleteTeacher,
    courseLoading, courses,
    teachers, total, totalPages, startIndex, endIndex,
    handleSave, handleEditSave, handleDelete, goToPage,
  };
}