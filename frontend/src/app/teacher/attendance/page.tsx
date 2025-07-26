"use client";
import { useAttendanceAdminState } from './attendance';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Calendar,
    Users,
    CheckCircle,
    XCircle,
    Clock,
    AlertCircle,
    Loader2,
    Search,
    CheckSquare,
    Square
} from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { useState, useMemo, useEffect } from "react";

export default function AttendanceAdmin() {
    const {
        selectedCourse,
        setSelectedCourse,
        selectedDate,
        setSelectedDate,
        studentAttendance,
        updateStudentAttendance,
        isSaving,
        students,
        studentsLoading,
        courses,
        coursesLoading,
        attendanceLoading,
        selectedCourseData,
        getStudentAttendanceStatus,
        isStudentMarked
    } = useAttendanceAdminState();

    // Local state for search, filter, and pagination
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [currentPage, setCurrentPage] = useState(1);
    const [studentsPerPage] = useState(20);
    const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set());

    // Reset UI state when date or course changes
    useEffect(() => {
        setSelectedStudents(new Set());
        setCurrentPage(1);
        setSearchQuery("");
        setStatusFilter("ALL");
    }, [selectedDate, selectedCourse]);

    // Get status badge color
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PRESENT':
                return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border-green-200 dark:border-green-700';
            case 'ABSENT':
                return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 border-red-200 dark:border-red-700';
            case 'LATE':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 border-yellow-200 dark:border-yellow-700';
            case 'EXCUSED':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 border-blue-200 dark:border-blue-700';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200 border-gray-200 dark:border-gray-700';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "PRESENT": return <CheckCircle className="h-4 w-4" />;
            case "ABSENT": return <XCircle className="h-4 w-4" />;
            case "LATE": return <Clock className="h-4 w-4" />;
            case "EXCUSED": return <AlertCircle className="h-4 w-4" />;
            default: return null;
        }
    };

    // Filter and paginate students
    const filteredStudents = useMemo(() => {
        if (!students) return [];

        return students.filter((student: any) => {
            const matchesSearch = searchQuery === "" ||
                `${student.firstName} ${student.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
                student.code.toLowerCase().includes(searchQuery.toLowerCase());

            const studentStatus = getStudentAttendanceStatus ? getStudentAttendanceStatus(student.id) || "NOT_MARKED" : "NOT_MARKED";
            const matchesStatus = statusFilter === "ALL" ||
                (statusFilter === "NOT_MARKED" && !getStudentAttendanceStatus?.(student.id)) ||
                studentStatus === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [students, searchQuery, statusFilter, getStudentAttendanceStatus]);

    // Pagination
    const totalPages = Math.ceil(filteredStudents.length / studentsPerPage);
    const paginatedStudents = useMemo(() => {
        const startIndex = (currentPage - 1) * studentsPerPage;
        return filteredStudents.slice(startIndex, startIndex + studentsPerPage);
    }, [filteredStudents, currentPage, studentsPerPage]);

    // Bulk actions
    const handleSelectAll = () => {
        if (selectedStudents.size === paginatedStudents.length) {
            setSelectedStudents(new Set());
        } else {
            setSelectedStudents(new Set(paginatedStudents.map((s: any) => s.id)));
        }
    };

    const handleSelectStudent = (studentId: string) => {
        const newSelected = new Set(selectedStudents);
        if (newSelected.has(studentId)) {
            newSelected.delete(studentId);
        } else {
            newSelected.add(studentId);
        }
        setSelectedStudents(newSelected);
    };

    const handleBulkAttendance = (status: string) => {
        selectedStudents.forEach(studentId => {
            updateStudentAttendance(studentId, status);
        });
        setSelectedStudents(new Set());
    };

    const handleSearchChange = (value: string) => {
        setSearchQuery(value);
        setCurrentPage(1);
    };

    const handleStatusFilterChange = (value: string) => {
        setStatusFilter(value);
        setCurrentPage(1);
    };

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold">Attendance Management</h1>
                    <p className="text-sm text-muted-foreground mt-1">Track and manage student attendance with automatic saving</p>
                </div>
            </div>

            {/* Course and Date Selection */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-primary" />
                        <span>Attendance Settings</span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="course">Select Course</Label>
                            <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                                <SelectTrigger id="course">
                                    <SelectValue placeholder="Select a course" />
                                </SelectTrigger>
                                <SelectContent>
                                    {coursesLoading ? (
                                        <div className="flex items-center justify-center p-2">
                                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                            <span>Loading courses...</span>
                                        </div>
                                    ) : courses.length === 0 ? (
                                        <div className="flex items-center justify-center p-4 text-muted-foreground">
                                            <span>No courses assigned</span>
                                        </div>
                                    ) : (
                                        courses.map((course: any) => (
                                            <SelectItem key={course.id} value={course.id}>
                                                <div className="flex flex-col">
                                                    <span className="font-medium">{course.name}</span>
                                                    {course.class && (
                                                        <span className="text-xs text-muted-foreground">
                                                            Class: {course.class.name}{course.class.section ? ` - ${course.class.section}` : ''}
                                                        </span>
                                                    )}
                                                </div>
                                            </SelectItem>
                                        ))
                                    )}
                                </SelectContent>
                            </Select>
                            {selectedCourseData && (
                                <div className="text-sm text-muted-foreground mt-2 p-2 bg-muted/50 rounded">
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium">Selected:</span>
                                        <span>{selectedCourseData.name}</span>
                                    </div>
                                    {selectedCourseData.class && (
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="font-medium">Class:</span>
                                            <span>{selectedCourseData.class.name}{selectedCourseData.class.section ? ` - ${selectedCourseData.class.section}` : ''}</span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="date">Select Date</Label>
                            <Input
                                id="date"
                                type="date"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                max={new Date().toISOString().split("T")[0]}
                            />
                            <div className="text-sm text-muted-foreground">
                                {format(new Date(selectedDate), "EEEE, MMMM d, yyyy")}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Student Attendance */}
            {selectedCourse && (
                <Card>
                    <CardHeader>
                        <div className="flex flex-col gap-4">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                <CardTitle className="flex items-center gap-2">
                                    <Users className="h-5 w-5 text-primary" />
                                    <span>Student Attendance</span>
                                    <span className="text-sm font-normal text-muted-foreground">
                                        ({filteredStudents.length} students)
                                    </span>
                                </CardTitle>
                                <div className="text-sm text-muted-foreground">
                                    {format(new Date(selectedDate), "EEEE, MMMM d, yyyy")}
                                </div>
                            </div>

                            {/* Search and Filters */}
                            <div className="flex flex-col sm:flex-row gap-3">
                                <div className="relative flex-1 max-w-sm">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search students by name or code..."
                                        value={searchQuery}
                                        onChange={(e) => handleSearchChange(e.target.value)}
                                        className="pl-9"
                                    />
                                </div>
                                <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
                                    <SelectTrigger className="w-full sm:w-48">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ALL">All Students</SelectItem>
                                        <SelectItem value="NOT_MARKED">Not Marked</SelectItem>
                                        <SelectItem value="PRESENT">Present</SelectItem>
                                        <SelectItem value="ABSENT">Absent</SelectItem>
                                        <SelectItem value="LATE">Late</SelectItem>
                                        <SelectItem value="EXCUSED">Excused</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Bulk Actions */}
                            {selectedStudents.size > 0 && (
                                <div className="flex flex-wrap items-center gap-2 p-3 bg-muted/50 rounded-lg">
                                    <span className="text-sm font-medium">
                                        {selectedStudents.size} student{selectedStudents.size > 1 ? 's' : ''} selected
                                    </span>
                                    <div className="flex gap-1 ml-auto">
                                        {["PRESENT", "ABSENT", "LATE", "EXCUSED"].map((status) => (
                                            <Button
                                                key={status}
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handleBulkAttendance(status)}
                                                className="text-xs px-2 py-1 h-7"
                                                disabled={isSaving}
                                            >
                                                {getStatusIcon(status)}
                                                <span className="ml-1 hidden sm:inline">
                                                    {status.charAt(0) + status.slice(1).toLowerCase()}
                                                </span>
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {(isSaving || attendanceLoading) && (
                                <div className="text-sm text-muted-foreground flex items-center gap-2">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    {isSaving ? 'Auto-saving attendance changes...' : 'Loading attendance data...'}
                                </div>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent>
                        {studentsLoading ? (
                            <div className="flex items-center justify-center py-12">
                                <Loader2 className="h-8 w-8 animate-spin mr-3" />
                                <span className="text-lg">Loading students...</span>
                            </div>
                        ) : students.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">
                                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                <p className="text-lg font-medium">No students found for this course.</p>
                                <p className="text-sm mt-2">
                                    {selectedCourseData ? 
                                        `No students are enrolled in "${selectedCourseData.name}".` :
                                        'Please select a course to view students.'
                                    }
                                </p>
                                {selectedCourseData?.class && (
                                    <p className="text-xs mt-1 text-muted-foreground/80">
                                        Class: {selectedCourseData.class.name}{selectedCourseData.class.section ? ` - ${selectedCourseData.class.section}` : ''}
                                    </p>
                                )}
                            </div>
                        ) : filteredStudents.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">
                                <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                <p className="text-lg font-medium">No students match your filters.</p>
                                <p className="text-sm mt-2">Try adjusting your search or filter criteria.</p>
                            </div>
                        ) : (
                            <>
                                {/* Students List */}
                                <div className="space-y-2">
                                    {/* Select All Header */}
                                    <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg border-2 border-dashed">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={handleSelectAll}
                                            className="h-6 w-6 p-0"
                                        >
                                            {selectedStudents.size === paginatedStudents.length ?
                                                <CheckSquare className="h-4 w-4" /> :
                                                <Square className="h-4 w-4" />
                                            }
                                        </Button>
                                        <span className="text-sm font-medium text-muted-foreground">
                                            Select All ({paginatedStudents.length} students)
                                        </span>
                                    </div>

                                    {/* Student Rows */}
                                    {paginatedStudents.map((student: any, index: number) => {
                                        const currentStatus = getStudentAttendanceStatus(student.id);
                                        const isMarked = isStudentMarked(student.id);
                                        
                                        return (
                                            <div
                                                key={student.id}
                                                className={`
                                                    flex flex-col gap-4 p-4 border rounded-lg transition-all duration-200
                                                    sm:flex-row sm:items-center sm:gap-3 sm:p-4
                                                    hover:bg-muted/50 hover:shadow-sm
                                                    ${selectedStudents.has(student.id) ? 'bg-primary/5 border-primary/20 shadow-sm' : 'bg-card'}
                                                    ${!isMarked ? 'border-dashed border-muted-foreground/30' : ''}
                                                `}
                                            >
                                                {/* Student Info */}
                                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleSelectStudent(student.id)}
                                                        className="h-6 w-6 p-0 shrink-0"
                                                    >
                                                        {selectedStudents.has(student.id) ?
                                                            <CheckSquare className="h-4 w-4" /> :
                                                            <Square className="h-4 w-4" />
                                                        }
                                                    </Button>
                                                    
                                                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary font-medium text-sm shrink-0">
                                                        {((currentPage - 1) * studentsPerPage) + index + 1}
                                                    </div>
                                                    
                                                    <div className="min-w-0 flex-1">
                                                        <h3 className="font-medium truncate">
                                                            {student.firstName} {student.lastName}
                                                        </h3>
                                                        <p className="text-sm text-muted-foreground">{student.code}</p>
                                                    </div>

                                                    <div className="hidden sm:block">
                                                        {isMarked ? (
                                                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(currentStatus)}`}>
                                                                {getStatusIcon(currentStatus)}
                                                                {currentStatus}
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700">
                                                                <AlertCircle className="h-3 w-3" />
                                                                Not Marked
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Attendance Buttons */}
                                                <div className="flex gap-2">
                                                    {["PRESENT", "ABSENT", "LATE", "EXCUSED"].map((status) => {
                                                        const isSelected = isMarked && currentStatus === status;
                                                        return (
                                                            <Button
                                                                key={status}
                                                                variant={isSelected ? "default" : "outline"}
                                                                size="sm"
                                                                className={`text-xs px-3 transition-all ${
                                                                    isSelected
                                                                        ? `${getStatusColor(status)} shadow-sm`
                                                                        : "hover:bg-muted/80 border-muted-foreground/30 bg-background"
                                                                }`}
                                                                onClick={() => updateStudentAttendance(student.id, status)}
                                                                disabled={isSaving}
                                                            >
                                                                <span className="flex items-center gap-1">
                                                                    {getStatusIcon(status)}
                                                                    <span className="hidden sm:inline">
                                                                        {status.charAt(0) + status.slice(1).toLowerCase()}
                                                                    </span>
                                                                </span>
                                                            </Button>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Pagination */}
                                {totalPages > 1 && (
                                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-4 border-t">
                                        <div className="text-sm text-muted-foreground">
                                            Showing {((currentPage - 1) * studentsPerPage) + 1} to {Math.min(currentPage * studentsPerPage, filteredStudents.length)} of {filteredStudents.length} students
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setCurrentPage(currentPage - 1)}
                                                disabled={currentPage === 1}
                                                className="px-3"
                                            >
                                                Previous
                                            </Button>
                                            <div className="flex items-center gap-1">
                                                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                                                    let pageNum;
                                                    if (totalPages <= 5) {
                                                        pageNum = i + 1;
                                                    } else if (currentPage <= 3) {
                                                        pageNum = i + 1;
                                                    } else if (currentPage >= totalPages - 2) {
                                                        pageNum = totalPages - 4 + i;
                                                    } else {
                                                        pageNum = currentPage - 2 + i;
                                                    }

                                                    return (
                                                        <Button
                                                            key={pageNum}
                                                            variant={currentPage === pageNum ? "default" : "outline"}
                                                            size="sm"
                                                            onClick={() => setCurrentPage(pageNum)}
                                                            className="w-8 h-8 p-0"
                                                        >
                                                            {pageNum}
                                                        </Button>
                                                    );
                                                })}
                                            </div>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setCurrentPage(currentPage + 1)}
                                                disabled={currentPage === totalPages}
                                                className="px-3"
                                            >
                                                Next
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}