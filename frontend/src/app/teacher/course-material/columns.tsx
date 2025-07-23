"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, MoreHorizontal, Edit, Trash2 } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type CourseMaterial = {
    id: string;
    title: string;
    description: string;
    url?: string;
    courseId: string;
    courseName?: string;
};

interface CreateColumnsParams {
    onEdit: (material: CourseMaterial) => void;
    onDelete: (id: string) => void;
    deletingItems?: Set<string>;
}

export const createColumns = ({ onEdit, onDelete, deletingItems }: CreateColumnsParams): ColumnDef<CourseMaterial>[] => [
    {
        accessorKey: "title",
        header: ({ column }) => (
            <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                className="h-8 p-0 hover:bg-transparent"
            >
                Title
                <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
        ),
        cell: ({ row }) => {
            const isDeleting = deletingItems?.has(row.original.id);
            return (
                <div className={`font-medium ${isDeleting ? 'opacity-50 line-through text-red-500' : ''}`}>
                    {row.getValue("title")}
                    {isDeleting && <span className="ml-2 text-xs text-red-500">(Deleting...)</span>}
                </div>
            );
        },
    },
    {
        accessorKey: "description",
        header: "Description",
        cell: ({ row }) => (
            <div className="max-w-[150px] sm:max-w-[200px] truncate" title={row.getValue("description")}>
                {row.getValue("description") || "N/A"}
            </div>
        ),
    },
    {
        accessorKey: "url",
        header: "File",
        cell: ({ row }) => {
            const url = row.getValue("url") as string;
            return url ? (
                <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline text-xs sm:text-sm max-w-[100px] sm:max-w-[150px] truncate block"
                    title={url.split('/').pop()}
                >
                    {url.split('/').pop()}
                </a>
            ) : (
                <span className="text-gray-500 text-xs sm:text-sm">No file</span>
            );
        },
    },
    {
        accessorKey: "courseName",
        header: ({ column }) => (
            <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                className="h-8 p-0 hover:bg-transparent"
            >
                Course
                <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
        ),
        cell: ({ row }) => (
            <div>{row.getValue("courseName") || "Unknown Course"}</div>
        ),
    },
    {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
            const material = row.original;

            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => onEdit(material)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() => onDelete(material.id)}
                            className="text-red-600 focus:text-red-600"
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    },
];
