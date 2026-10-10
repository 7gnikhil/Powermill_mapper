using System;
using System.Security.Principal;
using System.Windows;

namespace PowerMillLauncher
{
    public partial class App : Application
    {
        public static bool IsAdministrator()
        {
            var identity = WindowsIdentity.GetCurrent();
            var principal = new WindowsPrincipal(identity);
            return principal.IsInRole(WindowsBuiltInRole.Administrator);
        }
    }
}
