#ifndef BILLING_H
#define BILLING_H

#include <string>
#include <iostream>
#include <vector>

class Billing {
private:
    int billId;
    int patientId;
    double bedCharges;
    double treatmentCharges;
    double totalAmount;
    bool isPaid;

public:
    Billing();
    Billing(int billId, int patientId, double bedCharges, double treatmentCharges, bool isPaid = false);

    int getBillId() const;
    int getPatientId() const;
    double getBedCharges() const;
    double getTreatmentCharges() const;
    double getTotalAmount() const;
    bool getIsPaid() const;

    void setIsPaid(bool paid);

    void display() const;
    std::string serialize() const;
    static Billing deserialize(const std::string& line);
};

#endif // BILLING_H
