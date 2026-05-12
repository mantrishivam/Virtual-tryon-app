/**
 * GET /api/skus
 *
 * The Perfect Corp YCE v2 API does not expose a REST endpoint for listing
 * styles/SKUs. Instead, valid parameter values are:
 *
 * HAIR-COLOR  (POST /s2s/v2.0/task/hair-color)
 *   pattern.name : "full" | "ombre"
 *   palettes[].color : any hex color string e.g. "#8B4513"
 *
 * NAIL-VTO  (POST /s2s/v2.0/task/nail-vto)
 *   effect_type : "nail_polish" | "press_on_nails"
 *   effects[].sub_type : "color" | "design"
 *   effects[].texture  : "matte"|"cream"|"jelly"|"sheer"|"metallic"|
 *                        "pearl"|"shimmer_fine"|"shimmer_coarse"|"textured"
 *   effects[].finger   : "thumb"|"index"|"middle"|"ring"|"pinky"
 *   effects[].contrast / reflection / roughness / transparency : integer 0-100
 *
 * This endpoint simply returns the above reference so the frontend can
 * validate or display the available options.
 */
function listSkus(req, res) {
  res.json({
    success: true,
    reference: {
      hairColor: {
        endpoint: 'POST /s2s/v2.0/task/hair-color',
        patternName: ['full', 'ombre'],
        color: 'any hex string e.g. #8B4513',
      },
      nailVto: {
        endpoint: 'POST /s2s/v2.0/task/nail-vto',
        effectType: ['nail_polish', 'press_on_nails'],
        subType: ['color', 'design'],
        texture: ['matte', 'cream', 'jelly', 'sheer', 'metallic', 'pearl', 'shimmer_fine', 'shimmer_coarse', 'textured'],
        finger: ['thumb', 'index', 'middle', 'ring', 'pinky'],
        numericFields: 'contrast, reflection, roughness, transparency — integers 0-100',
      },
    },
  });
}

module.exports = { listSkus };
