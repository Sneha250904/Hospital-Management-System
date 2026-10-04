#ifndef APPOINTMENT_H
#define APPOINTMENT_H

#include <string>
#include <iostream>
#include <vector>

class Appointment {
private:
    int id;
    int patientId;
    int doctorId;
    std::string date;
    std::string time;
    std::string status; // BOOKED, CANCELLED, COMPLETED

public:
    Appointment();
    Appointment(int id, int patientId, int doctorId, std::string date, std::string time, std::string status = "BOOKED");

    int getId() const;
    int getPatientId() const;
    int getDoctorId() const;
    std::string getDate() const;
    std::string getTime() const;
    std::string getStatus() const;

    void setStatus(const std::string& s);

    void display() const;
    std::string serialize() const;
    static Appointment deserialize(const std::string& line);
};

#endif // APPOINTMENT_H
