#include "Patient.h"
#include <sstream>
#include <iomanip>
#include <vector>

std::string statusToString(PatientStatus status) {
    switch (status) {
        case PatientStatus::PRE_REGISTERED: return "PRE_REGISTERED";
        case PatientStatus::PENDING_REVIEW: return "PENDING_REVIEW";
        case PatientStatus::APPOINTMENT_CONFIRMED: return "APPOINTMENT_CONFIRMED";
        case PatientStatus::ARRIVED: return "ARRIVED";
        case PatientStatus::ADMITTED: return "ADMITTED";
        case PatientStatus::UNDER_TREATMENT: return "UNDER_TREATMENT";
        case PatientStatus::DISCHARGED: return "DISCHARGED";
        default: return "UNKNOWN";
    }
}

PatientStatus stringToStatus(const std::string& str) {
    if (str == "PRE_REGISTERED") return PatientStatus::PRE_REGISTERED;
    if (str == "PENDING_REVIEW") return PatientStatus::PENDING_REVIEW;
    if (str == "APPOINTMENT_CONFIRMED") return PatientStatus::APPOINTMENT_CONFIRMED;
    if (str == "ARRIVED") return PatientStatus::ARRIVED;
    if (str == "ADMITTED") return PatientStatus::ADMITTED;
    if (str == "UNDER_TREATMENT") return PatientStatus::UNDER_TREATMENT;
    if (str == "DISCHARGED") return PatientStatus::DISCHARGED;
    return PatientStatus::PRE_REGISTERED;
}

Patient::Patient() : id(0), name(""), age(0), gender(""), phone(""), status(PatientStatus::PRE_REGISTERED), allocatedBedId(-1) {}

Patient::Patient(int id, std::string name, int age, std::string gender, std::string phone, PatientStatus status, int bedId)
    : id(id), name(name), age(age), gender(gender), phone(phone), status(status), allocatedBedId(bedId) {}

int Patient::getId() const { return id; }
std::string Patient::getName() const { return name; }
int Patient::getAge() const { return age; }
std::string Patient::getGender() const { return gender; }
std::string Patient::getPhone() const { return phone; }
PatientStatus Patient::getStatus() const { return status; }
int Patient::getAllocatedBedId() const { return allocatedBedId; }

void Patient::setName(const std::string& n) { name = n; }
void Patient::setAge(int a) { age = a; }
void Patient::setGender(const std::string& g) { gender = g; }
void Patient::setPhone(const std::string& p) { phone = p; }
void Patient::setStatus(PatientStatus s) { status = s; }
void Patient::setAllocatedBedId(int bedId) { allocatedBedId = bedId; }

void Patient::display() const {
    std::cout << "ID: " << id
              << " | Name: " << name
              << " | Age: " << age
              << " | Gender: " << gender
              << " | Phone: " << phone
              << " | Status: " << statusToString(status)
              << " | Bed ID: " << (allocatedBedId == -1 ? "None" : std::to_string(allocatedBedId))
              << std::endl;
}

std::string Patient::serialize() const {
    // Format: id|name|age|gender|phone|status|bedId
    return std::to_string(id) + "|" + name + "|" + std::to_string(age) + "|" +
           gender + "|" + phone + "|" + statusToString(status) + "|" + std::to_string(allocatedBedId);
}

Patient Patient::deserialize(const std::string& line) {
    std::string cleanLine = line;
    while (!cleanLine.empty() && (cleanLine.back() == '\r' || cleanLine.back() == '\n')) cleanLine.pop_back();
    if (cleanLine.empty()) return Patient();
    std::stringstream ss(cleanLine);
    std::string item;
    std::vector<std::string> tokens;
    while (std::getline(ss, item, '|')) {
        tokens.push_back(item);
    }
    if (tokens.size() < 7) return Patient();
    int pId = std::stoi(tokens[0]);
    std::string pName = tokens[1];
    int pAge = std::stoi(tokens[2]);
    std::string pGender = tokens[3];
    std::string pPhone = tokens[4];
    PatientStatus pStatus = stringToStatus(tokens[5]);
    int pBedId = std::stoi(tokens[6]);
    return Patient(pId, pName, pAge, pGender, pPhone, pStatus, pBedId);
}
