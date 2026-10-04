#include "Doctor.h"
#include <sstream>

Doctor::Doctor() : id(0), name(""), specialization(""), isAvailable(true) {}

Doctor::Doctor(int id, std::string name, std::string specialization, bool isAvailable)
    : id(id), name(name), specialization(specialization), isAvailable(isAvailable) {}

int Doctor::getId() const { return id; }
std::string Doctor::getName() const { return name; }
std::string Doctor::getSpecialization() const { return specialization; }
bool Doctor::getIsAvailable() const { return isAvailable; }

void Doctor::setName(const std::string& n) { name = n; }
void Doctor::setSpecialization(const std::string& s) { specialization = s; }
void Doctor::setIsAvailable(bool avail) { isAvailable = avail; }

void Doctor::display() const {
    std::cout << "Doctor ID: " << id
              << " | Name: " << name
              << " | Specialization: " << specialization
              << " | Available: " << (isAvailable ? "Yes" : "No")
              << std::endl;
}

std::string Doctor::serialize() const {
    return std::to_string(id) + "|" + name + "|" + specialization + "|" + (isAvailable ? "1" : "0");
}

Doctor Doctor::deserialize(const std::string& line) {
    std::string cleanLine = line;
    while (!cleanLine.empty() && (cleanLine.back() == '\r' || cleanLine.back() == '\n')) cleanLine.pop_back();
    if (cleanLine.empty()) return Doctor();
    std::stringstream ss(cleanLine);
    std::string item;
    std::vector<std::string> tokens;
    while (std::getline(ss, item, '|')) {
        tokens.push_back(item);
    }
    if (tokens.size() < 4) return Doctor();
    int dId = std::stoi(tokens[0]);
    std::string dName = tokens[1];
    std::string dSpec = tokens[2];
    bool avail = (tokens[3] == "1" || tokens[3] == "true");
    return Doctor(dId, dName, dSpec, avail);
}
