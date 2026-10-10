using System;

namespace MyPowerMillPlugin.Model
{
    /// <summary>
    /// Domain Model Seam Interface.
    /// Allows swapping different ML model architectures (ONNX, PyTorch export, heuristic fallback)
    /// without modifying or recompiling the PowerMill Plugin host assembly.
    /// </summary>
    public interface IDomainModel : IDisposable
    {
        /// <summary>
        /// Indicates if the model runtime engine is active and weights are loaded.
        /// </summary>
        bool IsLoaded { get; }

        /// <summary>
        /// Path to the currently loaded model asset.
        /// </summary>
        string ModelFilePath { get; }

        /// <summary>
        /// Human-readable model metadata (architecture, training epoch, dataset).
        /// </summary>
        string ModelDescription { get; }

        /// <summary>
        /// Evaluates CAM feature vector and produces machining optimization decisions.
        /// </summary>
        ModelInferenceResult Predict(CAMFeatureVector features);

        /// <summary>
        /// Reloads model weights from disk dynamically at runtime.
        /// </summary>
        bool Reload(string modelPath);
    }
}
