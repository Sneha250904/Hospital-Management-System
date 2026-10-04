#ifndef HOSPITAL_H
#define HOSPITAL_H

#include "Patient.h"
#include "Doctor.h"
#include "Appointment.h"
#include "Bed.h"
#include "Billing.h"
#include "Emergency.h"
#include "Logger.h"

#include <vector>
#include <unordered_map>
#include <iostream>
#include <fstream>
#include <algorithm>

class Hospital {
private:
    std::unordered_map<int, Patient> patients;
    std::unordered_map<int, Doctor> doctors;
    std::unordered_map<int, Appointment> appointments;
    std::unordered_map<int, Bed> beds;
    std::vector<Billing> bills;
    EmergencyQueue emergencyQueue;

    int nextPatientId;
    int nextDoctorId;
    int nextAppointmentId;
    int nextBedId;
    int nextBillId;

public:
    Hospital();
    ~Hospital();

    // Data Load & Save
    void loadData();
    void saveData();

    // Module 1: Patient
    void patientPreRegistration();
    void patientRegistration();
    void searchPatient();
    void viewPatientDetails();
    void removePatient();

    // Module 2: Doctor
    void addDoctor();
    void viewDoctors();

    // Module 3: Appointment
    void bookAppointment();
    void viewAppointments();
    void cancelAppointment();

    // Module 4: Bed/Room
    void displayBeds();
    void allocateBedMenu();
    void releaseBed(int bedId);

    // Module 5: Emergency
    void emergencyMenu();

    // Module 6: Patient Tracking
    void patientTrackingMenu();

    // Module 7: Discharge
    void dischargePatient();

    // Module 8: Billing
    void generateBilling();

    // Module 9: Reports
    void generateReports();

    // Helper functions
    Patient* findPatient(int id);
    Doctor* findDoctor(int id);
    Bed* findBed(int id);
};

#endif // HOSPITAL_H
