"use client";
import dataProvider from '@/hooks/dataProvider';
import { useState } from 'react';

export function useParentList(page = 1, perPage = 10, filter = {}) {
  return dataProvider.useListQuery('parents', {
    page,
    perPage,
    filter,
    include: JSON.stringify({ parentLinks: { include: { student: true } } }),
  });
}

export function useAllStudents() {
  return dataProvider.useListQuery('students', { page: 1, perPage: 100 });
}

export function useCreateParent(options: any) {
  return dataProvider.useCreateMutation('parents', options);
}
export function useUpdateParent(options: any) {
  return dataProvider.useUpdateMutation('parents', options);
}
export function useDeleteParent(options: any) {
  return dataProvider.useDeleteMutation('parents', options);
}

export function useParentAdminState() {
  const [open, setOpen] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [editParent, setEditParent] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const parentsPerPage = 10;
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);

  const {
    data: parentData,
    isLoading,
    error,
    refetch,
  } = useParentList(currentPage, parentsPerPage);
  const { data: allStudentsData, isLoading: studentsLoading } = useAllStudents();
  const allStudents = allStudentsData?.data || [];

  const createParent = useCreateParent({
    onSuccess: () => {
      setOpen(false);
      setFirstName("");
      setLastName("");
      setEmail("");
      setPassword("");
      setCurrentPage(1);
      refetch();
    },
  });
  const updateParent = useUpdateParent({
    onSuccess: () => {
      setEditId(null);
      setEditParent(null);
      refetch();
    },
  });
  const deleteParent = useDeleteParent({
    onSuccess: () => {
      refetch();
    },
  });

  const parents = parentData?.data || [];
  const total = parentData?.total || 0;
  const totalPages = Math.ceil(total / parentsPerPage);
  const startIndex = (currentPage - 1) * parentsPerPage;
  const endIndex = startIndex + parentsPerPage;

  function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    createParent.mutate({
      data: {
        firstName,
        lastName,
        email,
        password,
        parentLinks: selectedStudentIds.map(studentId => ({ studentId })),
      },
    });
  }

  function handleEditSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editId || !editParent) return;
    updateParent.mutate({
      id: editId,
      data: {
        firstName: editParent.firstName,
        lastName: editParent.lastName,
        email: editParent.email,
        parentLinks: selectedStudentIds.map(studentId => ({ studentId })),
      },
    });
  }

  function handleDelete(id: string) {
    deleteParent.mutate({ id });
  }

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  return {
    open, setOpen,
    firstName, setFirstName,
    lastName, setLastName,
    email, setEmail,
    password, setPassword,
    editId, setEditId,
    editParent, setEditParent,
    currentPage, setCurrentPage,
    parentsPerPage,
    isLoading, error,
    createParent, updateParent, deleteParent,
    parents, total, totalPages, startIndex, endIndex,
    handleSave, handleEditSave, handleDelete, goToPage,
    allStudents,
    studentsLoading,
    selectedStudentIds,
    setSelectedStudentIds,
  };
} 