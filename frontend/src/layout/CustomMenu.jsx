import React from 'react';
import { Menu, useGetIdentity } from 'react-admin';
import {
    Home,
    FileText,
    BookOpen,
    BarChart2,
    Calendar,
    MessageSquare,
    Bell,
    User,
} from 'lucide-react';

export const CustomMenu = (props) => {
    const { identity } = useGetIdentity();
    
    return (
        <div className="w-64 bg-gray-800 text-white flex flex-col h-full">
            {/* Profile Section */}
            <div className="bg-gray-900 p-4 flex flex-col items-center">
                <div className="w-24 h-24 rounded-full bg-gray-700 mb-2 flex items-center justify-center">
                    <User className="h-16 w-16 text-gray-400" />
                </div>
                <span className="text-lg font-medium">Grade 10 B</span>
            </div>

            {/* Navigation */}
            <Menu {...props}>
                <Menu.Item 
                    to="/" 
                    primaryText="Home" 
                    leftIcon={<Home className="h-5 w-5" />}
                    className="flex items-center gap-3 p-2 hover:bg-gray-700 rounded"
                />
                <Menu.Item 
                    to="/exams" 
                    primaryText="Exam" 
                    leftIcon={<FileText className="h-5 w-5" />}
                    className="flex items-center gap-3 p-2 hover:bg-gray-700 rounded"
                />
                <Menu.Item 
                    to="/assignments" 
                    primaryText="Assignments" 
                    leftIcon={<BookOpen className="h-5 w-5" />}
                    className="flex items-center gap-3 p-2 hover:bg-gray-700 rounded"
                />
                <Menu.Item 
                    to="/results" 
                    primaryText="Results" 
                    leftIcon={<BarChart2 className="h-5 w-5" />}
                    className="flex items-center gap-3 p-2 hover:bg-gray-700 rounded"
                />
                <Menu.Item 
                    to="/attendance" 
                    primaryText="Attendance" 
                    leftIcon={<Calendar className="h-5 w-5" />}
                    className="flex items-center gap-3 p-2 hover:bg-gray-700 rounded"
                />
                <Menu.Item 
                    to="/messages" 
                    primaryText="Messages" 
                    leftIcon={<MessageSquare className="h-5 w-5" />}
                    className="flex items-center gap-3 p-2 hover:bg-gray-700 rounded"
                />
                <Menu.Item 
                    to="/announcements" 
                    primaryText="Announcement" 
                    leftIcon={<Bell className="h-5 w-5" />}
                    className="flex items-center gap-3 p-2 hover:bg-gray-700 rounded"
                />
            </Menu>
        </div>
    );
};