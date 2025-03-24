const { Parent } = require('../models');
const { sequelize } = require('../models');

exports.registerParent = async (req, res, next) => {
  try {
    const { 
      firstName, 
      lastName, 
      email, 
      password, 
      phone, 
      address,
      relation,
      occupation,
      studentIds  = []  
    } = req.body;

    if (!firstName || !lastName || !email || !password || !relation) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields' 
      });
    }

    const validRelations = ['father', 'mother', 'guardian', 'other'];
    if (!validRelations.includes(relation)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid relation. Must be one of: father, mother, guardian, other'
      });
    }

    const result = await sequelize.transaction(async (t) => {
      const newParent = await Parent.create({
        firstName,
        lastName,
        email,
        password,
        role: 'parent',
        phone,
        address,
        relation,
        occupation: occupation || null
      }, { transaction: t });

      if (studentIds && studentIds.length > 0) {
        const ParentStudent = sequelize.model('ParentStudent');
        const studentAssociations = studentIds.map(studentId => ({
          parentId: newParent.id,
          studentId
        }));
        
        await ParentStudent.bulkCreate(studentAssociations, { transaction: t });
      }

      return newParent;
    });

    return res.status(201).json({
      success: true,
      message: 'Parent registered successfully',
      parent: {
        id: result.id,
        firstName: result.firstName,
        lastName: result.lastName,
        email: result.email,
        role: result.role
      }
    });
  } catch (error) {
    console.error('Parent registration error:', error);
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors.map(e => ({ field: e.path, message: e.message }))
      });
    }
    
    next(error);
  }
};

exports.getChildrenByParentId = async (req, res, next) => {
  try {
    const parentId = req.params.id;
    
    if (req.user && req.user.role !== 'admin' && req.user.id !== parseInt(parentId)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to view these children' 
      });
    }
    
    const parent = await Parent.findByPk(parentId, {
      include: [{
        association: 'students',
        attributes: ['id', 'firstName', 'lastName', 'grade', 'dateOfBirth', 'enrollmentDate']
      }]
    });
    
    if (!parent) {
      return res.status(404).json({ 
        success: false, 
        message: 'Parent not found' 
      });
    }
    
    if (!parent.students || parent.students.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No children found for this parent'
      });
    }
    
    return res.status(200).json({
      success: true,
      data: parent.students
    });
  } catch (error) {
    console.error('Error fetching children by parent ID:', error);
    next(error);
  }
};

exports.getAllParents = async (req, res, next) => {
  try {
    if (req.user && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this resource'
      });
    }
    
    const parents = await Parent.findAll({
      include: [{ 
        association: 'user',
        attributes: ['firstName', 'lastName', 'email', 'phone', 'address'] 
      }]
    });
    
    return res.status(200).json({
      success: true,
      data: parents
    });
  } catch (error) {
    console.error('Error fetching all parents:', error);
    next(error);
  }
};

exports.getParentById = async (req, res, next) => {
  try {
    const parentId = req.params.id;
    
    if (req.user && req.user.role !== 'admin' && req.user.id !== parseInt(parentId)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this parent'
      });
    }
    
    const parent = await Parent.findByPk(parentId, {
      include: [{ 
        association: 'user',
        attributes: ['firstName', 'lastName', 'email', 'phone', 'address'] 
      }]
    });
    
    if (!parent) {
      return res.status(404).json({
        success: false,
        message: 'Parent not found'
      });
    }
    
    return res.status(200).json({
      success: true,
      data: parent
    });
  } catch (error) {
    console.error('Error fetching parent by ID:', error);
    next(error);
  }
};

exports.updateParent = async (req, res, next) => {
  try {
    const parentId = req.params.id;
    const { relation, occupation, studentIds } = req.body;
    
    if (req.user && req.user.role !== 'admin' && req.user.id !== parseInt(parentId)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this parent'
      });
    }
    
    const parent = await Parent.findByPk(parentId);
    
    if (!parent) {
      return res.status(404).json({
        success: false,
        message: 'Parent not found'
      });
    }
    
    await sequelize.transaction(async (t) => {
      if (relation || occupation) {
        const updateData = {};
        if (relation) {
          const validRelations = ['father', 'mother', 'guardian', 'other'];
          if (!validRelations.includes(relation)) {
            throw new Error('Invalid relation. Must be one of: father, mother, guardian, other');
          }
          updateData.relation = relation;
        }
        if (occupation) updateData.occupation = occupation;
        
        await parent.update(updateData, { transaction: t });
      }
      
      if (studentIds && Array.isArray(studentIds)) {
        const ParentStudent = sequelize.model('ParentStudent');
        
        await ParentStudent.destroy({
          where: { parentId },
          transaction: t
        });
        
        if (studentIds.length > 0) {
          const studentAssociations = studentIds.map(studentId => ({
            parentId,
            studentId
          }));
          
          await ParentStudent.bulkCreate(studentAssociations, { transaction: t });
        }
      }
    });
    
    const updatedParent = await Parent.findByPk(parentId, {
      include: [
        { 
          association: 'user',
          attributes: ['firstName', 'lastName', 'email', 'phone', 'address'] 
        },
        {
          association: 'students',
          attributes: ['id', 'firstName', 'lastName', 'grade']
        }
      ]
    });
    
    return res.status(200).json({
      success: true,
      message: 'Parent updated successfully',
      data: updatedParent
    });
  } catch (error) {
    console.error('Error updating parent:', error);
    if (error.message.includes('Invalid relation')) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
    next(error);
  }
};

exports.deleteParent = async (req, res, next) => {
  try {
    const parentId = req.params.id;
    
    if (req.user && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete parents'
      });
    }
    
    const parent = await Parent.findByPk(parentId);
    
    if (!parent) {
      return res.status(404).json({
        success: false,
        message: 'Parent not found'
      });
    }
    
    await sequelize.transaction(async (t) => {
      const ParentStudent = sequelize.model('ParentStudent');
      await ParentStudent.destroy({
        where: { parentId },
        transaction: t
      });
      
      await parent.destroy({ transaction: t });
    });
    
    return res.status(200).json({
      success: true,
      message: 'Parent deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting parent:', error);
    next(error);
  }
};
