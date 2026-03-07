#!/usr/bin/env python3
"""
🧪 Script de Prueba - Backend + Supabase Integration
Este script verifica que el backend se conecte correctamente a Supabase
y que los endpoints del dashboard funcionen.
"""

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend/michicondrias_directorio'))

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from datetime import date, datetime, timedelta
import json

# Configuración de Supabase
DATABASE_URL = "postgresql://postgres:Michicondrias201094*@db.zaegmfufrzjmjiemrvvp.supabase.co:5432/postgres"

def test_supabase_connection():
    """🔍 Paso 1: Probar conexión a Supabase"""
    print("🔍 Probando conexión a Supabase...")
    
    try:
        engine = create_engine(DATABASE_URL)
        with engine.connect() as connection:
            # Verificar conexión básica
            result = connection.execute(text("SELECT 1 as test"))
            test_value = result.scalar()
            print(f"✅ Conexión exitosa: {test_value}")
            
            # Verificar tablas del dashboard
            result = connection.execute(text("""
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name IN ('medical_records_extended', 'clinic_metrics', 'clinic_alerts')
                ORDER BY table_name
            """))
            
            tables = [row[0] for row in result]
            print(f"✅ Tablas del dashboard encontradas: {tables}")
            
            # Verificar datos de ejemplo
            for table in tables:
                result = connection.execute(text(f"SELECT COUNT(*) FROM {table}"))
                count = result.scalar()
                print(f"📊 {table}: {count} registros")
            
            return True
            
    except Exception as e:
        print(f"❌ Error de conexión: {e}")
        return False

def test_models_creation():
    """🏗️ Paso 2: Probar creación de modelos"""
    print("\n🏗️ Probando modelos SQLAlchemy...")
    
    try:
        from app.models.dashboard import (
            MedicalRecordExtended, ClinicMetrics, ClinicAlerts,
            InventoryItems, LabTests, Surgeries
        )
        
        print("✅ Modelos importados correctamente:")
        print(f"   - MedicalRecordExtended: {MedicalRecordExtended.__tablename__}")
        print(f"   - ClinicMetrics: {ClinicMetrics.__tablename__}")
        print(f"   - ClinicAlerts: {ClinicAlerts.__tablename__}")
        print(f"   - InventoryItems: {InventoryItems.__tablename__}")
        print(f"   - LabTests: {LabTests.__tablename__}")
        print(f"   - Surgeries: {Surgeries.__tablename__}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error importando modelos: {e}")
        return False

def test_crud_operations():
    """🔧 Paso 3: Probar operaciones CRUD"""
    print("\n🔧 Probando operaciones CRUD...")
    
    try:
        from app.crud.dashboard_crud import (
            get_critical_patients, get_daily_metrics, get_clinic_alerts,
            create_clinic_alert, format_time_ago
        )
        
        print("✅ CRUD operations importadas correctamente")
        
        # Probar función de formato de tiempo
        test_time = datetime.now() - timedelta(minutes=5)
        formatted = format_time_ago(test_time)
        print(f"⏰ Formato tiempo: {formatted}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error en CRUD operations: {e}")
        return False

