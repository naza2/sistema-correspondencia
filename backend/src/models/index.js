// ============================================
// src/models/index.js - Índice de modelos
// ============================================

const { User } = require('./User');
const { Area } = require('./Area');
const { Incoming } = require('./Incoming');

// ============================================
// RELACIONES
// ============================================

User.belongsTo(Area, { foreignKey: 'area_id', as: 'area' });
Area.hasMany(User, { foreignKey: 'area_id', as: 'users' });

Incoming.belongsTo(Area, { 
    foreignKey: 'recipient_area_id', 
    as: 'recipientArea' 
});
Area.hasMany(Incoming, { 
    foreignKey: 'recipient_area_id', 
    as: 'incoming' 
});

Incoming.belongsTo(User, { 
    foreignKey: 'created_by', 
    as: 'createdBy' 
});
User.hasMany(Incoming, { 
    foreignKey: 'created_by', 
    as: 'createdIncoming' 
});

Incoming.belongsTo(User, { 
    foreignKey: 'updated_by', 
    as: 'updatedBy' 
});

module.exports = {
    User,
    Area,
    Incoming
};