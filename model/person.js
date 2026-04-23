import { DataTypes } from 'sequelize';
import { v7 as uuidv7 } from 'uuid';

export default function definePersonModel(sequelize) {
  const Person = sequelize.define('Person', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: () => uuidv7(),
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    gender: {
      type: DataTypes.STRING, // Use STRING to be safe, or specify ENUM if preferred
      validate: {
        isIn: [['male', 'female']]
      }
    },
    gender_probability: {
      type: DataTypes.FLOAT,
    },
    age: {
      type: DataTypes.INTEGER,
    },
    age_group: {
      type: DataTypes.STRING,
      validate: {
        isIn: [['child', 'teenager', 'adult', 'senior']]
      }
    },
    country_id: {
      type: DataTypes.STRING(2),
    },
    country_name: {
      type: DataTypes.STRING,
    },
    country_probability: {
      type: DataTypes.FLOAT,
    },
  }, {
    tableName: 'persons',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
    indexes: [
      { fields: ['gender'] },
      { fields: ['age_group'] },
      { fields: ['country_id'] },
      { fields: ['age'] }
    ]
  });

  return Person;
}
