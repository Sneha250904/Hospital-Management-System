#include "Appointment.h"
#include <sstream>

Appointment::Appointment() : id(0), patientId(0), doctorId(0), date(""), time(""), status("BOOKED") {}

Appointment::Appointment(int id, int patientId, int doctorId, std::string date, std::string time, std::string status)
    : id(id), patientId(patientId), doctorId(doctorId), date(date), time(time), status(status) {}

int Appointment::getId() const { return id; }
int Appointment::getPatientId() const { return patientId; }
int Appointment::getDoctorId() const { return doctorId; }
std::string Appointment::getDate() const { return date; }
std::string Appointment::getTime() const { return time; }
std::string Appointment::getStatus() const { return status; }

void Appointment::setStatus(const std::string& s) { status = s; }

void Appointment::display() const {
    std::cout << "Appt ID: " << id
              << " | Patient ID: " << patientId
              << " | Doctor ID: " << doctorId
              << " | Date: " << date
              << " | Time: " << time
              << " | Status: " << status
              << std::endl;
}

std::string Appointment::serialize() const {
    return std::to_string(id) + "|" + std::to_string(patientId) + "|" + std::to_string(doctorId) + "|" + date + "|" + time + "|" + status;
}

Appointment Appointment::deserialize(const std::string& line) {
    std::string cleanLine = line;
    while (!cleanLine.empty() && (cleanLine.back() == '\r' || cleanLine.back() == '\n')) cleanLine.pop_back();
    if (cleanLine.empty()) return Appointment();
    std::stringstream ss(cleanLine);
    std::string item;
    std::vector<std::string> tokens;
    while (std::getline(ss, item, '|')) {
        tokens.push_back(item);
    }
    if (tokens.size() < 6) return Appointment();
    int aId = std::stoi(tokens[0]);
    int pId = std::stoi(tokens[1]);
    int dId = std::stoi(tokens[2]);
    std::string dt = tokens[3];
    std::string tm = tokens[4];
    std::string st = tokens[5];
    return Appointment(aId, pId, dId, dt, tm, st);
}
