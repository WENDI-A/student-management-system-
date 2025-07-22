"use client";
import dataProvider from '@/hooks/dataProvider';
import { useState } from 'react';
import { useIdentity } from '@/hooks/auth/useIdentity';
import { validateFile, validateText } from '@/utils/validation';

export function useCourseMaterialList(page = 1, perPage = 10, filter = {}) {
  return dataProvider.useListQuery('coursematerial', { page, perPage, filter });
}

export function useCreateCourseMaterial(options: any = {}) {
  return dataProvider.useCreateMutation('coursematerial', {
    onSuccess: (data) => {
      if (options.onSuccess) {
        options.onSuccess(data);
      }
    },
    onError: (error) => {
      if (options.onError) {
        options.onError(error);
      }
    },
  });
}

export function useUpdateCourseMaterial(options: any = {}) {
  return dataProvider.useUpdateMutation('coursematerial', {
    onSuccess: (data) => {
      if (options.onSuccess) {
        options.onSuccess(data);
      }
    },
    onError: (error) => {
      if (options.onError) {
        options.onError(error);
      }
    },
  });
}

export function useDeleteCourseMaterial(options: any = {}) {
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
  
  // Validation states
  const [errors, setErrors] = useState<{
    title?: string;
    description?: string;
    file?: string;
    courseId?: string;
  }>({});

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

  // Custom setOpen function to clear errors when dialog is opened/closed
  const setOpenWithReset = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      // Clear errors when closing dialog
      setErrors({});
    }
  }

  function handleDelete(id: string) {
    deleteMaterial.mutate({ id });
  }

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  // Validation functions
  const validateInputs = (isEdit = false) => {
    const newErrors: {
      title?: string;
      description?: string;
      file?: string;
      courseId?: string;
    } = {};
    
    // Validate title
    const titleValue = isEdit ? editMaterial?.title : title;
    const titleValidation = validateText(titleValue, {
      required: true,
      minLength: 3,
      maxLength: 100
    });
    if (!titleValidation.isValid) {
      newErrors.title = titleValidation.message;
    }
    
    // Validate description (optional)
    const descValue = isEdit ? editMaterial?.description : description;
    if (descValue) {
      const descValidation = validateText(descValue, {
        required: false,
        maxLength: 500
      });
      if (!descValidation.isValid) {
        newErrors.description = descValidation.message;
      }
    }
    
    // Validate file
    const fileToValidate = isEdit ? editMaterial?.file : file;
    const isNewUpload = isEdit ? editMaterial?.file instanceof File : !!file;
    const fileValidation = validateFile(fileToValidate, {
      required: !isEdit && !fileToValidate, // Required only for new materials
      maxSize: 20 * 1024 * 1024, // 20MB
      allowedTypes: [
        'application/pdf',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ]
    });
    
    if (isNewUpload && !fileValidation.isValid) {
      newErrors.file = fileValidation.message;
    }
    
    // Validate course selection
    const courseIdValue = isEdit ? editMaterial?.courseId : courseId;
    if (!courseIdValue) {
      newErrors.courseId = 'Please select a course';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Update the form submission handlers to include validation
  function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!teacherId) return;
    
    // Validate inputs before submission
    if (!validateInputs()) {
      return; // Stop if validation fails
    }
    
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description || '');
    formData.append('courseId', courseId);
    formData.append('teacherId', teacherId);
    if (file) formData.append('file', file);
    
    createMaterial.mutate({ data: formData });
  }

  function handleEditSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editId || !editMaterial || !teacherId) return;
    
    // Validate inputs before submission
    if (!validateInputs(true)) {
      return; // Stop if validation fails
    }
    
    const formData = new FormData();
    formData.append('title', editMaterial.title);
    formData.append('description', editMaterial.description || '');
    formData.append('courseId', editMaterial.courseId);
    formData.append('teacherId', teacherId);
    if (editMaterial.file instanceof File) {
      formData.append('file', editMaterial.file);
    }
    
    updateMaterial.mutate({ id: editId, data: formData });
  }

  return {
    open, 
    setOpen: setOpenWithReset, // Use the custom function that clears errors
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
    errors, // Export errors for UI display
  };
} 