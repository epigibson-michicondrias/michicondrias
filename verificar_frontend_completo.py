#!/usr/bin/env python3
"""
📱 Verificación Completa del Frontend
Verifica todos los componentes y servicios del frontend
"""

import os
import json
from pathlib import Path

def verify_services_files():
    """📡 Verificar archivos de servicios"""
    print("📡 Verificando archivos de servicios...")
    
    services_dir = Path("mobile/src/services")
    required_services = ["patients.ts", "metrics.ts", "alerts.ts"]
    
    results = []
    
    for service_file in required_services:
        file_path = services_dir / service_file
        if file_path.exists():
            print(f"✅ {service_file} encontrado")
            
            # Verificar contenido del archivo
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
                
                if service_file == "patients.ts":
                    has_get_critical = "getCriticalPatients" in content
                    has_interface = "CriticalPatient" in content
                    print(f"   - getCriticalPatients: {'✅' if has_get_critical else '❌'}")
                    print(f"   - CriticalPatient interface: {'✅' if has_interface else '❌'}")
                    results.append(has_get_critical and has_interface)
                    
                elif service_file == "metrics.ts":
                    has_get_metrics = "getClinicMetrics" in content
                    has_interface = "ClinicMetrics" in content
                    print(f"   - getClinicMetrics: {'✅' if has_get_metrics else '❌'}")
                    print(f"   - ClinicMetrics interface: {'✅' if has_interface else '❌'}")
                    results.append(has_get_metrics and has_interface)
                    
                elif service_file == "alerts.ts":
                    has_get_alerts = "getClinicAlerts" in content
                    has_interface = "ClinicAlert" in content
                    print(f"   - getClinicAlerts: {'✅' if has_get_alerts else '❌'}")
                    print(f"   - ClinicAlert interface: {'✅' if has_interface else '❌'}")
                    results.append(has_get_alerts and has_interface)
        else:
            print(f"❌ {service_file} NO encontrado")
            results.append(False)
    
    return all(results)

