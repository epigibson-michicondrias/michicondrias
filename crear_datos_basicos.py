#!/usr/bin/env python3
"""
📊 Creación de Datos Básicos para Verificación del Sistema
Solo datos que funcionan sin problemas de tipo
"""

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend/michicondrias_directorio'))

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from datetime import date, datetime, timedelta
import uuid

# Configuración de Supabase
DATABASE_URL = "postgresql://postgres:Michicondrias201094*@db.zaegmfufrzjmjiemrvvp.supabase.co:5432/postgres"

def create_basic_test_data():
    """📊 Crear datos de prueba básicos"""
    print("📊 Creando datos de prueba básicos...")
    
    try:
        from app.models.dashboard import (
            MedicalRecordExtended, ClinicMetrics, ClinicAlerts,
            InventoryItems, LabTests
        )
        
        engine = create_engine(DATABASE_URL)
        SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
        
        with SessionLocal() as db:
            # 1. Crear Pacientes Críticos
            print("🏥 Creando pacientes críticos...")
            
            critical_patients_data = [
                {
                    "original_record_id": "pet_001",
                    "clinic_id": "test_clinic",
                    "status": "critical",
                    "alert_level": "red",
                    "next_checkup_date": datetime.now() + timedelta(hours=2),
                    "follow_up_required": True,
                    "is_critical": True,
                    "emergency_contact_notified": True,
                    "severity_score": 8,
                    "prognosis": "guarded",
                    "requires_hospitalization": True,
                    "estimated_recovery_days": 5,
                    "treatment_response": "stable",
                    "medication_adherence": "good",
                    "treatment_cost_estimate": 2500.00,
                    "payment_status": "pending"
                },
                {
                    "original_record_id": "pet_002", 
                    "clinic_id": "test_clinic",
                    "status": "emergency",
                    "alert_level": "yellow",
                    "next_checkup_date": datetime.now() + timedelta(hours=6),
                    "follow_up_required": True,
                    "is_critical": True,
                    "emergency_contact_notified": False,
                    "severity_score": 6,
                    "prognosis": "good",
                    "requires_hospitalization": False,
                    "estimated_recovery_days": 3,
                    "treatment_response": "improving",
                    "medication_adherence": "fair",
                    "treatment_cost_estimate": 800.00,
                    "payment_status": "paid"
                },
                {
                    "original_record_id": "pet_003",
                    "clinic_id": "test_clinic", 
                    "status": "stable",
                    "alert_level": "green",
                    "next_checkup_date": datetime.now() + timedelta(days=2),
                    "follow_up_required": False,
                    "is_critical": False,
                    "emergency_contact_notified": False,
                    "severity_score": 3,
                    "prognosis": "good",
                    "requires_hospitalization": False,
                    "estimated_recovery_days": 1,
                    "treatment_response": "improving",
                    "medication_adherence": "good",
                    "treatment_cost_estimate": 200.00,
                    "payment_status": "paid"
                }
            ]
            
            for patient_data in critical_patients_data:
                existing = db.query(MedicalRecordExtended).filter(
                    MedicalRecordExtended.original_record_id == patient_data["original_record_id"]
                ).first()
                
                if not existing:
                    patient = MedicalRecordExtended(**patient_data)
                    db.add(patient)
            
            # 2. Crear Items de Inventario
            print("💊 Creando items de inventario...")
            
            inventory_items_data = [
                {
                    "clinic_id": "test_clinic",
                    "name": "Anestesia General",
                    "description": "Anestesia inhalatoria para procedimientos quirúrgicos",
                    "category": "Anestésicos",
                    "unit": "ml",
                    "current_stock": 5.0,
                    "min_stock": 10.0,
                    "max_stock": 50.0,
                    "reorder_point": 15.0,
                    "supplier": "MediVet Supplies",
                    "supplier_contact": "contact@medivet.com",
                    "cost_per_unit": 45.50,
                    "selling_price": 65.00,
                    "is_medication": True,
                    "requires_prescription": True,
                    "storage_requirements": "Refrigerado entre 2-8°C",
                    "expiry_date": datetime.now() + timedelta(days=180),
                    "is_active": True,
                    "is_critical": True,
                    "last_restocked_at": datetime.now() - timedelta(days=5)
                },
                {
                    "clinic_id": "test_clinic",
                    "name": "Antibiótico Amoxicilina",
                    "description": "Antibiótico de amplio espectro",
                    "category": "Antibióticos",
                    "unit": "capsulas",
                    "current_stock": 25.0,
                    "min_stock": 30.0,
                    "max_stock": 100.0,
                    "reorder_point": 35.0,
                    "supplier": "PharmaCorp",
                    "supplier_contact": "orders@pharmacorp.com",
                    "cost_per_unit": 2.50,
                    "selling_price": 5.00,
                    "is_medication": True,
                    "requires_prescription": True,
                    "storage_requirements": "Temperatura ambiente",
                    "expiry_date": datetime.now() + timedelta(days=365),
                    "is_active": True,
                    "is_critical": False,
                    "last_restocked_at": datetime.now() - timedelta(days=10)
                },
                {
                    "clinic_id": "test_clinic",
                    "name": "Guantes Quirúrgicos",
                    "description": "Guantes estériles desechables",
                    "category": "Material Quirúrgico",
                    "unit": "cajas",
                    "current_stock": 8.0,
                    "min_stock": 5.0,
                    "max_stock": 20.0,
                    "reorder_point": 6.0,
                    "supplier": "Medical Supplies Co",
                    "supplier_contact": "sales@medsupplies.com",
                    "cost_per_unit": 15.00,
                    "selling_price": 25.00,
                    "is_medication": False,
                    "requires_prescription": False,
                    "storage_requirements": "Lugar seco y limpio",
                    "expiry_date": datetime.now() + timedelta(days=730),
                    "is_active": True,
                    "is_critical": False,
                    "last_restocked_at": datetime.now() - timedelta(days=3)
                }
            ]
            
            for item_data in inventory_items_data:
                existing = db.query(InventoryItems).filter(
                    InventoryItems.name == item_data["name"]
                ).first()
                
                if not existing:
                    item = InventoryItems(**item_data)
                    db.add(item)
            
            # 3. Crear Pruebas de Laboratorio
            print("🧪 Creando pruebas de laboratorio...")
            
            lab_tests_data = [
                {
                    "clinic_id": "test_clinic",
                    "patient_id": "pet_001",
                    "test_type": "Hematología",
                    "test_name": "Hemograma Completo",
                    "description": "Análisis completo de células sanguíneas",
                    "status": "completed",
                    "requested_date": datetime.now() - timedelta(hours=4),
                    "sample_collection_date": datetime.now() - timedelta(hours=3),
                    "completed_date": datetime.now() - timedelta(hours=1),
                    "results": None,
                    "interpretation": "Sin anomalías significativas",
                    "recommendations": "Continuar tratamiento actual",
                    "requesting_vet_id": "vet_001",
                    "processing_tech_id": "tech_001",
                    "cost": 150.00,
                    "is_paid": True
                },
                {
                    "clinic_id": "test_clinic",
                    "patient_id": "pet_002",
                    "test_type": "Bioquímica",
                    "test_name": "Perfil Hepático",
                    "description": "Análisis de función hepática",
                    "status": "pending",
                    "requested_date": datetime.now() - timedelta(hours=2),
                    "sample_collection_date": datetime.now() - timedelta(hours=1),
                    "results": None,
                    "interpretation": None,
                    "recommendations": None,
                    "requesting_vet_id": "vet_001",
                    "processing_tech_id": None,
                    "cost": 120.00,
                    "is_paid": False
                },
                {
                    "clinic_id": "test_clinic",
                    "patient_id": "pet_003",
                    "test_type": "Microbiología",
                    "test_name": "Cultivo y Sensibilidad",
                    "description": "Identificación de bacterias y antibiograma",
                    "status": "in_progress",
                    "requested_date": datetime.now() - timedelta(hours=6),
                    "sample_collection_date": datetime.now() - timedelta(hours=5),
                    "results": None,
                    "interpretation": None,
                    "recommendations": None,
                    "requesting_vet_id": "vet_002",
                    "processing_tech_id": None,
                    "cost": 200.00,
                    "is_paid": True
                }
            ]
            
            for test_data in lab_tests_data:
                existing = db.query(LabTests).filter(
                    LabTests.patient_id == test_data["patient_id"],
                    LabTests.test_name == test_data["test_name"]
                ).first()
                
                if not existing:
                    test = LabTests(**test_data)
                    db.add(test)
            
            # 4. Crear Alertas Adicionales
            print("🚨 Creando alertas adicionales...")
            
            alerts_data = [
                {
                    "clinic_id": "test_clinic",
                    "type": "inventory",
                    "title": "Stock Crítico - Anestesia",
                    "message": "Anestesia General con 5 unidades restantes, debajo del mínimo requerido (10)",
                    "priority": "high",
                    "icon": "Package",
                    "color": "#f59e0b",
                    "patient_id": None,
                    "appointment_id": None,
                    "expires_at": datetime.now() + timedelta(days=7)
                },
                {
                    "clinic_id": "test_clinic",
                    "type": "laboratory",
                    "title": "Resultados Listos - Hemograma",
                    "message": "Resultados de hemograma completos para Max (pet_001) listos para revisión",
                    "priority": "medium",
                    "icon": "TestTube",
                    "color": "#10b981",
                    "patient_id": "pet_001",
                    "appointment_id": None,
                    "expires_at": datetime.now() + timedelta(days=3)
                },
                {
                    "clinic_id": "test_clinic",
                    "type": "followup",
                    "title": "Recordatorio de Seguimiento",
                    "message": "Luna (pet_003) requiere revisión de seguimiento en 2 días",
                    "priority": "low",
                    "icon": "Clock",
                    "color": "#8b5cf6",
                    "patient_id": "pet_003",
                    "appointment_id": None,
                    "expires_at": datetime.now() + timedelta(days=2)
                }
            ]
            
            for alert_data in alerts_data:
                existing = db.query(ClinicAlerts).filter(
                    ClinicAlerts.title == alert_data["title"]
                ).first()
                
                if not existing:
                    alert = ClinicAlerts(**alert_data)
                    db.add(alert)
            
            db.commit()
            
            print("✅ Datos de prueba básicos creados exitosamente")
            return True
            
    except Exception as e:
        print(f"❌ Error creando datos: {e}")
        return False

