#ifndef LOGGER_H
#define LOGGER_H

#include <string>
#include <fstream>
#include <iostream>
#include <chrono>
#include <ctime>

class Logger {
public:
    static void log(const std::string& message) {
        std::ofstream logFile("logs.txt", std::ios::app);
        if (logFile.is_open()) {
            auto now = std::chrono::system_clock::to_time_t(std::chrono::system_clock::now());
            std::string timeStr = std::ctime(&now);
            if (!timeStr.empty() && timeStr.back() == '\n') {
                timeStr.pop_back();
            }
            logFile << "[" << timeStr << "] " << message << std::endl;
            logFile.close();
        }
    }
};

#endif // LOGGER_H
