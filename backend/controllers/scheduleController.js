const db = require('../models');
const Schedule = db.Schedule;
const Course = db.Course;
const { Op } = require('sequelize');

exports.createSchedule = async (req, res) => {
  try {
    const { course_id, day_of_week, start_time, end_time, room_number } = req.body;

    // Validate required fields
    if (!course_id || !day_of_week || !start_time || !end_time) {
      return res.status(400).json({
        success: false,
        message: 'Please provide course_id, day_of_week, start_time, and end_time'
      });
    }

    // Check if course exists
    const courseExists = await Course.findByPk(course_id);
    if (!courseExists) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check for scheduling conflicts
    const conflictingSchedule = await Schedule.findOne({
      where: {
        day_of_week,
        [Op.or]: [
          {
            start_time: {
              [Op.lt]: end_time
            },
            end_time: {
              [Op.gt]: start_time
            }
          }
        ],
        room_number,
        isActive: true
      }
    });

    if (conflictingSchedule) {
      return res.status(400).json({
        success: false,
        message: 'There is already a class scheduled in this room during the specified time'
      });
    }

    const newSchedule = await Schedule.create({
      course_id,
      day_of_week,
      start_time,
      end_time,
      room_number
    });

    return res.status(201).json({
      success: true,
      message: 'Schedule created successfully',
      data: newSchedule
    });
  } catch (error) {
    console.error('Error creating schedule:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create schedule',
      error: error.message
    });
  }
};

// Get all schedules
exports.getAllSchedules = async (req, res) => {
  try {
    const schedules = await Schedule.findAll({
      where: {
        isActive: true
      },
      include: [
        {
          model: Course,
          as: 'course',
          attributes: ['id', 'Course_name', 'Course_code', 'grade']
        }
      ],
      order: [
        ['day_of_week', 'ASC'],
        ['start_time', 'ASC']
      ]
    });

    return res.status(200).json({
      success: true,
      count: schedules.length,
      data: schedules
    });
  } catch (error) {
    console.error('Error fetching schedules:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch schedules',
      error: error.message
    });
  }
};

// Get schedule by ID
exports.getScheduleById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const schedule = await Schedule.findOne({
      where: {
        id,
        isActive: true
      },
      include: [
        {
          model: Course,
          as: 'course',
          attributes: ['id', 'Course_name', 'Course_code', 'grade']
        }
      ]
    });

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: 'Schedule not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: schedule
    });
  } catch (error) {
    console.error('Error fetching schedule:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch schedule',
      error: error.message
    });
  }
};

exports.getSchedulesByStudentGrade = async (req, res) => {
  try {
    // Get student ID from authenticated user
    const studentId = req.user.id;
    
    if (!studentId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }
    
    // Find the student to get their grade
    const student = await Student.findByPk(studentId);
    
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }
    
    const studentGrade = student.grade;
    
    // Find schedules where room_number matches student grade
    const schedules = await Schedule.findAll({
      where: {
        room_number: studentGrade.toString(), // Convert grade to string to match room_number format
        isActive: true
      },
      include: [
        {
          model: Course,
          as: 'course',
          attributes: ['id', 'Course_name', 'Course_code', 'grade']
        }
      ],
      order: [
        ['day_of_week', 'ASC'],
        ['start_time', 'ASC']
      ]
    });
    
    return res.status(200).json({
      success: true,
      count: schedules.length,
      data: schedules
    });
  } catch (error) {
    console.error('Error fetching schedules by student grade:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch schedules',
      error: error.message
    });
  }
};



// Update schedule
exports.updateSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const { course_id, day_of_week, start_time, end_time, room_number } = req.body;

    const schedule = await Schedule.findOne({
      where: {
        id,
        isActive: true
      }
    });

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: 'Schedule not found'
      });
    }

    // If course_id is provided, check if course exists
    if (course_id) {
      const courseExists = await Course.findByPk(course_id);
      if (!courseExists) {
        return res.status(404).json({
          success: false,
          message: 'Course not found'
        });
      }
    }

    // Check for scheduling conflicts if time or room is being updated
    if ((day_of_week || start_time || end_time || room_number) && room_number) {
      const conflictingSchedule = await Schedule.findOne({
        where: {
          id: { [Op.ne]: id },
          day_of_week: day_of_week || schedule.day_of_week,
          [Op.or]: [
            {
              start_time: {
                [Op.lt]: end_time || schedule.end_time
              },
              end_time: {
                [Op.gt]: start_time || schedule.start_time
              }
            }
          ],
          room_number: room_number || schedule.room_number,
          isActive: true
        }
      });

      if (conflictingSchedule) {
        return res.status(400).json({
          success: false,
          message: 'There is already a class scheduled in this room during the specified time'
        });
      }
    }

    await schedule.update({
      course_id: course_id || schedule.course_id,
      day_of_week: day_of_week || schedule.day_of_week,
      start_time: start_time || schedule.start_time,
      end_time: end_time || schedule.end_time,
      room_number: room_number !== undefined ? room_number : schedule.room_number
    });

    return res.status(200).json({
      success: true,
      message: 'Schedule updated successfully',
      data: schedule
    });
  } catch (error) {
    console.error('Error updating schedule:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update schedule',
      error: error.message
    });
  }
};

// Delete schedule (soft delete)
exports.deleteSchedule = async (req, res) => {
  try {
    const { id } = req.params;

    const schedule = await Schedule.findOne({
      where: {
        id,
        isActive: true
      }
    });

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: 'Schedule not found'
      });
    }

    await schedule.update({ isActive: false });

    return res.status(200).json({
      success: true,
      message: 'Schedule deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting schedule:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete schedule',
      error: error.message
    });
  }
};