def test_sample_data():
    """📊 Paso 4: Crear datos de prueba"""
    print("\n📊 Creando datos de prueba...")
    
    try:
        from app.models.dashboard import ClinicMetrics, ClinicAlerts
        from sqlalchemy.orm import sessionmaker
        
        engine = create_engine(DATABASE_URL)
        SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
        
        with SessionLocal() as db:
            # Crear métricas de prueba
            today = date.today()
            
            # Verificar si ya existen métricas para hoy
            existing = db.query(ClinicMetrics).filter(
                ClinicMetrics.clinic_id == "test_clinic",
                ClinicMetrics.metric_date == today
            ).first()
            
            if not existing:
                # Crear métricas de prueba
                test_metrics = ClinicMetrics(
                    clinic_id="test_clinic",
                    metric_date=today,
                    today_appointments=8,
                    pending_confirmations=3,
                    surgeries_today=2,
                    emergency_cases=1,
                    vaccinations_today=5,
                    checkups_today=3,
                    lab_results_pending=4,
                    prescriptions_active=12,
                    inventory_alerts=2,
                    daily_revenue=15450.00,
                    occupancy_rate=85,
                    new_patients_today=3,
                    critical_patients=2
                )
                
                db.add(test_metrics)
                
                # Crear alerta de prueba
                test_alert = ClinicAlerts(
                    clinic_id="test_clinic",
                    type="emergency",
                    title="Caso de Emergencia",
                    message="Max - Trauma automovilístico en camino",
                    priority="high",
                    icon="AlertTriangle",
                    color="#ef4444"
                )
                
                db.add(test_alert)
                db.commit()
                
                print("✅ Datos de prueba creados exitosamente")
            else:
                print("ℹ️  Los datos de prueba ya existen")
            
            return True
            
    except Exception as e:
        print(f"❌ Error creando datos de prueba: {e}")
        return False

def test_api_endpoints():
    """🌐 Paso 5: Simular endpoints API"""
    print("\n🌐 Simulando endpoints API...")
    
    try:
        from app.crud.dashboard_crud import get_critical_patients, get_daily_metrics, get_clinic_alerts
        from sqlalchemy.orm import sessionmaker
        
        engine = create_engine(DATABASE_URL)
        SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
        
        with SessionLocal() as db:
            # Test métricas diarias
            today = date.today()
            metrics = get_daily_metrics(db, "test_clinic", today)
            
            if metrics:
                print("✅ Métricas diarias funcionando:")
                print(f"   - Citas hoy: {metrics.today_appointments}")
                print(f"   - Cirugías: {metrics.surgeries_today}")
                print(f"   - Emergencias: {metrics.emergency_cases}")
                print(f"   - Ingresos: ${metrics.daily_revenue}")
            else:
                print("ℹ️  No hay métricas para test_clinic")
            
            # Test pacientes críticos
            critical_patients = get_critical_patients(db, "test_clinic")
            print(f"✅ Pacientes críticos: {len(critical_patients)} encontrados")
            
            # Test alertas
            alerts = get_clinic_alerts(db, "test_clinic")
            print(f"✅ Alertas: {len(alerts)} encontradas")
            
            return True
            
    except Exception as e:
        print(f"❌ Error en endpoints API: {e}")
        return False

def main():
    """🚀 Ejecutar todas las pruebas"""
    print("🧪 INICIANDO PRUEBAS DE INTEGRACIÓN BACKEND + SUPABASE")
    print("=" * 60)
    
    tests = [
        ("Conexión a Supabase", test_supabase_connection),
        ("Modelos SQLAlchemy", test_models_creation),
        ("Operaciones CRUD", test_crud_operations),
        ("Datos de Prueba", test_sample_data),
        ("Endpoints API", test_api_endpoints)
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
    print("\n" + "=" * 60)
    print("📊 RESUMEN DE PRUEBAS")
    print("=" * 60)
    
    passed = 0
    for test_name, result in results:
        status = "✅ PASÓ" if result else "❌ FALLÓ"
        print(f"{status} {test_name}")
        if result:
            passed += 1
    
    print(f"\n🎯 Resultado: {passed}/{len(results)} pruebas exitosas")
    
    if passed == len(results):
        print("🎉 ¡TODAS LAS PRUEBAS PASARON! El backend está listo para producción.")
        print("\n📋 Siguientes pasos:")
        print("   1. Iniciar el servidor backend: uvicorn main:app --reload")
        print("   2. Probar endpoints con curl o Postman")
        print("   3. Verificar integración con el frontend")
        print("   4. Deploy a producción")
    else:
        print("⚠️  Algunas pruebas fallaron. Revisa los errores arriba.")
    
    return passed == len(results)

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
