import { Bottle, GeneratedModel, TexturedCan } from './products';

export const MODELS = { bottle: Bottle, 'textured-can': TexturedCan, generated: GeneratedModel };

// Geometry facts the scroll story needs to cut a model cleanly down the middle:
// the cut face (a rectangle through the axis) and, for cans, where the lid sits.
// The generated mesh is a single scanned surface with no clean cross-section, so the
// story uses the textured can in its place.
const CAN = { model: 'textured-can', radius: 0.56, faceHeight: 2.95, faceY: -0.075, lidY: 1.625 };

export const SPLIT_META = {
  bottle: { model: 'bottle', radius: 0.62, faceHeight: 2.85, faceY: -0.18, lidY: null },
  'textured-can': CAN,
  generated: CAN,
};
