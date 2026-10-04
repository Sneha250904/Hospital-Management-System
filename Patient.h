#ifndef PATIENT_H
#define PATIENT_H

#include <string>
#include <iostream>
#include <vector>

enum class PatientStatus {
    PRE_REGISTERED,
    PENDING_REVIEW,
    APPOINTMENT_CONFIRMED,
    ARRIVED,
    ADMITTED,
    UNDER_TREATMENT,
    DISCHARGED
};

std::string statusToString(PatientStatus status);
PatientStatus stringToStatus(const std::string& str);

class Patient {
private:
    int id;
    std::string name;
    int age;
    std::string gender;
    std::string phone;
    PatientStatus status;
    int allocatedBedId; // -1 if none

public:
    Patient();
    Patient(int id, std::string name, int age, std::string gender, std::string phone, PatientStatus status = PatientStatus::PRE_REGISTERED, int bedId = -1);

    int getId() const;
    std::string getName() const;
    int getAge() const;
    std::string getGender() const;
    std::string getPhone() const;
    PatientStatus getStatus() const;
    int getAllocatedBedId() const;

    void setName(const std::string& n);
    void setAge(int a);
    void setGender(const std::string& g);
    void setPhone(const std::string& p);
    void setStatus(PatientStatus s);
    void setAllocatedBedId(int bedId);

    void display() const;
    std::string serialize() const;
    static Patient deserialize(const std::string& line);
};

#endif // PATIENT_H
