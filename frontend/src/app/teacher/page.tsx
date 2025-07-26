"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart, Bar, XAxis, YAxis, PieChart, Pie } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { 
  Users, 
  FileText, 
  TrendingUp, 
  Clock, 
  BookOpen, 
  Calendar,
  GraduationCap,
  AlertCircle
} from "lucide-react";
import { useTeacherDashboard, useTeacherProfile } from "./dashboard";
import { format } from "date-fns";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

export default function TeacherDashboard() {
  const {
    isLoading,
    dashboardStats,
    courseAverages,
    gradeDistribution,
    recentAssessments,
    upcomingAssessments
  } = useTeacherDashboard();

  const { teacher, isLoading: profileLoading } = useTeacherProfile();

  // Dashboard stat cards with icons
  const statCards = [
    {
      title: "Total Students",
      value: dashboardStats.totalStudents,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-950"
    },
    {
      title: "Total Assessments",
      value: dashboardStats.totalAssessments,
      icon: FileText,
      color: "text-green-600",
      bgColor: "bg-green-50 dark:bg-green-950"
    },
    {
      title: "Average Grade",
      value: dashboardStats.averageGrade,
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-950"
    },
    {
      title: "Pending Grading",
      value: dashboardStats.pendingGrading,
      icon: Clock,
      color: "text-orange-600",
      bgColor: "bg-orange-50 dark:bg-orange-950"
    }
  ];

  if (isLoading || profileLoading) {
    return (
      <div className="container mx-auto p-6 space-y-8">
        {/* Header Skeleton */}
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        
        {/* Cards Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="p-6">
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-8 w-16" />
            </Card>
          ))}
        </div>

        {/* Charts Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="p-6">
            <Skeleton className="h-6 w-48 mb-4" />
            <Skeleton className="h-64 w-full" />
          </Card>
          <Card className="p-6">
            <Skeleton className="h-6 w-48 mb-4" />
            <Skeleton className="h-64 w-full" />
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Welcome Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome back, {teacher?.firstName || 'Teacher'}! 👋
        </h1>
        <p className="text-muted-foreground">
          Here&apos;s an overview of your teaching activities and student performance.
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.title} className="overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {card.title}
                </CardTitle>
                <div className={`${card.bgColor} p-2 rounded-md`}>
                  <Icon className={`h-4 w-4 ${card.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{card.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Course Averages Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              Average Grades by Course
            </CardTitle>
          </CardHeader>
          <CardContent>
            {courseAverages.length > 0 ? (
              <ChartContainer
                config={{
                  grade: {
                    label: "Average Grade",
                    color: "hsl(var(--primary))",
                  },
                }}
                className="h-[300px]"
              >
                <BarChart data={courseAverages}>
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 100]} />
                  <ChartTooltip 
                    content={<ChartTooltipContent formatter={(value) => [`${value}%`, 'Average Grade']} />}
                  />
                  <Bar dataKey="grade" fill="var(--color-grade)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ChartContainer>
            ) : (
              <div className="flex items-center justify-center h-64 text-muted-foreground">
                <div className="text-center">
                  <GraduationCap className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No graded assessments yet</p>
                  <p className="text-sm">Start grading assessments to see course averages</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Upcoming Assessments */}
            {upcomingAssessments.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2 text-muted-foreground">Upcoming Assessments</h4>
                <div className="space-y-2">
                  {upcomingAssessments.slice(0, 3).map((assessment: any) => (
                    <div key={assessment.id} className="flex items-start gap-2 p-2 rounded-md bg-muted/50">
                      <AlertCircle className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{assessment.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {assessment.course.name} • {format(new Date(assessment.date), 'MMM d')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Assessments */}
            {recentAssessments.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2 text-muted-foreground">Recent Assessments</h4>
                <div className="space-y-2">
                  {recentAssessments.slice(0, 3).map((assessment: any) => (
                    <div key={assessment.id} className="flex items-start gap-2 p-2 rounded-md hover:bg-muted/50">
                      <FileText className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{assessment.title}</p>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">
                            {assessment.type}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {assessment.course.name}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {upcomingAssessments.length === 0 && recentAssessments.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-sm">No recent activity</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Grade Distribution Chart */}
      {gradeDistribution.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Grade Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <ChartContainer
                config={gradeDistribution.reduce((acc, item, index) => {
                  acc[`grade${index}`] = {
                    label: item.name,
                    color: COLORS[index % COLORS.length],
                  };
                  return acc;
                }, {} as Record<string, any>)}
                className="h-[250px]"
              >
                <PieChart>
                  <Pie 
                    data={gradeDistribution.map((item, index) => ({
                      ...item,
                      fill: COLORS[index % COLORS.length]
                    }))} 
                    dataKey="value" 
                    nameKey="name" 
                    cx="50%" 
                    cy="50%" 
                    outerRadius={80} 
                    label={({ name, value }) => `${name}: ${value}`}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ChartContainer>

              {/* Manual Legend */}
              <div className="flex flex-wrap items-center justify-center gap-4">
                {gradeDistribution.map((item, index) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="text-sm text-muted-foreground">{item.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 