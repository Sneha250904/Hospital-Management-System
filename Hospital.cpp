#include "Hospital.h"
#include <limits>
#include <iomanip>

// Helper to clear input buffer safely
static void clearInput() {
    std::cin.clear();
    std::cin.ignore(std::numeric_limits<std::streamsize>::max(), '\n');
}

Hospital::Hospital()
    : nextPatientId(101), nextDoctorId(201), nextAppointmentId(301), nextBedId(501), nextBillId(701) {
    loadData();
    // Initialize default beds if none loaded
    if (beds.empty()) {
        beds[501] = Bed(501, "General", false);
        beds[502] = Bed(502, "General", false);
        beds[503] = Bed(503, "ICU", false);
        beds[504] = Bed(504, "ICU", false);
        beds[505] = Bed(505, "Private", false);
        nextBedId = 506;
    }
}

Hospital::~Hospital() {
    saveData();
}

void Hospital::loadData() {
    patients.clear();
    doctors.clear();
    appointments.clear();
    beds.clear();
    bills.clear();

    nextPatientId = 101;
    nextDoctorId = 201;
    nextAppointmentId = 301;
    nextBedId = 501;
    nextBillId = 701;

    // Load Patients
    std::ifstream pFile("patients.txt");
    if (pFile.is_open()) {
        std::string line;
        while (std::getline(pFile, line)) {
            if (!line.empty()) {
                Patient p = Patient::deserialize(line);
                if (p.getId() != 0) {
                    patients[p.getId()] = p;
                    if (p.getId() >= nextPatientId) nextPatientId = p.getId() + 1;
                }
            }
        }
        pFile.close();
    }

    // Load Doctors
    std::ifstream dFile("doctors.txt");
    if (dFile.is_open()) {
        std::string line;
        while (std::getline(dFile, line)) {
            if (!line.empty()) {
                Doctor d = Doctor::deserialize(line);
                if (d.getId() != 0) {
                    doctors[d.getId()] = d;
                    if (d.getId() >= nextDoctorId) nextDoctorId = d.getId() + 1;
                }
            }
        }
        dFile.close();
    }

    // Load Appointments
    std::ifstream aFile("appointments.txt");
    if (aFile.is_open()) {
        std::string line;
        while (std::getline(aFile, line)) {
            if (!line.empty()) {
                Appointment a = Appointment::deserialize(line);
                if (a.getId() != 0) {
                    appointments[a.getId()] = a;
                    if (a.getId() >= nextAppointmentId) nextAppointmentId = a.getId() + 1;
                }
            }
        }
        aFile.close();
    }

    // Load Beds
    std::ifstream bFile("beds.txt");
    if (bFile.is_open()) {
        std::string line;
        while (std::getline(bFile, line)) {
            if (!line.empty()) {
                Bed b = Bed::deserialize(line);
                if (b.getBedId() != 0) {
                    beds[b.getBedId()] = b;
                    if (b.getBedId() >= nextBedId) nextBedId = b.getBedId() + 1;
                }
            }
        }
        bFile.close();
    }

    // Load Billing
    std::ifstream billFile("billing.txt");
    if (billFile.is_open()) {
        std::string line;
        while (std::getline(billFile, line)) {
            if (!line.empty()) {
                Billing bill = Billing::deserialize(line);
                if (bill.getBillId() != 0) {
                    bills.push_back(bill);
                    if (bill.getBillId() >= nextBillId) nextBillId = bill.getBillId() + 1;
                }
            }
        }
        billFile.close();
    }
}

void Hospital::saveData() {
    // Save Patients
    std::ofstream pFile("patients.txt");
    for (const auto& pair : patients) {
        pFile << pair.second.serialize() << "\n";
    }
    pFile.close();

    // Save Doctors
    std::ofstream dFile("doctors.txt");
    for (const auto& pair : doctors) {
        dFile << pair.second.serialize() << "\n";
    }
    dFile.close();

    // Save Appointments
    std::ofstream aFile("appointments.txt");
    for (const auto& pair : appointments) {
        aFile << pair.second.serialize() << "\n";
    }
    aFile.close();

    // Save Beds
    std::ofstream bFile("beds.txt");
    for (const auto& pair : beds) {
        bFile << pair.second.serialize() << "\n";
    }
    bFile.close();

    // Save Billing
    std::ofstream billFile("billing.txt");
    for (const auto& bill : bills) {
        billFile << bill.serialize() << "\n";
    }
    billFile.close();
}

Patient* Hospital::findPatient(int id) {
    auto it = patients.find(id);
    if (it != patients.end()) return &(it->second);
    return nullptr;
}

