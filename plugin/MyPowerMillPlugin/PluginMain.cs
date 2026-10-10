using System;
using System.Runtime.InteropServices;
using System.Windows.Forms.Integration;
using Autodesk.FileSystem;
using Autodesk.PluginFramework;
using Autodesk.PluginFramework.Panes;
using MyPowerMillPlugin.Model;
using MyPowerMillPlugin.UI;

namespace MyPowerMillPlugin
{
    /// <summary>
    /// Main entry point for the PowerMill ML Plugin.
    /// COM visible with unique GUID registered in PowerMill Plugin Categories.
    /// </summary>
    [ComVisible(true)]
    [Guid("64fb7b2a-7526-4aaf-a8c8-ab7593a09d37")]
    [ClassInterface(ClassInterfaceType.None)]
    public class PluginMain : PluginFrameworkWithPanes, PowerMILL.IPowerMILLPluginLicensable
    {
        public static PluginMain Instance { get; private set; }
        public static PowerMILL.Application PowerMillApp { get; private set; }
        public static IDomainModel DomainModel { get; private set; }

        private ElementHost _wpfHost;
        private PluginPaneWPF _paneControl;

        public PluginMain()
        {
            Instance = this;
            // Initialize Domain ML Model Seam
            try
            {
                DomainModel = new OnnxDomainModel();
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Failed to load ML model: {ex.Message}");
            }
        }

        #region IPowerMILLPluginLicensable Implementation

        public void initialise(PowerMILL.Application powerMILL_Application)
        {
            PowerMillApp = powerMILL_Application;
            base.initialise();
        }

        public string get_licence_token()
        {
            // Standard PowerMill licensing callback.
            // Return empty or valid license string as required by Autodesk PowerMill API.
            return string.Empty;
        }

        public bool is_licenced()
        {
            return true;
        }

        #endregion

        #region Pane Registration

        protected override void register_panes()
        {
            try
            {
                // Instantiate WPF user control
                _paneControl = new PluginPaneWPF();

                // Wrap in Windows Forms ElementHost for PowerMill's unmanaged docking manager
                _wpfHost = new ElementHost
                {
                    Child = _paneControl,
                    Dock = System.Windows.Forms.DockStyle.Fill
                };

                // Register into PowerMill's native side pane
                // "PM_ML_OPTIMIZER_PANE", Title, Control, Tooltip, IconPath
                var paneDef = new PaneDefinition(
                    "PM_ML_OPTIMIZER_PANE",
                    "ML CAM Optimizer",
                    _wpfHost
                );

                Panes.Add(paneDef);
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Error registering pane: {ex.Message}");
            }
        }

        #endregion

        /// <summary>
        /// Executes a native PowerMill command string through the COM automation interface.
        /// </summary>
        public static void ExecutePowerMillCommand(string command)
        {
            if (PowerMillApp == null) return;
            try
            {
                PowerMillApp.DoCommand(command);
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"PowerMill DoCommand failed: {ex.Message}");
            }
        }
    }
}
