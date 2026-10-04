#ifndef DOCTOR_H
#define DOCTOR_H

#include <string>
#include <iostream>
#include <vector>

class Doctor {
private:
    int id;
    std::string name;
    std::string specialization;
    bool isAvailable;

public:
    Doctor();
    Doctor(int id, std::string name, std::string specialization, bool isAvailable = true);

    int getId() const;
    std::string getName() const;
    std::string getSpecialization() const;
    bool getIsAvailable() const;

    void setName(const std::string& n);
    void setSpecialization(const std::string& s);
    void setIsAvailable(bool avail);

    void display() const;
    std::string serialize() const;
    static Doctor deserialize(const std::string& line);
};

#endif // DOCTOR_H