Doctor* Hospital::findDoctor(int id) {
    auto it = doctors.find(id);
    if (it != doctors.end()) return &(it->second);
    return nullptr;
}

Bed* Hospital::findBed(int id) {
    auto it = beds.find(id);
    if (it != beds.end()) return &(it->second);
    return nullptr;
}

// 1. Patient Pre-Registration
void Hospital::patientPreRegistration() {
    std::cout << "\n--- Patient Pre-Registration ---\n";
    std::string name, gender, phone;
    int age;

    std::cout << "Enter Patient Name: ";
    clearInput();
    std::getline(std::cin, name);
    std::cout << "Enter Age: ";
    while (!(std::cin >> age) || age <= 0) {
        std::cout << "Invalid age. Enter again: ";
        clearInput();
    }
    std::cout << "Enter Gender: ";
    clearInput();
    std::getline(std::cin, gender);
    std::cout << "Enter Phone Number: ";
    std::getline(std::cin, phone);

    int id = nextPatientId++;
    Patient p(id, name, age, gender, phone, PatientStatus::PRE_REGISTERED);
    patients[id] = p;

    Logger::log("Patient Pre-Registered: ID " + std::to_string(id) + " (" + name + ")");
    std::cout << "\nSuccess: Patient Pre-registered with ID: " << id << "\n";
    saveData();
}

// 2. Patient Registration
void Hospital::patientRegistration() {
    std::cout << "\n--- Patient Full Registration ---\n";
    std::cout << "1. Register New Patient\n";
    std::cout << "2. Complete Pre-Registered Patient Registration (Move to PENDING REVIEW)\n";
    std::cout << "Choice: ";
    int choice;
    if (!(std::cin >> choice)) {
        clearInput();
        return;
    }

    if (choice == 1) {
        std::string name, gender, phone;
        int age;

        std::cout << "Enter Patient Name: ";
        clearInput();
        std::getline(std::cin, name);
        std::cout << "Enter Age: ";
        while (!(std::cin >> age) || age <= 0) {
            std::cout << "Invalid age. Enter again: ";
            clearInput();
        }
        std::cout << "Enter Gender: ";
        clearInput();
        std::getline(std::cin, gender);
        std::cout << "Enter Phone Number: ";
        std::getline(std::cin, phone);

        int id = nextPatientId++;
        Patient p(id, name, age, gender, phone, PatientStatus::PENDING_REVIEW);
        patients[id] = p;

        Logger::log("Full Patient Registration created: ID " + std::to_string(id) + " (" + name + ")");
        std::cout << "\nSuccess: Full Patient Registered with ID: " << id << " (Status: PENDING_REVIEW)\n";
    } else if (choice == 2) {
        std::cout << "Enter Pre-Registered Patient ID: ";
        int pId;
        std::cin >> pId;
        Patient* p = findPatient(pId);
        if (!p) {
            std::cout << "Error: Patient not found.\n";
            return;
        }
        if (p->getStatus() == PatientStatus::PRE_REGISTERED) {
            p->setStatus(PatientStatus::PENDING_REVIEW);
            Logger::log("Patient Status updated to PENDING_REVIEW: ID " + std::to_string(pId));
            std::cout << "Success: Patient ID " << pId << " moved to PENDING REVIEW.\n";
        } else {
            std::cout << "Notice: Patient is already at status: " << statusToString(p->getStatus()) << "\n";
        }
    }
    saveData();
}

// 3. Search Patient
void Hospital::searchPatient() {
    std::cout << "\n--- Search Patient ---\n";
    std::cout << "Enter Patient ID: ";
    int id;
    if (!(std::cin >> id)) {
        clearInput();
        return;
    }
    Patient* p = findPatient(id);
    if (p) {
        std::cout << "\nPatient Record Found:\n";
        p->display();
    } else {
        std::cout << "Error: Patient ID " << id << " not found.\n";
    }
}

// Remove Patient
void Hospital::removePatient() {
    std::cout << "\n--- Remove Patient ---\n";
    std::cout << "Enter Patient ID to remove: ";
    int id;
    if (!(std::cin >> id)) {
        clearInput();
        return;
    }
    auto it = patients.find(id);
    if (it == patients.end()) {
        std::cout << "Error: Patient ID " << id << " not found.\n";
        return;
    }

    int bId = it->second.getAllocatedBedId();
    if (bId != -1) {
        releaseBed(bId);
    }
    std::string name = it->second.getName();
    patients.erase(it);
    Logger::log("Patient Removed: ID " + std::to_string(id) + " (" + name + ")");
    std::cout << "Success: Patient ID " << id << " (" << name << ") removed.\n";
    saveData();
}

