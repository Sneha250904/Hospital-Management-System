#include "Bed.h"
#include <sstream>

Bed::Bed() : bedId(0), type("General"), isOccupied(false), patientId(-1) {}

Bed::Bed(int bedId, std::string type, bool isOccupied, int patientId)
    : bedId(bedId), type(type), isOccupied(isOccupied), patientId(patientId) {}

int Bed::getBedId() const { return bedId; }
std::string Bed::getType() const { return type; }
bool Bed::getIsOccupied() const { return isOccupied; }
int Bed::getPatientId() const { return patientId; }

void Bed::setOccupied(bool occ, int pId) {
    isOccupied = occ;
    patientId = occ ? pId : -1;
}

void Bed::display() const {
    std::cout << "Bed ID: " << bedId
              << " | Type: " << type
              << " | Status: " << (isOccupied ? "Occupied (Patient ID: " + std::to_string(patientId) + ")" : "Available")
              << std::endl;
}

std::string Bed::serialize() const {
    return std::to_string(bedId) + "|" + type + "|" + (isOccupied ? "1" : "0") + "|" + std::to_string(patientId);
}

Bed Bed::deserialize(const std::string& line) {
    std::string cleanLine = line;
    while (!cleanLine.empty() && (cleanLine.back() == '\r' || cleanLine.back() == '\n')) cleanLine.pop_back();
    if (cleanLine.empty()) return Bed();
    std::stringstream ss(cleanLine);
    std::string item;
    std::vector<std::string> tokens;
    while (std::getline(ss, item, '|')) {
        tokens.push_back(item);
    }
    if (tokens.size() < 4) return Bed();
    int bId = std::stoi(tokens[0]);
    std::string bType = tokens[1];
    bool occ = (tokens[2] == "1" || tokens[2] == "true");
    int pId = std::stoi(tokens[3]);
    return Bed(bId, bType, occ, pId);
}