def verify_basic_data():
    """🔍 Verificar los datos creados"""
    print("\n🔍 Verificando datos creados...")
    
    try:
        from app.models.dashboard import (
            MedicalRecordExtended, ClinicMetrics, ClinicAlerts,
            InventoryItems, LabTests
        )
        
        engine = create_engine(DATABASE_URL)
        SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
        
        with SessionLocal() as db:
            # Verificar pacientes críticos
            critical_patients = db.query(MedicalRecordExtended).filter(
                MedicalRecordExtended.is_critical == True
            ).all()
            print(f"🏥 Pacientes críticos: {len(critical_patients)}")
            
            for patient in critical_patients:
                print(f"   - {patient.original_record_id}: {patient.status} ({patient.alert_level})")
            
            # Verificar inventario
            inventory = db.query(InventoryItems).all()
            print(f"💊 Items de inventario: {len(inventory)}")
            
            for item in inventory:
                stock_status = "CRÍTICO" if item.current_stock <= item.min_stock else "OK"
                print(f"   - {item.name}: {item.current_stock} {item.unit} ({stock_status})")
            
            # Verificar pruebas de laboratorio
            lab_tests = db.query(LabTests).all()
            print(f"🧪 Pruebas de laboratorio: {len(lab_tests)}")
            
            for test in lab_tests:
                print(f"   - {test.patient_id}: {test.test_name} ({test.status})")
            
            # Verificar alertas
            alerts = db.query(ClinicAlerts).all()
            print(f"🚨 Alertas activas: {len(alerts)}")
            
            for alert in alerts:
                print(f"   - {alert.type}: {alert.title} ({alert.priority})")
            
            return True
            
    except Exception as e:
        print(f"❌ Error verificando datos: {e}")
        return False

def main():
    """🚀 Ejecutar creación y verificación de datos básicos"""
    print("🚀 INICIANDO CREACIÓN DE DATOS BÁSICOS")
    print("=" * 60)
    
    # Crear datos básicos
    if create_basic_test_data():
        # Verificar datos creados
        if verify_basic_data():
            print("\n🎉 ¡DATOS BÁSICOS CREADOS Y VERIFICADOS!")
            print("\n📋 Resumen:")
            print("   - ✅ Pacientes críticos creados")
            print("   - ✅ Inventario con stock crítico")
            print("   - ✅ Pruebas de laboratorio en diferentes estados")
            print("   - ✅ Alertas automáticas generadas")
            print("\n🎯 Sistema listo para verificación de endpoints!")
            return True
        else:
            print("❌ Error verificando datos")
            return False
    else:
        print("❌ Error creando datos")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