// 4. Doctor Management
void Hospital::addDoctor() {
    std::cout << "\n--- Add Doctor ---\n";
    std::string name, spec;
    std::cout << "Enter Doctor Name: ";
    clearInput();
    std::getline(std::cin, name);
    std::cout << "Enter Specialization: ";
    std::getline(std::cin, spec);

    int id = nextDoctorId++;
    Doctor d(id, name, spec, true);
    doctors[id] = d;

    Logger::log("Doctor Added: ID " + std::to_string(id) + " (" + name + ")");
    std::cout << "Success: Doctor added with ID: " << id << "\n";
    saveData();
}

void Hospital::viewDoctors() {
    std::cout << "\n--- Doctor Management / List ---\n";
    if (doctors.empty()) {
        std::cout << "No doctors registered in system.\n";
        return;
    }
    for (const auto& pair : doctors) {
        pair.second.display();
    }
}

// 5. Appointment Management
void Hospital::bookAppointment() {
    std::cout << "\n--- Book Appointment ---\n";
    std::cout << "Enter Patient ID: ";
    int pId;
    if (!(std::cin >> pId)) { clearInput(); return; }
    Patient* p = findPatient(pId);
    if (!p) {
        std::cout << "Error: Patient not found.\n";
        return;
    }

    viewDoctors();
    std::cout << "\nEnter Doctor ID to book: ";
    int dId;
    if (!(std::cin >> dId)) { clearInput(); return; }
    Doctor* d = findDoctor(dId);
    if (!d) {
        std::cout << "Error: Doctor not found.\n";
        return;
    }

    std::string date, time;
    std::cout << "Enter Date (YYYY-MM-DD): ";
    clearInput();
    std::getline(std::cin, date);
    std::cout << "Enter Time (HH:MM): ";
    std::getline(std::cin, time);

    int aId = nextAppointmentId++;
    Appointment appt(aId, pId, dId, date, time, "BOOKED");
    appointments[aId] = appt;

    // Transition status to APPOINTMENT_CONFIRMED if appropriate
    if (p->getStatus() == PatientStatus::PRE_REGISTERED || p->getStatus() == PatientStatus::PENDING_REVIEW) {
        p->setStatus(PatientStatus::APPOINTMENT_CONFIRMED);
    }

    Logger::log("Appointment Booked ID: " + std::to_string(aId) + " for Patient ID " + std::to_string(pId) + " with Doctor ID " + std::to_string(dId));
    std::cout << "Success: Appointment Booked! Appointment ID: " << aId << "\n";
    saveData();
}

void Hospital::viewAppointments() {
    std::cout << "\n--- Appointment List ---\n";
    if (appointments.empty()) {
        std::cout << "No appointments booked.\n";
        return;
    }
    for (const auto& pair : appointments) {
        pair.second.display();
    }
}

void Hospital::cancelAppointment() {
    std::cout << "\n--- Cancel Appointment ---\n";
    std::cout << "Enter Appointment ID to cancel: ";
    int aId;
    if (!(std::cin >> aId)) { clearInput(); return; }
    auto it = appointments.find(aId);
    if (it != appointments.end()) {
        it->second.setStatus("CANCELLED");
        Logger::log("Appointment Cancelled: ID " + std::to_string(aId));
        std::cout << "Success: Appointment " << aId << " has been cancelled.\n";
        saveData();
    } else {
        std::cout << "Error: Appointment ID not found.\n";
    }
}

// 6. Bed Availability & Allocation
void Hospital::displayBeds() {
    std::cout << "\n--- Bed Availability ---\n";
    if (beds.empty()) {
        std::cout << "No beds configured.\n";
        return;
    }
    for (const auto& pair : beds) {
        pair.second.display();
    }
}

void Hospital::allocateBedMenu() {
    std::cout << "\n--- Allocate Bed ---\n";
    std::cout << "Enter Patient ID: ";
    int pId;
    if (!(std::cin >> pId)) { clearInput(); return; }
    Patient* p = findPatient(pId);
    if (!p) {
        std::cout << "Error: Patient not found.\n";
        return;
    }

    if (p->getAllocatedBedId() != -1) {
        std::cout << "Notice: Patient already allocated Bed ID: " << p->getAllocatedBedId() << "\n";
        return;
    }

    displayBeds();
    std::cout << "Enter Bed ID to allocate: ";
    int bId;
    if (!(std::cin >> bId)) { clearInput(); return; }
    Bed* b = findBed(bId);
    if (!b) {
        std::cout << "Error: Bed ID not found.\n";
        return;
    }
    if (b->getIsOccupied()) {
        std::cout << "Error: Bed " << bId << " is already occupied.\n";
        return;
    }

    b->setOccupied(true, pId);
    p->setAllocatedBedId(bId);
    p->setStatus(PatientStatus::ADMITTED);

    Logger::log("Bed Allocated: Bed " + std::to_string(bId) + " assigned to Patient ID " + std::to_string(pId));
    std::cout << "Success: Bed " << bId << " allocated to Patient " << pId << ". Status updated to ADMITTED.\n";
    saveData();
}