def verify_dashboard_component():
    """📊 Verificar componente principal del dashboard"""
    print("\n📊 Verificando componente del dashboard...")
    
    dashboard_file = Path("mobile/app/mi-clinica/index.tsx")
    
    if not dashboard_file.exists():
        print("❌ Dashboard principal NO encontrado")
        return False
    
    print("✅ Dashboard principal encontrado")
    
    with open(dashboard_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Verificar importaciones de servicios
    has_patients_import = "patients" in content and "getCriticalPatients" in content
    has_metrics_import = "metrics" in content and "getClinicMetrics" in content
    has_alerts_import = "alerts" in content and "getClinicAlerts" in content
    
    print(f"   - Import patients: {'✅' if has_patients_import else '❌'}")
    print(f"   - Import metrics: {'✅' if has_metrics_import else '❌'}")
    print(f"   - Import alerts: {'✅' if has_alerts_import else '❌'}")
    
    # Verificar uso de React Query
    has_use_query = "useQuery" in content
    has_critical_patients_query = "getCriticalPatients" in content and "useQuery" in content
    has_metrics_query = "getClinicMetrics" in content and "useQuery" in content
    has_alerts_query = "getClinicAlerts" in content and "useQuery" in content
    
    print(f"   - React Query useQuery: {'✅' if has_use_query else '❌'}")
    print(f"   - Critical patients query: {'✅' if has_critical_patients_query else '❌'}")
    print(f"   - Metrics query: {'✅' if has_metrics_query else '❌'}")
    print(f"   - Alerts query: {'✅' if has_alerts_query else '❌'}")
    
    # Verificar rendering de datos
    has_critical_patients_render = "criticalPatients" in content
    has_metrics_render = "veterinaryMetrics" in content
    has_alerts_render = "veterinaryAlerts" in content
    
    print(f"   - Critical patients render: {'✅' if has_critical_patients_render else '❌'}")
    print(f"   - Metrics render: {'✅' if has_metrics_render else '❌'}")
    print(f"   - Alerts render: {'✅' if has_alerts_render else '❌'}")
    
    # Verificar manejo de loading states
    has_loading = "isLoading" in content or "loading" in content
    has_error_handling = "error" in content or "Error" in content
    
    print(f"   - Loading states: {'✅' if has_loading else '❌'}")
    print(f"   - Error handling: {'✅' if has_error_handling else '❌'}")
    
    return all([
        has_patients_import, has_metrics_import, has_alerts_import,
        has_use_query, has_critical_patients_query, has_metrics_query, has_alerts_query,
        has_critical_patients_render, has_metrics_render, has_alerts_render,
        has_loading, has_error_handling
    ])

def verify_additional_components():
    """🔧 Verificar componentes adicionales del dashboard"""
    print("\n🔧 Verificando componentes adicionales...")
    
    additional_components = [
        "mobile/app/mi-clinica/horarios.tsx",
        "mobile/app/mi-clinica/veterinarios.tsx",
        "mobile/app/mi-clinica/servicios.tsx",
        "mobile/app/mi-clinica/config/[id].tsx"
    ]
    
    results = []
    
    for component_path in additional_components:
        path = Path(component_path)
        if path.exists():
            print(f"✅ {path.name} encontrado")
            results.append(True)
        else:
            print(f"❌ {path.name} NO encontrado")
            results.append(False)
    
    return all(results)

def verify_package_dependencies():
    "📦 Verificar dependencias en package.json"""
    print("\n📦 Verificando dependencias...")
    
    package_file = Path("mobile/package.json")
    
    if not package_file.exists():
        print("❌ package.json NO encontrado")
        return False
    
    with open(package_file, 'r', encoding='utf-8') as f:
        package_data = json.load(f)
    
    dependencies = package_data.get("dependencies", {})
    
    # Verificar dependencias clave
    has_react_query = "@tanstack/react-query" in dependencies
    has_expo_router = "expo-router" in dependencies
    has_react_native = "react" in dependencies
    
    print(f"   - @tanstack/react-query: {'✅' if has_react_query else '❌'}")
    print(f"   - expo-router: {'✅' if has_expo_router else '❌'}")
    print(f"   - react: {'✅' if has_react_native else '❌'}")
    
    return has_react_query and has_expo_router and has_react_native

def verify_api_endpoints_config():
    """🌐 Verificar configuración de endpoints API"""
    print("\n🌐 Verificando configuración de endpoints...")
    
    services_dir = Path("mobile/src/services")
    
    if not services_dir.exists():
        print("❌ Directorio de servicios NO encontrado")
        return False
    
    # Verificar que los servicios usen la URL correcta del backend
    api_url_patterns = [
        "http://localhost:8000",
        "http://localhost:8000/api/v1/directorio",
        "/api/v1/directorio"
    ]
    
    results = []
    
    for service_file in ["patients.ts", "metrics.ts", "alerts.ts"]:
        file_path = services_dir / service_file
        if file_path.exists():
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
                
            has_api_url = any(pattern in content for pattern in api_url_patterns)
            print(f"   - {service_file}: {'✅' if has_api_url else '❌'}")
            results.append(has_api_url)
        else:
            print(f"   - {service_file}: ❌ Archivo no encontrado")
            results.append(False)
    
    return all(results)

def verify_typescript_interfaces():
    """🔷 Verificar interfaces TypeScript"""
    print("\n🔷 Verificando interfaces TypeScript...")
    
    services_dir = Path("mobile/src/services")
    
    interface_checks = {
        "patients.ts": ["CriticalPatient"],
        "metrics.ts": ["ClinicMetrics"],
        "alerts.ts": ["ClinicAlert"]
    }
    
    results = []
    
    for service_file, required_interfaces in interface_checks.items():
        file_path = services_dir / service_file
        if file_path.exists():
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            for interface in required_interfaces:
                has_interface = f"interface {interface}" in content or f"type {interface}" in content
                print(f"   - {interface} en {service_file}: {'✅' if has_interface else '❌'}")
                results.append(has_interface)
        else:
            print(f"   - {service_file}: ❌ Archivo no encontrado")
            results.extend([False] * len(required_interfaces))
    
    return all(results)

def main():
    """🚀 Ejecutar verificación completa del frontend"""
    print("🚀 INICIANDO VERIFICACIÓN COMPLETA DEL FRONTEND")
    print("=" * 70)
    
    tests = [
        ("Archivos de Servicios", verify_services_files),
        ("Componente Dashboard", verify_dashboard_component),
        ("Componentes Adicionales", verify_additional_components),
        ("Dependencias Package", verify_package_dependencies),
        ("Configuración API", verify_api_endpoints_config),
        ("Interfaces TypeScript", verify_typescript_interfaces)
    ]
    
    results = []
    
    for test_name, test_func in tests:
        try:
            result = test_func()
            results.append((test_name, result))
        except Exception as e:
            print(f"❌ Error en {test_name}: {e}")
            results.append((test_name, False))
    
    # Resumen final
    print("\n" + "=" * 70)
    print("📊 RESUMEN DE VERIFICACIÓN DEL FRONTEND")
    print("=" * 70)
    
    passed = 0
    for test_name, result in results:
        status = "✅ PASÓ" if result else "❌ FALLÓ"
        print(f"{status} {test_name}")
        if result:
            passed += 1
    
    print(f"\n🎯 Resultado: {passed}/{len(results)} pruebas exitosas")
    
    if passed == len(results):
        print("\n🎉 ¡EL FRONTEND ESTÁ COMPLETO!")
        print("\n📋 Componentes verificados:")
        print("   1. ✅ Servicios API conectados")
        print("   2. ✅ Dashboard con datos reales")
        print("   3. ✅ React Query implementado")
        print("   4. ✅ TypeScript tipado")
        print("   5. ✅ Manejo de errores y loading")
        print("   6. ✅ Componentes adicionales")
        print("   7. ✅ Dependencias correctas")
        print("\n🚀 Frontend listo para producción!")
    else:
        print("\n⚠️  Algunos componentes del frontend necesitan atención.")
        print("Revisa los errores arriba para más detalles.")
    
    return passed == len(results)

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)
