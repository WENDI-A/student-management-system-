import dataProvider from '@/hooks/dataProvider';
import { useState } from 'react';

export interface Student {
  id?: string;
  code?: string;
  firstName: string;
  lastName: string;
  email: string;
  classId?: string;
}

export function useCreateStudent(options?: {
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
}) {
  return dataProvider.useCreateMutation('students', options);
}

export function useUpdateStudent(options?: {
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
}) {
  return dataProvider.useUpdateMutation('students', options);
}

export function useDeleteStudent(options?: {
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
}) {
  return dataProvider.useDeleteMutation('students', options);
}

export function getToday() {
  const d = new Date();
  return d.toISOString().split("T")[0];
}

export function useStudentAdminState() {
  const [open, setOpen] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [classId, setClassId] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [editStudent, setEditStudent] = useState<Student | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const studentsPerPage = 10;
  const today = getToday();

  // React Query hooks
  const {
    data,
    isLoading,
    error,
    refetch,
  } = dataProvider.useListQuery('students', {
    page: currentPage,
    perPage: studentsPerPage,
    filter: { include: JSON.stringify({ grades: true }) },
  });
  const createStudent = useCreateStudent({
    onSuccess: () => {
      setOpen(false);
      setFirstName("");
      setLastName("");
      setEmail("");
      setCode("");
      setClassId("");
      setCurrentPage(1);
      refetch();
    },
  });
  const updateStudent = useUpdateStudent({
    onSuccess: () => {
      setEditId(null);
      setEditStudent(null);
      refetch();
    },
  });
  const deleteStudent = useDeleteStudent({
    onSuccess: () => {
      refetch();
    },
  });

  const { data: classData, isLoading: classLoading } = dataProvider.useListQuery('classes', { page: 1, perPage: 100 });
  const classes = classData?.data || [];

  const students: Student[] = data?.data || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / studentsPerPage);
  const startIndex = (currentPage - 1) * studentsPerPage;
  const endIndex = startIndex + studentsPerPage;

  function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // Validate code format: 1378/14
    if (!/^\d{1,10}\/\d{1,10}$/.test(code)) {
      alert('Student code must be in the format 1378/14');
      return;
    }
    createStudent.mutate({
      data: {
        code,
        firstName,
        lastName,
        email,
        classId,
      },
    });
  }

  function handleEditSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editId || !editStudent) return;
    // Validate code format: 1378/14
    if (!/^\d{1,10}\/\d{1,10}$/.test(editStudent.code || "")) {
      alert('Student code must be in the format 1378/14');
      return;
    }
    updateStudent.mutate({
      id: editId,
      data: {
        ...editStudent,
        password: undefined, // don't send password on edit
      },
    });
  }

  function handleDelete(id: string) {
    deleteStudent.mutate({ id });
  }

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  return {
    open, setOpen,
    firstName, setFirstName,
    lastName, setLastName,
    email, setEmail,
    code, setCode,
    classId, setClassId,
    editId, setEditId,
    editStudent, setEditStudent,
    currentPage, setCurrentPage,
    studentsPerPage,
    today,
    data, isLoading, error, refetch,
    createStudent, updateStudent, deleteStudent,
    classData, classLoading, classes,
    students, total, totalPages, startIndex, endIndex,
    handleSave, handleEditSave, handleDelete, goToPage,
  };
} 