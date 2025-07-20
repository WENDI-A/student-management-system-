"use client";
import dataProvider from '@/hooks/dataProvider';
import { useState } from 'react';
import { useIdentity } from '@/hooks/auth/useIdentity';
import api from '@/lib/axios';

export function useCourseMaterialList(page = 1, perPage = 10, filter = {}) {
  return dataProvider.useListQuery('coursematerial', { page, perPage, filter });
}
export function useCreateCourseMaterial(options: any) {
  // Accept FormData and send as multipart/form-data
  return {
    mutate: (formData: FormData) =>
      api.post('/coursematerial', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      }).then(res => options?.onSuccess?.(res.data)).catch(options?.onError),
    isPending: false // You can wire up loading state if needed
  };
}
export function useUpdateCourseMaterial(options: any) {
  // Accept FormData and send as multipart/form-data
  return {
    mutate: ({ id, data }: { id: string, data: FormData }) =>
      api.put(`/coursematerial/${id}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      }).then(res => options?.onSuccess?.(res.data)).catch(options?.onError),
    isPending: false
  };
}
export function useDeleteCourseMaterial(options: any) {
  return dataProvider.useDeleteMutation('coursematerial', options);
}

export function useCourseListForTeacher() {
  const { data: identity } = useIdentity();
  const teacherId = typeof identity === 'object' && identity !== null && 'id' in identity ? (identity as any).id : undefined;
  // Use advanced search: filter courses where teachers.some.teacherId = teacherId
  return dataProvider.useListQuery('courses', {
    page: 1,
    perPage: 100,
    filter: teacherId ? { teachers: { some: { teacherId } } } : {},
  });
}

export function useCourseMaterialAdminState() {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [courseId, setCourseId] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [editMaterial, setEditMaterial] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const materialsPerPage = 10;

  const { data: identity } = useIdentity();
  const teacherId = typeof identity === 'object' && identity !== null && 'id' in identity ? (identity as any).id : undefined;
  const {
    data: materialData,
    isLoading,
    error,
    refetch,
  } = useCourseMaterialList(currentPage, materialsPerPage);
  const { data: courseData, isLoading: courseLoading } = useCourseListForTeacher();
  const courses = courseData?.data || [];

  const createMaterial = useCreateCourseMaterial({
    onSuccess: () => {
      setOpen(false);
      setTitle("");
      setDescription("");
      setFile(null);
      setCourseId("");
      setCurrentPage(1);
      refetch();
    },
  });
  const updateMaterial = useUpdateCourseMaterial({
    onSuccess: () => {
      setEditId(null);
      setEditMaterial(null);
      refetch();
    },
  });
  const deleteMaterial = useDeleteCourseMaterial({
    onSuccess: () => {
      refetch();
    },
  });

  const materials = materialData?.data || [];
  const total = materialData?.total || 0;
  const totalPages = Math.ceil(total / materialsPerPage);
  const startIndex = (currentPage - 1) * materialsPerPage;
  const endIndex = startIndex + materialsPerPage;

  function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!teacherId) return;
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('courseId', courseId);
    formData.append('teacherId', teacherId);
    if (file) formData.append('file', file);
    createMaterial.mutate(formData);
  }

  function handleEditSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editId || !editMaterial || !teacherId) return;
    const formData = new FormData();
    formData.append('title', editMaterial.title);
    formData.append('description', editMaterial.description);
    formData.append('courseId', editMaterial.courseId);
    formData.append('teacherId', teacherId);
    if (editMaterial.file) formData.append('file', editMaterial.file);
    updateMaterial.mutate({ id: editId, data: formData });
  }

  function handleDelete(id: string) {
    deleteMaterial.mutate({ id });
  }

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  return {
    open, setOpen,
    title, setTitle,
    description, setDescription,
    file, setFile,
    courseId, setCourseId,
    editId, setEditId,
    editMaterial, setEditMaterial,
    currentPage, setCurrentPage,
    materialsPerPage,
    isLoading, error,
    createMaterial, updateMaterial, deleteMaterial,
    materials, total, totalPages, startIndex, endIndex,
    handleSave, handleEditSave, handleDelete, goToPage,
    courses, courseLoading,
  };
} 