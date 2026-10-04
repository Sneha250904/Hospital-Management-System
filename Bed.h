#ifndef BED_H
#define BED_H

#include <string>
#include <iostream>
#include <vector>

class Bed {
private:
    int bedId;
    std::string type; // General, ICU, Private
    bool isOccupied;
    int patientId; // -1 if vacant

public:
    Bed();
    Bed(int bedId, std::string type, bool isOccupied = false, int patientId = -1);

    int getBedId() const;
    std::string getType() const;
    bool getIsOccupied() const;
    int getPatientId() const;

    void setOccupied(bool occ, int pId = -1);

    void display() const;
    std::string serialize() const;
    static Bed deserialize(const std::string& line);
};

#endif // BED_H
