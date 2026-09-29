import { Bottle, GeneratedModel, TexturedCan } from './products';

export const MODELS = { bottle: Bottle, 'textured-can': TexturedCan, generated: GeneratedModel };

// Geometry facts the scroll story needs to split a model horizontally: the cut height,
// the body radius there, where the lid sits (cans only) and the base (for the ground shadow).
// The generated mesh is a single scanned surface with no clean cross-section, so the
// story uses the textured can in its place.
const CAN = { model: 'textured-can', radius: 0.56, cutY: 0, lidY: 1.625, baseY: -1.66 };

export const SPLIT_META = {
  bottle: { model: 'bottle', radius: 0.62, cutY: 0, lidY: null, baseY: -1.6 },
  'textured-can': CAN,
  generated: CAN,
};
