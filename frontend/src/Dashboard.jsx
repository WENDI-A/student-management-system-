import React from 'react';
import { Title } from 'react-admin';

export const Dashboard = () => {
    const currentDate = new Date().toLocaleDateString('en-US', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });

    return (
        <div className="p-6">
            <Title title="Dashboard" />
            
            {/* Semester Header */}
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Semester 2</h2>
                <span className="text-gray-500">{currentDate}</span>
            </div>

            {/* Timetable */}
            <div className="overflow-x-auto mb-8">
                <table className="min-w-full border-collapse">
                    <thead>
                        <tr>
                            <th className="border p-2 bg-gray-50">Day</th>
                            <th className="border p-2 bg-gray-50">2:00-2:45 AM</th>
                            <th className="border p-2 bg-gray-50">2:50-3:40 AM</th>
                            <th className="border p-2 bg-gray-50">3:45-4:30 AM</th>
                            <th className="border p-2 bg-gray-50">5:00-5:45 AM</th>
                            <th className="border p-2 bg-gray-50">5:45-6:30 AM</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td className="border p-2 font-medium">Monday</td>
                            <td className="border p-2">Physics</td>
                            <td className="border p-2">Maths</td>
                            <td className="border p-2">Sport</td>
                            <td className="border p-2"></td>
                            <td className="border p-2">English</td>
                        </tr>
                        <tr>
                            <td className="border p-2 font-medium">Tuesday</td>
                            <td className="border p-2"></td>
                            <td className="border p-2">
                                <div>2:50-3:40 AM</div>
                                <div>Physics</div>
                            </td>
                            <td className="border p-2">
                                <div>3:45-4:30 AM</div>
                                <div>Physics</div>
                            </td>
                            <td className="border p-2">
                                <div>5:00-5:45 AM</div>
                                <div>Physics</div>
                            </td>
                            <td className="border p-2">
                                <div>5:45-6:30 AM</div>
                                <div>Physics</div>
                            </td>
                        </tr>
                        <tr>
                            <td className="border p-2 font-medium">Wednesday</td>
                            <td className="border p-2">
                                <div>2:00-2:45 AM</div>
                                <div>Biology</div>
                            </td>
                            <td className="border p-2">
                                <div>2:50-3:40 AM</div>
                                <div>Chemistry</div>
                            </td>
                            <td className="border p-2"></td>
                            <td className="border p-2">
                                <div>5:00-5:45 AM</div>
                                <div>Maths</div>
                            </td>
                            <td className="border p-2">
                                <div>5:45-6:30 AM</div>
                                <div>Physics</div>
                            </td>
                        </tr>
                        <tr>
                            <td className="border p-2 font-medium">Thursday</td>
                            <td className="border p-2">
                                <div>2:00-2:45 AM</div>
                                <div>Maths</div>
                            </td>
                            <td className="border p-2">
                                <div>2:50-3:40 AM</div>
                                <div>Chemistry</div>
                            </td>
                            <td className="border p-2">
                                <div>3:45-4:30 AM</div>
                                <div>English</div>
                            </td>
                            <td className="border p-2">
                                <div>5:00-5:45 AM</div>
                                <div>Civics</div>
                            </td>
                            <td className="border p-2">
                                <div>5:45-6:30 AM</div>
                                <div>ICT</div>
                            </td>
                        </tr>
                        <tr>
                            <td className="border p-2 font-medium">Friday</td>
                            <td className="border p-2">
                                <div>2:00-2:45 AM</div>
                                <div>Chemistry</div>
                            </td>
                            <td className="border p-2">
                                <div>2:50-3:40 AM</div>
                                <div>Maths</div>
                            </td>
                            <td className="border p-2">
                                <div>3:45-4:30 AM</div>
                                <div>Physics</div>
                            </td>
                            <td className="border p-2"></td>
                            <td className="border p-2">
                                <div>5:45-6:30 AM</div>
                                <div>English</div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* Course Materials */}
            <div className="bg-gray-100 p-4 rounded-md">
                <h3 className="text-xl font-bold mb-4">Courses Materials</h3>
                <div className="grid md:grid-cols-2 gap-6">
                    <div>
                        <a
                            href="#"
                            className="text-blue-500 hover:underline text-lg font-medium"
                        >
                            Maths - Introduction to Logarithms
                        </a>
                        <p className="text-gray-600 text-sm">
                            What are Logarithms and Log Functions in Math?
                        </p>
                    </div>
                    <div>
                        <a
                            href="#"
                            className="text-blue-500 hover:underline text-lg font-medium"
                        >
                            Biology - Cell Theory
                        </a>
                        <p className="text-gray-600 text-sm">
                            Cell theory is a scientific...
                        </p>
                    </div>
                    <div>
                        <a
                            href="#"
                            className="text-blue-500 hover:underline text-lg font-medium"
                        >
                            Chemistry - Atomic Theory
                        </a>
                        <p className="text-gray-600 text-sm">
                            Atomic theory states that matter is...
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};