void Hospital::releaseBed(int bedId) {
    Bed* b = findBed(bedId);
    if (b) {
        b->setOccupied(false, -1);
    }
}

// 7. Emergency Queue
void Hospital::emergencyMenu() {
    std::cout << "\n--- Emergency Queue Management ---\n";
    std::cout << "1. Add Emergency Patient\n";
    std::cout << "2. Process Next Emergency Patient\n";
    std::cout << "3. View Emergency Queue\n";
    std::cout << "Choice: ";
    int choice;
    if (!(std::cin >> choice)) { clearInput(); return; }

    if (choice == 1) {
        std::cout << "Enter Existing Patient ID (or 0 for new emergency patient): ";
        int pId;
        std::cin >> pId;
        std::string name, cond;
        int priority;

        if (pId != 0 && findPatient(pId)) {
            Patient* p = findPatient(pId);
            name = p->getName();
        } else {
            std::cout << "Enter Patient Name: ";
            clearInput();
            std::getline(std::cin, name);
            pId = nextPatientId++;
            Patient p(pId, name, 0, "Unknown", "Emergency", PatientStatus::ARRIVED);
            patients[pId] = p;
        }

        std::cout << "Enter Emergency Priority Level (1 = Critical/Highest, 2 = Severe, 3 = Moderate): ";
        while (!(std::cin >> priority) || priority <= 0) {
            std::cout << "Invalid priority. Enter number >= 1: ";
            clearInput();
        }
        std::cout << "Enter Condition Description: ";
        clearInput();
        std::getline(std::cin, cond);

        emergencyQueue.addPatient(pId, name, priority, cond);
        Logger::log("Emergency Patient Added: ID " + std::to_string(pId) + " Priority " + std::to_string(priority));
        std::cout << "Success: Emergency Patient queued with priority level " << priority << ".\n";
    } else if (choice == 2) {
        if (emergencyQueue.isEmpty()) {
            std::cout << "Emergency queue is empty.\n";
            return;
        }
        EmergencyPatient ep = emergencyQueue.getNextPatient();
        std::cout << "\nProcessing High-Priority Emergency Patient:\n";
        std::cout << "ID: " << ep.patientId << " | Name: " << ep.name << " | Priority: " << ep.priority << " | Condition: " << ep.condition << "\n";

        Patient* p = findPatient(ep.patientId);
        if (p) {
            p->setStatus(PatientStatus::UNDER_TREATMENT);
        }
        Logger::log("Emergency Patient Processed: ID " + std::to_string(ep.patientId));
    } else if (choice == 3) {
        emergencyQueue.displayQueue();
    }
    saveData();
}

// 8. Patient Tracking
void Hospital::patientTrackingMenu() {
    std::cout << "\n--- Patient LifeCycle Tracking ---\n";
    std::cout << "Enter Patient ID: ";
    int pId;
    if (!(std::cin >> pId)) { clearInput(); return; }
    Patient* p = findPatient(pId);
    if (!p) {
        std::cout << "Error: Patient not found.\n";
        return;
    }

    std::cout << "\nCurrent Status for Patient ID " << pId << " (" << p->getName() << "): "
              << statusToString(p->getStatus()) << "\n";

    std::cout << "\nLifecycle Options:\n";
    std::cout << "1. Move to PENDING_REVIEW\n";
    std::cout << "2. Move to APPOINTMENT_CONFIRMED\n";
    std::cout << "3. Move to ARRIVED\n";
    std::cout << "4. Move to ADMITTED\n";
    std::cout << "5. Move to UNDER_TREATMENT\n";
    std::cout << "6. Move to DISCHARGED\n";
    std::cout << "0. Keep Current Status\n";
    std::cout << "Choice: ";
    int ch;
    if (!(std::cin >> ch)) { clearInput(); return; }

    PatientStatus oldStatus = p->getStatus();
    PatientStatus newStatus = oldStatus;

    switch (ch) {
        case 1: newStatus = PatientStatus::PENDING_REVIEW; break;
        case 2: newStatus = PatientStatus::APPOINTMENT_CONFIRMED; break;
        case 3: newStatus = PatientStatus::ARRIVED; break;
        case 4: newStatus = PatientStatus::ADMITTED; break;
        case 5: newStatus = PatientStatus::UNDER_TREATMENT; break;
        case 6: newStatus = PatientStatus::DISCHARGED; break;
        default: break;
    }

    if (newStatus != oldStatus) {
        p->setStatus(newStatus);
        Logger::log("Patient ID " + std::to_string(pId) + " status transition: " + statusToString(oldStatus) + " -> " + statusToString(newStatus));
        std::cout << "Status updated to " << statusToString(newStatus) << ".\n";
        saveData();
    }
}

