#include <iostream>
#include "Hospital.h"

void printMenu() {
    std::cout << "\n=========== HOSPITAL MENU ===========\n"
              << "1. Patient Pre-Registration\n"
              << "2. Patient Registration\n"
              << "3. Search Patient\n"
              << "4. Doctor Management\n"
              << "5. Appointment Management\n"
              << "6. Bed Availability\n"
              << "7. Allocate Bed\n"
              << "8. Emergency Queue\n"
              << "9. Patient Tracking\n"
              << "10. Discharge\n"
              << "11. Billing\n"
              << "12. Reports\n"
              << "13. Remove Patient\n"
              << "0. Exit\n"
              << "=====================================\n"
              << "Enter choice: ";
}

int main() {
    Hospital hospital;
    int choice = -1;

    std::cout << "Welcome to the Hospital Management System!\n";

    while (true) {
        hospital.loadData();
        printMenu();
        if (!(std::cin >> choice)) {
            std::cin.clear();
            std::cin.ignore(10000, '\n');
            std::cout << "Invalid input! Please enter a valid menu number.\n";
            continue;
        }

        hospital.loadData();

        if (choice == 0) {
            std::cout << "Exiting system. Data saved successfully. Goodbye!\n";
            break;
        }

        switch (choice) {
            case 1:
                hospital.patientPreRegistration();
                break;
            case 2:
                hospital.patientRegistration();
                break;
            case 3:
                hospital.searchPatient();
                break;
            case 4:
                std::cout << "\n--- Doctor Management Menu ---\n";
                std::cout << "1. View Doctors\n";
                std::cout << "2. Add Doctor\n";
                std::cout << "Choice: ";
                int dCh;
                if (std::cin >> dCh) {
                    if (dCh == 1) hospital.viewDoctors();
                    else if (dCh == 2) hospital.addDoctor();
                } else {
                    std::cin.clear();
                    std::cin.ignore(10000, '\n');
                }
                break;
            case 5:
                std::cout << "\n--- Appointment Management Menu ---\n";
                std::cout << "1. View Appointments\n";
                std::cout << "2. Book Appointment\n";
                std::cout << "3. Cancel Appointment\n";
                std::cout << "Choice: ";
                int aCh;
                if (std::cin >> aCh) {
                    if (aCh == 1) hospital.viewAppointments();
                    else if (aCh == 2) hospital.bookAppointment();
                    else if (aCh == 3) hospital.cancelAppointment();
                } else {
                    std::cin.clear();
                    std::cin.ignore(10000, '\n');
                }
                break;
            case 6:
                hospital.displayBeds();
                break;
            case 7:
                hospital.allocateBedMenu();
                break;
            case 8:
                hospital.emergencyMenu();
                break;
            case 9:
                hospital.patientTrackingMenu();
                break;
            case 10:
                hospital.dischargePatient();
                break;
            case 11:
                hospital.generateBilling();
                break;
            case 12:
                hospital.generateReports();
                break;
            case 13:
                hospital.removePatient();
                break;
            default:
                std::cout << "Invalid option! Please enter a number between 0 and 13.\n";
                break;
        }
    }

    return 0;
}
