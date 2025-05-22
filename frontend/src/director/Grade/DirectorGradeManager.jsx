import React, { useEffect, useState } from "react";
import {
  List,
  Datagrid,
  TextField,
  EmailField,
  FunctionField,
  useDataProvider,
  useNotify,
} from "react-admin";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField as MuiTextField,
} from "@mui/material";

const GradeEditModal = ({ open, grade, onSave, onCancel }) => {
  const [score, setScore] = useState(grade?.score || "");
  const [feedback, setFeedback] = useState(grade?.feedback || "");

  useEffect(() => {
    setScore(grade?.score || "");
    setFeedback(grade?.feedback || "");
  }, [grade]);

  if (!grade) return null;

  return (
    <Dialog open={open} onClose={onCancel}>
      <DialogTitle>Edit Grade</DialogTitle>
      <DialogContent>
        <MuiTextField
          label="Score"
          type="number"
          value={score}
          onChange={e => setScore(Number(e.target.value))}
          fullWidth
          margin="normal"
        />
        <MuiTextField
          label="Feedback"
          value={feedback}
          onChange={e => setFeedback(e.target.value)}
          fullWidth
          margin="normal"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel}>Cancel</Button>
        <Button
          onClick={() => onSave({ ...grade, score, feedback })}
          variant="contained"
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const DirectorGradeManager = props => {
  const dataProvider = useDataProvider();
  const notify = useNotify();
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [grades, setGrades] = useState([]);
  const [editingGrade, setEditingGrade] = useState(null);

  // Fetch grades for selected student
  useEffect(() => {
    if (selectedStudent) {
      dataProvider
        .getOne("director-grade", { id: selectedStudent.id })
        .then(({ data }) => {
          setGrades(data.grades || []);
        });
    } else {
      setGrades([]);
    }
  }, [selectedStudent, dataProvider]);

  // Save handler for modal
  const handleSave = updatedGrade => {
    dataProvider
      .update("update-grade", { id: updatedGrade.id, data: updatedGrade })
      .then(() => {
        notify("Grade updated", { type: "success" });
        setEditingGrade(null);
        // Refresh grades
        dataProvider
          .getOne("director-grade", { id: selectedStudent.id })
          .then(({ data }) => setGrades(data.grades || []));
      });
  };

  // Helper: Group grades by course
  const groupedByCourse = grades.reduce((acc, grade) => {
    const courseId = grade.Course?.id || grade.course_id;
    if (!acc[courseId]) {
      acc[courseId] = {
        courseName: grade.Course?.Course_name || grade.course_id,
        grades: [],
      };
    }
    acc[courseId].grades.push(grade);
    return acc;
  }, {});

  // Student List
  if (!selectedStudent) {
    return (
      <List {...props} title="Students" resource="students" perPage={100}>
        <Datagrid rowClick={(id, resource, record) => setSelectedStudent(record)}>
          <FunctionField
            label="Name"
            render={record => `${record.firstName} ${record.lastName}`}
          />
          <TextField source="student_id" label="Student ID" />
          <EmailField source="email" />
          <TextField source="grade" label="Class" />
        </Datagrid>
      </List>
    );
  }

  // Grades List for Selected Student (custom table, grouped by course, each course its own table)
  return (
    <div className="p-4">
      <button
        onClick={() => setSelectedStudent(null)}
        className="mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition dark:bg-blue-600 dark:hover:bg-blue-700"
      >
        &larr; Back to list
      </button>
      <h3 className="text-2xl font-semibold mb-8 text-gray-900 dark:text-gray-100">
        Grades for {selectedStudent.firstName} {selectedStudent.lastName}
      </h3>
      <div className="space-y-8">
        {Object.values(groupedByCourse).map((group, idx) => {
          const totalWeight = group.grades.reduce((sum, g) => sum + (g.Assessment?.weight || 0), 0);
          const totalScore = group.grades.reduce((sum, g) => sum + (g.score || 0), 0);
          return (
            <div
              key={group.courseName + idx}
              className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm"
            >
              {/* Course header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <span className="font-bold text-lg text-blue-900 dark:text-blue-200">{group.courseName}</span>
                <span className="text-sm text-gray-700 dark:text-gray-300 font-semibold">
                  w/s/100: {totalWeight} / {totalScore} / 100
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="bg-gray-100 dark:bg-gray-800">
                      <th className="px-4 py-2 border-b text-left text-gray-700 dark:text-gray-200 dark:border-gray-700">Assessment</th>
                      <th className="px-4 py-2 border-b text-left text-gray-700 dark:text-gray-200 dark:border-gray-700">Score</th>
                      <th className="px-4 py-2 border-b text-left text-gray-700 dark:text-gray-200 dark:border-gray-700">Feedback</th>
                      <th className="px-4 py-2 border-b text-left text-gray-700 dark:text-gray-200 dark:border-gray-700">Edit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {group.grades.map(grade => (
                      <tr
                        key={grade.id}
                        className="hover:bg-blue-50 dark:hover:bg-blue-900 transition border-b last:border-b-0 border-gray-200 dark:border-gray-700"
                      >
                        <td className="px-4 py-2 text-gray-900 dark:text-gray-100">{grade.Assessment?.title || grade.assessment_id}</td>
                        <td className="px-4 py-2 text-gray-900 dark:text-gray-100">{grade.score}</td>
                        <td className="px-4 py-2 text-gray-900 dark:text-gray-100">{grade.feedback}</td>
                        <td className="px-4 py-2">
                          <Button
                            variant="outlined"
                            size="small"
                            className="!border-blue-500 !text-blue-500 hover:!bg-blue-50 dark:!border-blue-400 dark:!text-blue-400 dark:hover:!bg-blue-900"
                            onClick={() => setEditingGrade(grade)}
                          >
                            Edit
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
      </div>
      <GradeEditModal
        open={!!editingGrade}
        grade={editingGrade}
        onSave={handleSave}
        onCancel={() => setEditingGrade(null)}
      />
    </div>
  );
};

export default DirectorGradeManager; 