// 9. Discharge
void Hospital::dischargePatient() {
    std::cout << "\n--- Patient Discharge ---\n";
    std::cout << "Enter Patient ID to discharge: ";
    int pId;
    if (!(std::cin >> pId)) { clearInput(); return; }
    Patient* p = findPatient(pId);
    if (!p) {
        std::cout << "Error: Patient not found.\n";
        return;
    }

    if (p->getStatus() == PatientStatus::DISCHARGED) {
        std::cout << "Notice: Patient is already discharged.\n";
        return;
    }

    p->setStatus(PatientStatus::DISCHARGED);
    int bId = p->getAllocatedBedId();
    if (bId != -1) {
        releaseBed(bId);
        p->setAllocatedBedId(-1);
        std::cout << "Released Bed ID: " << bId << "\n";
    }

    Logger::log("Patient Discharged: ID " + std::to_string(pId));
    std::cout << "Success: Patient ID " << pId << " has been DISCHARGED.\n";
    saveData();
}

// 10. Billing
void Hospital::generateBilling() {
    std::cout << "\n--- Generate Billing ---\n";
    std::cout << "Enter Patient ID: ";
    int pId;
    if (!(std::cin >> pId)) { clearInput(); return; }
    Patient* p = findPatient(pId);
    if (!p) {
        std::cout << "Error: Patient not found.\n";
        return;
    }

    double bedCharges = 0.0;
    if (p->getAllocatedBedId() != -1) {
        bedCharges = 250.00; // Flat bed fee demo standard
    }
    double treatmentCharges = 150.00; // Flat standard treatment fee

    std::cout << "Calculated Standard Bed Charges: $" << bedCharges << "\n";
    std::cout << "Enter Custom Treatment / Consultation Charges ($): ";
    std::cin >> treatmentCharges;

    int billId = nextBillId++;
    Billing bill(billId, pId, bedCharges, treatmentCharges, true);
    bills.push_back(bill);

    Logger::log("Billing Generated: Bill ID " + std::to_string(billId) + " for Patient ID " + std::to_string(pId) + " Amount: $" + std::to_string(bill.getTotalAmount()));

    std::cout << "\n========== BILL RECEIPT ==========\n";
    bill.display();
    std::cout << "===================================\n";
    saveData();
}

// 11. Reports
void Hospital::generateReports() {
    std::cout << "\n=========== HOSPITAL SYSTEM REPORTS ===========\n";
    std::cout << "Total Registered Patients: " << patients.size() << "\n";
    
    // Status breakdown
    std::unordered_map<std::string, int> statusCount;
    for (const auto& pair : patients) {
        statusCount[statusToString(pair.second.getStatus())]++;
    }
    std::cout << "\n--- Patients by Status ---\n";
    for (const auto& pair : statusCount) {
        std::cout << "  " << pair.first << ": " << pair.second << "\n";
    }

    // Beds
    int occBeds = 0, availBeds = 0;
    for (const auto& pair : beds) {
        if (pair.second.getIsOccupied()) occBeds++;
        else availBeds++;
    }
    std::cout << "\n--- Bed Summary ---\n";
    std::cout << "  Total Beds: " << beds.size() << "\n";
    std::cout << "  Occupied Beds: " << occBeds << "\n";
    std::cout << "  Available Beds: " << availBeds << "\n";

    // Doctors
    std::cout << "\n--- Total Doctors Registered: " << doctors.size() << " ---\n";

    // Appointments
    std::cout << "--- Total Appointments Recorded: " << appointments.size() << " ---\n";

    // Billing / Revenue
    double totalRev = 0.0;
    for (const auto& b : bills) {
        totalRev += b.getTotalAmount();
    }
    std::cout << "\n--- Financial Summary ---\n";
    std::cout << "  Total Revenue Generated: $" << std::fixed << std::setprecision(2) << totalRev << "\n";
    std::cout << "================================================\n";
}
