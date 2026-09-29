import { Bottle, GeneratedModel, TexturedCan } from './products';

export const MODELS = { bottle: Bottle, 'textured-can': TexturedCan, generated: GeneratedModel };

// Geometry facts the reveal animation needs to cut a model cleanly in half.
// The generated mesh is a single scanned surface with no clean cross-section, so the
// reveal uses the textured can in its place.
export const SPLIT_META = {
  bottle: { model: 'bottle', cutY: 0, radius: 0.62 },
  'textured-can': { model: 'textured-can', cutY: 0, radius: 0.56 },
  generated: { model: 'textured-can', cutY: 0, radius: 0.56 },
};
