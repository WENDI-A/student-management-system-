"use client";

// import { useState } from "react";
import {
  Home,
  FileText,
  BookOpen,
  BarChart2,
  Calendar,
  MessageSquare,
  Bell,
  ChevronDown,
  User,
} from "lucide-react";
import Image from "../assets/hwu_logo.png";

export default function StudentDashboard() {
  // const [activeTab, setActiveTab] = useState("home");

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <header className="bg-blue-500 text-white p-3 flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-white p-1 flex items-center justify-center mr-3">
            <img
              src={Image}
              alt="School Logo"
              width={40}
              height={40}
              className="rounded-full"
            />
          </div>
          <h1 className="text-xl font-semibold">HU Model Community School</h1>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
            <User className="h-5 w-5 text-gray-600" />
          </div>
          <span>Full Name</span>
          <ChevronDown className="h-4 w-4" />
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 bg-gray-800 text-white flex flex-col">
          {/* Profile Section */}
          <div className="bg-gray-900 p-4 flex flex-col items-center">
            <div className="w-24 h-24 rounded-full bg-gray-700 mb-2 flex items-center justify-center">
              <User className="h-16 w-16 text-gray-400" />
            </div>
            <span className="text-lg font-medium">Grade 10 B</span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4">
            <ul className="space-y-2">
              <li>
                <a
                  href="#"
                  className="flex items-center gap-3 p-2 hover:bg-gray-700 rounded"
                >
                  <Home className="h-5 w-5" />
                  <span>Home</span>
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="flex items-center gap-3 p-2 hover:bg-gray-700 rounded"
                >
                  <FileText className="h-5 w-5" />
                  <span>Exam</span>
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="flex items-center gap-3 p-2 hover:bg-gray-700 rounded"
                >
                  <BookOpen className="h-5 w-5" />
                  <span>Assignments</span>
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="flex items-center gap-3 p-2 hover:bg-gray-700 rounded"
                >
                  <BarChart2 className="h-5 w-5" />
                  <span>Results</span>
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="flex items-center gap-3 p-2 hover:bg-gray-700 rounded"
                >
                  <Calendar className="h-5 w-5" />
                  <span>Attendance</span>
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="flex items-center gap-3 p-2 hover:bg-gray-700 rounded"
                >
                  <MessageSquare className="h-5 w-5" />
                  <span>Messages</span>
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="flex items-center gap-3 p-2 hover:bg-gray-700 rounded"
                >
                  <Bell className="h-5 w-5" />
                  <span>Announcement</span>
                </a>
              </li>
            </ul>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto bg-white">
          <div className="p-6">
            {/* Semester Header */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Semester 2</h2>
              <span className="text-gray-500">04/05/2024</span>
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
        </main>
      </div>
    </div>
  );
}
