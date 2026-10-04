#ifndef EMERGENCY_H
#define EMERGENCY_H

#include <string>
#include <queue>
#include <vector>
#include <iostream>

struct EmergencyPatient {
    int patientId;
    std::string name;
    int priority; // Lower number means higher priority (e.g. 1 = Critical, 2 = Severe, 3 = Moderate)
    std::string condition;

    // Custom comparator for priority queue
    bool operator<(const EmergencyPatient& other) const {
        return priority > other.priority; // Min-heap behavior: priority 1 comes before priority 2
    }
};

class EmergencyQueue {
private:
    std::priority_queue<EmergencyPatient> queue;

public:
    void addPatient(int patientId, const std::string& name, int priority, const std::string& condition) {
        queue.push({patientId, name, priority, condition});
    }

    bool isEmpty() const {
        return queue.empty();
    }

    EmergencyPatient getNextPatient() {
        if (queue.empty()) return {-1, "", 0, ""};
        EmergencyPatient p = queue.top();
        queue.pop();
        return p;
    }

    void displayQueue() const {
        if (queue.empty()) {
            std::cout << "Emergency queue is currently empty.\n";
            return;
        }
        std::priority_queue<EmergencyPatient> temp = queue;
        std::cout << "\n=== EMERGENCY QUEUE (Highest Priority First) ===\n";
        int rank = 1;
        while (!temp.empty()) {
            EmergencyPatient p = temp.top();
            temp.pop();
            std::cout << rank++ << ". Priority: " << p.priority
                      << " | Patient ID: " << p.patientId
                      << " | Name: " << p.name
                      << " | Condition: " << p.condition << std::endl;
        }
    }
};

#endif // EMERGENCY_H
