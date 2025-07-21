"use client";
import dataProvider from '@/hooks/dataProvider';
import { useState } from 'react';

export function useCourseList(page = 1, perPage = 10, filter = {}) {
  return dataProvider.useListQuery('courses', { page, perPage, filter });
}
export function useCreateCourse(options: any) {
  return dataProvider.useCreateMutation('courses', options);
}
export function useUpdateCourse(options: any) {
  return dataProvider.useUpdateMutation('courses', options);
}
export function useDeleteCourse(options: any) {
  return dataProvider.useDeleteMutation('courses', options);
}

export function useCourseAdminState() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [classId, setClassId] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [editCourse, setEditCourse] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const coursesPerPage = 10;

  const {
    data: courseData,
    isLoading,
    error,
    refetch,
  } = useCourseList(currentPage, coursesPerPage);
  const { data: classData, isLoading: classLoading } = dataProvider.useListQuery('classes', { page: 1, perPage: 100 });
  const classes = classData?.data || [];
  const courses = courseData?.data || [];
  const total = courseData?.total || 0;
  const totalPages = Math.ceil(total / coursesPerPage);
  const startIndex = (currentPage - 1) * coursesPerPage;
  const endIndex = startIndex + coursesPerPage;

  const createCourse = useCreateCourse({
    onSuccess: () => {
      setOpen(false);
      setName("");
      setCode("");
      setClassId("");
      setCurrentPage(1);
      refetch();
    },
  });
  const updateCourse = useUpdateCourse({
    onSuccess: () => {
      setEditId(null);
      setEditCourse(null);
      refetch();
    },
  });
  const deleteCourse = useDeleteCourse({
    onSuccess: () => {
      refetch();
    },
  });

  function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    createCourse.mutate({
      data: {
        name,
        code,
        classId,
      },
    });
  }

  function handleEditSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editId || !editCourse) return;
    updateCourse.mutate({
      id: editId,
      data: {
        name: editCourse.name,
        code: editCourse.code,
        classId: editCourse.classId,
      },
    });
  }

  function handleDelete(id: string) {
    deleteCourse.mutate({ id });
  }

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  return {
    open, setOpen,
    name, setName,
    code, setCode,
    classId, setClassId,
    editId, setEditId,
    editCourse, setEditCourse,
    currentPage, setCurrentPage,
    coursesPerPage,
    isLoading, error,
    createCourse, updateCourse, deleteCourse,
    courses, total, totalPages, startIndex, endIndex,
    classes, classLoading,
    handleSave, handleEditSave, handleDelete, goToPage,
  };
} 