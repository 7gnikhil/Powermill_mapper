using System;
using System.Windows;
using System.Windows.Controls;
using MyPowerMillPlugin.Model;

namespace MyPowerMillPlugin.UI
{
    public partial class PluginPaneWPF : UserControl
    {
        private ModelInferenceResult _latestResult;

        public PluginPaneWPF()
        {
            InitializeComponent();
            UpdateModelStatus();
        }

        private void UpdateModelStatus()
        {
            if (PluginMain.DomainModel != null)
            {
                TxtModelStatus.Text = PluginMain.DomainModel.ModelDescription;
            }
        }

        private void BtnInfer_Click(object sender, RoutedEventArgs e)
        {
            if (PluginMain.DomainModel == null) return;

            double.TryParse(TxtHoleDiameter.Text, out double dia);
            double.TryParse(TxtHoleDepth.Text, out double depth);
            double.TryParse(TxtOverhang.Text, out double overhang);

            var features = new CAMFeatureVector
            {
                HoleDiameterMm = dia > 0 ? dia : 10.0,
                HoleDepthMm = depth > 0 ? depth : 25.0,
                ToolOverhangMm = overhang > 0 ? overhang : 40.0,
                MaterialGroup = GetSelectedMaterialGroup()
            };

            _latestResult = PluginMain.DomainModel.Predict(features);

            TxtPredictedStrategy.Text = _latestResult.RecommendedStrategy;
            TxtSpindleRpm.Text = $"{_latestResult.RecommendedSpindleRpm:N0} RPM";
            TxtFeedRate.Text = $"{_latestResult.RecommendedFeedMmPerMin:N0} mm/min";
            TxtPeckDepth.Text = $"{_latestResult.RecommendedPeckDepthMm:F2} mm";
            TxtRiskScore.Text = $"{(_latestResult.ToolBreakageRiskScore * 100):F0}% ({(_latestResult.ToolBreakageRiskScore < 0.25 ? "Safe" : "Caution")})";
        }

        private string GetSelectedMaterialGroup()
        {
            switch (CmbMaterial.SelectedIndex)
            {
                case 1: return "ISO-M";
                case 2: return "ISO-K";
                case 3: return "ISO-N";
                case 4: return "ISO-S";
                case 5: return "ISO-H";
                default: return "ISO-P";
            }
        }

        private void BtnApplyToPowerMill_Click(object sender, RoutedEventArgs e)
        {
            if (_latestResult == null)
            {
                BtnInfer_Click(sender, e);
            }

            if (_latestResult != null && !string.IsNullOrEmpty(_latestResult.PowerMillMacroCommand))
            {
                PluginMain.ExecutePowerMillCommand(_latestResult.PowerMillMacroCommand);
                MessageBox.Show("Applied ML parameters to active PowerMill toolpath!", "PowerMill ML Optimizer", MessageBoxButton.OK, MessageBoxImage.Information);
            }
        }

        private void BtnReloadModel_Click(object sender, RoutedEventArgs e)
        {
            if (PluginMain.DomainModel != null)
            {
                PluginMain.DomainModel.Reload(null);
                UpdateModelStatus();
                MessageBox.Show("Reloaded model.onnx from disk.", "Model Seam", MessageBoxButton.OK, MessageBoxImage.Information);
            }
        }
    }
}
