#include "Billing.h"
#include <sstream>
#include <iomanip>

Billing::Billing() : billId(0), patientId(0), bedCharges(0.0), treatmentCharges(0.0), totalAmount(0.0), isPaid(false) {}

Billing::Billing(int billId, int patientId, double bedCharges, double treatmentCharges, bool isPaid)
    : billId(billId), patientId(patientId), bedCharges(bedCharges), treatmentCharges(treatmentCharges),
      totalAmount(bedCharges + treatmentCharges), isPaid(isPaid) {}

int Billing::getBillId() const { return billId; }
int Billing::getPatientId() const { return patientId; }
double Billing::getBedCharges() const { return bedCharges; }
double Billing::getTreatmentCharges() const { return treatmentCharges; }
double Billing::getTotalAmount() const { return totalAmount; }
bool Billing::getIsPaid() const { return isPaid; }

void Billing::setIsPaid(bool paid) { isPaid = paid; }

void Billing::display() const {
    std::cout << "Bill ID: " << billId
              << " | Patient ID: " << patientId
              << " | Bed Charges: $" << std::fixed << std::setprecision(2) << bedCharges
              << " | Treatment Charges: $" << treatmentCharges
              << " | Total: $" << totalAmount
              << " | Paid: " << (isPaid ? "Yes" : "No")
              << std::endl;
}

std::string Billing::serialize() const {
    return std::to_string(billId) + "|" + std::to_string(patientId) + "|" +
           std::to_string(bedCharges) + "|" + std::to_string(treatmentCharges) + "|" +
           std::to_string(totalAmount) + "|" + (isPaid ? "1" : "0");
}

Billing Billing::deserialize(const std::string& line) {
    std::string cleanLine = line;
    while (!cleanLine.empty() && (cleanLine.back() == '\r' || cleanLine.back() == '\n')) cleanLine.pop_back();
    if (cleanLine.empty()) return Billing();
    std::stringstream ss(cleanLine);
    std::string item;
    std::vector<std::string> tokens;
    while (std::getline(ss, item, '|')) {
        tokens.push_back(item);
    }
    if (tokens.size() < 6) return Billing();
    int bId = std::stoi(tokens[0]);
    int pId = std::stoi(tokens[1]);
    double bedC = std::stod(tokens[2]);
    double treatC = std::stod(tokens[3]);
    bool paid = (tokens[5] == "1" || tokens[5] == "true");
    return Billing(bId, pId, bedC, treatC, paid);
}
