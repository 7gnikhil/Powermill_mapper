using System;

namespace MyPowerMillPlugin.Model
{
    /// <summary>
    /// CAM & CAD geometrical features extracted from PowerMill models and hole feature sets.
    /// Used as input tensor vector for domain ML models.
    /// </summary>
    public class CAMFeatureVector
    {
        public double HoleDiameterMm { get; set; } = 10.0;
        public double HoleDepthMm { get; set; } = 25.0;
        public double DiameterToDepthRatio => HoleDiameterMm > 0 ? HoleDepthMm / HoleDiameterMm : 0;
        public int StepCount { get; set; } = 1;
        public double MaterialHardnessBrinell { get; set; } = 220.0; // e.g., P20 Tool Steel
        public string MaterialGroup { get; set; } = "ISO-P"; // P (Steel), M (Stainless), K (Cast Iron), N (Alu), S (HRSA), H (Hardened)
        public double CutterDiameterMm { get; set; } = 10.0;
        public int FluteCount { get; set; } = 2;
        public double ToolOverhangMm { get; set; } = 40.0;
        public bool HasThroughExit { get; set; } = false;

        /// <summary>
        /// Converts the CAM feature object into a normalized flat float array for ONNX tensor feeding.
        /// Shape: [1, 8]
        /// </summary>
        public float[] ToFloatArray()
        {
            return new float[]
            {
                (float)(HoleDiameterMm / 50.0),                  // Normalized diameter
                (float)(HoleDepthMm / 150.0),                    // Normalized depth
                (float)(DiameterToDepthRatio / 10.0),            // Aspect ratio
                (float)(StepCount / 5.0),                        // Normalized step count
                (float)(MaterialHardnessBrinell / 600.0),        // Hardness scaling
                (float)(CutterDiameterMm / 50.0),                // Cutter diameter
                (float)(FluteCount / 6.0),                       // Flute count
                (float)(ToolOverhangMm / 150.0)                  // Overhang ratio
            };
        }
    }
}
