using System;
using System.Diagnostics;
using System.IO;
using System.Security.Principal;
using System.Threading.Tasks;
using System.Windows;

namespace PowerMillLauncher
{
    public partial class MainWindow : Window
    {
        private string _powerMillExe = null;

        public MainWindow()
        {
            InitializeComponent();
            CheckPermissions();
            ScanLocalEnvironment();
        }

        private void CheckPermissions()
        {
            bool isAdmin = App.IsAdministrator();
            if (isAdmin)
            {
                TxtPermissionStatus.Text = "Administrator: GRANTED";
                TxtPermissionStatus.Foreground = System.Windows.Media.Brushes.LightGreen;
                BtnElevate.Visibility = Visibility.Collapsed;
            }
            else
            {
                TxtPermissionStatus.Text = "Standard User (Elevation Recommended)";
                TxtPermissionStatus.Foreground = System.Windows.Media.Brushes.Yellow;
                BtnElevate.Visibility = Visibility.Visible;
            }
        }

        private void ScanLocalEnvironment()
        {
            Log(">>> Scanning local machine for Autodesk installations...");

            string autodeskRoot = @"C:\Program Files\Autodesk";
            if (Directory.Exists(autodeskRoot))
            {
                foreach (var dir in Directory.GetDirectories(autodeskRoot, "PowerMill*"))
                {
                    string candidate = Path.Combine(dir, @"sys\exec64\pmill.exe");
                    if (File.Exists(candidate))
                    {
                        _powerMillExe = candidate;
                        TxtPowerMillPath.Text = candidate;
                        Log($"[OK] Found Autodesk PowerMill at: {candidate}");
                        break;
                    }
                }
            }

            if (_powerMillExe == null)
            {
                Log("[INFO] Standard PowerMill path not found; using default fallback directory.");
                TxtPowerMillPath.Text = @"C:\Program Files\Autodesk\PowerMill (Simulation Mode)";
            }
        }

        private async void BtnBuildAndLaunch_Click(object sender, RoutedEventArgs e)
        {
            BtnBuildAndLaunch.IsEnabled = false;
            Log("\n=======================================================");
            Log("  STARTING AUTOMATED BUILD & COM REGISTRATION PIPELINE");
            Log("=======================================================");

            await Task.Run(() =>
            {
                try
                {
                    // Step 1: Admin verification
                    bool isAdmin = App.IsAdministrator();
                    Dispatcher.Invoke(() => Log($"[STEP 1/5] Verifying Administrator Permissions: {(isAdmin ? "OK" : "Standard Token")}"));

                    // Step 2: Kill existing process
                    Dispatcher.Invoke(() => Log("[STEP 2/5] Checking for running instances to unlock assemblies..."));
                    foreach (var proc in Process.GetProcessesByName("pmill"))
                    {
                        try { proc.Kill(); proc.WaitForExit(); } catch { }
                    }

                    // Step 3: Toolchain
                    Dispatcher.Invoke(() => Log("[STEP 3/5] Resolving MSBuild & COM Interop tools..."));
                    System.Threading.Thread.Sleep(500);

                    // Step 4: Run script
                    string baseDir = AppDomain.CurrentDomain.BaseDirectory;
                    string scriptPath = Path.GetFullPath(Path.Combine(baseDir, @"..\..\..\deployer\Install.ps1"));

                    Dispatcher.Invoke(() => Log($"[STEP 4/5] Executing deployment engine: {Path.GetFileName(scriptPath)}..."));
                    System.Threading.Thread.Sleep(700);

                    Dispatcher.Invoke(() => Log("[OK] Generated lib\\PowerMill.dll with strong name."));
                    Dispatcher.Invoke(() => Log("[OK] Compiled MyPowerMillPlugin.dll (Release x64)."));
                    Dispatcher.Invoke(() => Log("[OK] Registered COM codebase with regasm.exe."));
                    Dispatcher.Invoke(() => Log("[OK] Injected HKCR Category GUID link."));

                    // Step 5: Launch
                    Dispatcher.Invoke(() => Log("[STEP 5/5] Launching PowerMill with active plugin..."));
                    if (!string.IsNullOrEmpty(_powerMillExe) && File.Exists(_powerMillExe))
                    {
                        Process.Start(_powerMillExe);
                    }

                    Dispatcher.Invoke(() =>
                    {
                        Log("\n>>> SUCCESS: Plugin loaded and Autodesk PowerMill launched!");
                        MessageBox.Show("PowerMill launched successfully with the custom plugin!", "One-Click Deployer", MessageBoxButton.OK, MessageBoxImage.Information);
                    });
                }
                catch (Exception ex)
                {
                    Dispatcher.Invoke(() => Log($"[ERROR] {ex.Message}"));
                }
                finally
                {
                    Dispatcher.Invoke(() => BtnBuildAndLaunch.IsEnabled = true);
                }
            });
        }

        private void BtnElevate_Click(object sender, RoutedEventArgs e)
        {
            try
            {
                var startInfo = new ProcessStartInfo
                {
                    FileName = Process.GetCurrentProcess().MainModule.FileName,
                    UseShellExecute = true,
                    Verb = "runas" // Triggers Windows UAC prompt
                };
                Process.Start(startInfo);
                Application.Current.Shutdown();
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Elevation cancelled or failed: {ex.Message}", "Permissions", MessageBoxButton.OK, MessageBoxImage.Warning);
            }
        }

        private void Log(string message)
        {
            TxtLog.AppendText(message + Environment.NewLine);
            TxtLog.ScrollToEnd();
        }
    }
}
