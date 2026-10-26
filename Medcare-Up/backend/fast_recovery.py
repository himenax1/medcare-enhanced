from database import engine
from sqlalchemy import text

# Using engine.begin() safely auto-commits the transaction
with engine.begin() as conn:
    # Inject 25 Medicines
    conn.execute(text("""
        INSERT INTO medicine_inventory (name, brand, category, unit_price, stock_quantity, is_available) VALUES 
        ('Paracetamol 500mg', 'Panadol', 'General', 5.0, 100, true),
        ('Amoxicillin 250mg', 'Amoxil', 'Antibiotics', 15.0, 100, true),
        ('Metformin 500mg', 'Glucophage', 'Diabetes', 12.0, 100, true),
        ('Losartan 50mg', 'Cozaar', 'Nephrology', 20.0, 100, true),
        ('Atorvastatin 20mg', 'Lipitor', 'Cardiology', 25.0, 100, true),
        ('Omeprazole 20mg', 'Losec', 'Gastroenterology', 10.0, 100, true),
        ('Cetirizine 10mg', 'Zyrtec', 'Allergy', 8.0, 100, true),
        ('Ibuprofen 400mg', 'Brufen', 'Pain Relief', 10.0, 100, true),
        ('Azithromycin 500mg', 'Zithromax', 'Antibiotics', 50.0, 100, true),
        ('Salbutamol Inhaler', 'Ventolin', 'Respiratory', 450.0, 50, true),
        ('Aspirin 75mg', 'Disprin', 'Cardiology', 8.0, 150, true),
        ('Loratadine 10mg', 'Claritin', 'Allergy', 12.0, 80, true),
        ('Ciprofloxacin 500mg', 'Cipro', 'Antibiotics', 20.0, 60, true),
        ('Pantoprazole 40mg', 'Protonix', 'Gastroenterology', 15.0, 90, true),
        ('Diclofenac 50mg', 'Voltaren', 'Pain Relief', 10.0, 120, true),
        ('Amlodipine 5mg', 'Norvasc', 'Cardiology', 18.0, 110, true),
        ('Gliclazide 80mg', 'Diamicron', 'Diabetes', 14.0, 95, true),
        ('Levothyroxine 50mcg', 'Synthroid', 'Endocrinology', 10.0, 130, true),
        ('Clopidogrel 75mg', 'Plavix', 'Cardiology', 30.0, 70, true),
        ('Rosuvastatin 10mg', 'Crestor', 'Cardiology', 40.0, 85, true),
        ('Domperidone 10mg', 'Motilium', 'Gastroenterology', 6.0, 140, true),
        ('Mefenamic Acid 500mg', 'Ponstan', 'Pain Relief', 12.0, 100, true),
        ('Prednisolone 5mg', 'Omnacortil', 'Steroid', 5.0, 150, true),
        ('Vitamin C 500mg', 'Cebion', 'Supplement', 10.0, 200, true),
        ('Zinc Sulfate 20mg', 'Zincet', 'Supplement', 15.0, 100, true);
    """))
    
    # Inject 10 Lab Tests
    conn.execute(text("""
        INSERT INTO lab_test_catalog (test_name, price) VALUES 
        ('Full Blood Count (FBC)', 1500.0),
        ('Fasting Blood Sugar (FBS)', 900.0),
        ('Lipid Profile', 2500.0),
        ('Liver Function Test (LFT)', 3000.0),
        ('Serum Creatinine', 1200.0),
        ('Urine Full Report (UFR)', 800.0),
        ('HbA1c', 2800.0),
        ('ECG', 1500.0),
        ('Chest X-Ray', 2000.0),
        ('Thyroid Profile (TSH)', 3500.0);
    """))
    
print("SUCCESS: 25 Medicines and 10 Lab Tests fully restored to the database!")