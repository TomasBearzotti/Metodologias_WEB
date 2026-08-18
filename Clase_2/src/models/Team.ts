import { Schema, model, Document, Model, Types } from "mongoose";

export interface ITeam {
  name: string;
  sport: string;
  category: string;
  foundationYear: number;
  active: boolean;
}

export interface ITeamDocument extends ITeam, Document {
  _id: Types.ObjectId;
}

const teamSchema = new Schema<ITeamDocument>(
  {
    name: {
      type: String,
      required: [true, "El nombre del equipo es obligatorio"],
      trim: true,
      maxlength: [80, "El nombre no puede exceder los 80 caracteres"],
    },
    sport: {
      type: String,
      required: [true, "El deporte es obligatorio (ej: Fútbol, Básquet)"],
      trim: true,
    },
    category: {
      type: String,
      required: [true, "La categoría es obligatoria (ej: Primera, Sub-20)"],
      trim: true,
    },
    foundationYear: {
      type: Number,
      required: true,
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

const Team: Model<ITeamDocument> = model<ITeamDocument>("Team", teamSchema);

export default Team;
