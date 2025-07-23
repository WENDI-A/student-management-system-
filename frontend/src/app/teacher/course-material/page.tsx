"use client";
import React, { useState, useCallback } from 'react';
import { useCourseMaterialAdminState } from './coursematerial';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table/data-table";
import { CourseMaterialModal } from "@/components/modals/model";
import { createColumns, CourseMaterial } from "./columns";
import { useSnackbar } from "notistack";

export default function CourseMaterialAdmin() {
    const state = useCourseMaterialAdminState();
    const {
        open,
        setOpen,
        title,
        setTitle,
        description,
        setDescription,
        file,
        setFile,
        courseId,
        setCourseId,
        editId,
        setEditId,
        editMaterial,
        setEditMaterial,
        materials,
        createMaterial,
        updateMaterial,
        handleSave,
        handleEditSave,
        handleDelete,
        handleBulkDelete,
        handleUndo,
        courses,
        errors,
    } = state;

    const { enqueueSnackbar, closeSnackbar } = useSnackbar();

    // State for individual delete with undo
    const [pendingDeletes, setPendingDeletes] = useState<Map<string, NodeJS.Timeout>>(new Map());
    const [deletingItems, setDeletingItems] = useState<Set<string>>(new Set());

    // Handle individual delete with 5-second undo
    const handleIndividualDelete = useCallback((id: string) => {
        const material = materials.find((m: MaterialData) => m.id === id);
        if (!material) return;

        // Clear any existing timer for this item
        setPendingDeletes(prev => {
            const existingTimer = prev.get(id);
            if (existingTimer) {
                clearTimeout(existingTimer);
            }
            return prev;
        });

        // Add to deleting items set
        setDeletingItems(prev => new Set(prev).add(id));

        // Show snackbar with undo option
        const snackbarId = enqueueSnackbar(`"${material.title}" will be deleted in 5 seconds`, {
            variant: 'warning',
            persist: true,
            action: (key) => (
                <Button
                    size="sm"
                    variant="ghost"
                    className="text-white hover:text-white/80"
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleUndoIndividualDelete(id);
                        closeSnackbar(key);
                    }}
                >
                    Undo
                </Button>
            ),
        });

        // Set timer for actual deletion
        const timer = setTimeout(() => {
            // Actually delete the item
            handleDelete(id);
            
            // Clean up state
            setPendingDeletes(prev => {
                const newMap = new Map(prev);
                newMap.delete(id);
                return newMap;
            });
            setDeletingItems(prev => {
                const newSet = new Set(prev);
                newSet.delete(id);
                return newSet;
            });
            
            closeSnackbar(snackbarId);
            enqueueSnackbar(`"${material.title}" deleted`, { variant: 'success' });
        }, 5000);

        // Store the timer
        setPendingDeletes(prev => new Map(prev).set(id, timer));
    }, [materials, handleDelete, enqueueSnackbar, closeSnackbar]);

    // Handle undo for individual delete
    const handleUndoIndividualDelete = useCallback((id: string) => {
        let timerCleared = false;
        
        setPendingDeletes(prev => {
            const timer = prev.get(id);
            if (timer) {
                clearTimeout(timer);
                timerCleared = true;
                const newMap = new Map(prev);
                newMap.delete(id);
                return newMap;
            }
            return prev;
        });
        
        setDeletingItems(prev => {
            const newSet = new Set(prev);
            newSet.delete(id);
            return newSet;
        });
        
        if (timerCleared) {
            const material = materials.find((m: MaterialData) => m.id === id);
            enqueueSnackbar(`"${material?.title || 'Item'}" deletion cancelled`, { variant: 'success' });
        }
    }, [materials, enqueueSnackbar]);

    // Cleanup timers on unmount
    React.useEffect(() => {
        return () => {
            pendingDeletes.forEach(timer => clearTimeout(timer));
        };
    }, [pendingDeletes]);

    // Define types for better type safety
    interface Course {
        id: string;
        name: string;
    }

    interface MaterialData {
        id: string;
        title: string;
        description: string;
        url?: string;
        courseId: string;
        file?: File | null;
    }

    // Transform materials data for DataTable with course names
    const tableData: CourseMaterial[] = materials.map((material: MaterialData) => {
        const course = courses.find((c: Course) => c.id === material.courseId);
        return {
            ...material,
            courseName: course?.name || "Unknown Course",
        };
    });

    // Column definitions with actions
    const columns = createColumns({
        onEdit: (material: CourseMaterial) => {
            setEditId(material.id);
            setEditMaterial(material);
            setOpen(true);
        },
        onDelete: (id: string) => {
            handleIndividualDelete(id);
        },
        deletingItems,
    });

    // Handle modal form data changes with better type safety
    const handleFormDataChange = (field: string, value: unknown) => {
        if (editId && editMaterial) {
            // For edit mode, update editMaterial
            setEditMaterial({ ...editMaterial, [field]: value });
        } else {
            // For create mode, update form state
            switch (field) {
                case "title":
                    setTitle(value as string);
                    break;
                case "description":
                    setDescription(value as string);
                    break;
                case "file":
                    setFile(value as File | null);
                    break;
                case "courseId":
                    setCourseId(value as string);
                    break;
                default:
                    console.warn(`Unknown field: ${field}`);
            }
        }
    };

    // Use the handleBulkDelete from state instead of local function

    // Clear form when opening modal for create
    const handleOpenCreate = () => {
        setOpen(true);
        setEditId(null);
        setEditMaterial(null);
        setTitle("");
        setDescription("");
        setFile(null);
        setCourseId("");
    };

    return (
        <>
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Course Materials</h1>
                    <p className="text-sm text-muted-foreground mt-1">Manage and organize course materials</p>
                </div>
                <Button
                    onClick={handleOpenCreate}
                    className="bg-primary hover:bg-primary/90 w-full sm:w-auto h-10 px-4"
                >
                    + Create Material
                </Button>
            </div>

            {/* Data Table Section */}
            <Card className="shadow-sm">
                <CardContent className="p-4 sm:p-6">
                    <DataTable
                        columns={columns}
                        data={tableData}
                        onDelete={handleBulkDelete}
                        onUndo={handleUndo}
                        searchKey="title"
                        searchPlaceholder="Search materials..."
                        emptyMessage="No course materials found. Create your first material!"
                        enableColumnVisibility={true}
                        enableSelection={true}
                        enableSearch={true}
                        enablePagination={true}
                        pageSize={8}
                    />
                </CardContent>
            </Card>

            {/* Course Material Modal */}
            <CourseMaterialModal
                open={open}
                onOpenChange={setOpen}
                title={editId ? "Edit Course Material" : "Create Course Material"}
                formData={{
                    title: editId ? editMaterial?.title || "" : title,
                    description: editId ? editMaterial?.description || "" : description,
                    file: editId ? editMaterial?.file || null : file,
                    courseId: editId ? editMaterial?.courseId || "" : courseId,
                }}
                onFormDataChange={handleFormDataChange}
                courses={courses}
                onSubmit={editId ? handleEditSave : handleSave}
                isLoading={createMaterial.isPending || updateMaterial.isPending}
                errors={errors}
                isEdit={!!editId}
                editMaterial={editMaterial}
            />
        </>
    );
} 