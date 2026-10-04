import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '..');

const app = express();
app.use(cors());
app.use(express.json());

const PATIENTS_FILE = path.join(DATA_DIR, 'patients.txt');
const DOCTORS_FILE = path.join(DATA_DIR, 'doctors.txt');
const APPOINTMENTS_FILE = path.join(DATA_DIR, 'appointments.txt');
const BEDS_FILE = path.join(DATA_DIR, 'beds.txt');
const BILLING_FILE = path.join(DATA_DIR, 'billing.txt');

// --- Helpers ---
const readFileLines = (filePath) => {
  if (!fs.existsSync(filePath)) return [];
  const content = fs.readFileSync(filePath, 'utf-8');
  return content.split(/\r?\n/).filter(line => line.trim() !== '');
};

const writeLines = (filePath, lines) => {
  const tmpPath = `${filePath}.tmp`;
  fs.writeFileSync(tmpPath, lines.join('\n') + (lines.length > 0 ? '\n' : ''), 'utf-8');
  fs.renameSync(tmpPath, filePath);
};

const getPatientsList = () => {
  const lines = readFileLines(PATIENTS_FILE);
  return lines.map(line => {
    const parts = line.split('|');
    return {
      id: parseInt(parts[0]) || 0,
      name: parts[1] || '',
      age: parseInt(parts[2]) || 0,
      gender: parts[3] || '',
      phone: parts[4] || '',
      status: parts[5] || 'PRE_REGISTERED',
      bedId: parts[6] === '-1' || !parts[6] ? null : parseInt(parts[6])
    };
  }).filter(p => p.id > 0);
};

const getDoctorsList = () => {
  const lines = readFileLines(DOCTORS_FILE);
  return lines.map(line => {
    const parts = line.split('|');
    return {
      id: parseInt(parts[0]) || 0,
      name: parts[1] || '',
      specialization: parts[2] || '',
      available: parts[3] === '1' || parts[3] === 'true'
    };
  }).filter(d => d.id > 0);
};

// --- Patients API ---
// Format: id|name|age|gender|phone|status|bedId
app.get('/api/patients', (req, res) => {
  try {
    res.json(getPatientsList());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/patients', (req, res) => {
  try {
    const { name, age, gender, phone, status = 'PRE_REGISTERED', bedId = null } = req.body;
    const lines = readFileLines(PATIENTS_FILE);
    
    let maxId = 100;
    lines.forEach(line => {
      const id = parseInt(line.split('|')[0]);
      if (id > maxId) maxId = id;
    });
    const newId = maxId + 1;

    const formattedBedId = bedId === null ? -1 : bedId;
    const newLine = `${newId}|${name}|${age}|${gender}|${phone}|${status}|${formattedBedId}`;
    lines.push(newLine);
    writeLines(PATIENTS_FILE, lines);

    const newPatient = { id: newId, name, age: parseInt(age), gender, phone, status, bedId };
    res.json(newPatient);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/patients/:id/status', (req, res) => {
  try {
    const patientId = parseInt(req.params.id);
    const { status } = req.body;
    const lines = readFileLines(PATIENTS_FILE);
    let updatedPatient = null;

    const updatedLines = lines.map(line => {
      const parts = line.split('|');
      if (parseInt(parts[0]) === patientId) {
        parts[5] = status;
        updatedPatient = {
          id: parseInt(parts[0]),
          name: parts[1],
          age: parseInt(parts[2]),
          gender: parts[3],
          phone: parts[4],
          status: parts[5],
          bedId: parts[6] === '-1' ? null : parseInt(parts[6])
        };
        return parts.join('|');
      }
      return line;
    });

    if (!updatedPatient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    writeLines(PATIENTS_FILE, updatedLines);
    res.json(updatedPatient);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/patients/:id', (req, res) => {
  try {
    const patientId = parseInt(req.params.id);
    const lines = readFileLines(PATIENTS_FILE);
    const filteredLines = lines.filter(line => parseInt(line.split('|')[0]) !== patientId);
    
    if (lines.length === filteredLines.length) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    writeLines(PATIENTS_FILE, filteredLines);

    // If patient had an assigned bed, release it in beds.txt
    const bedLines = readFileLines(BEDS_FILE);
    const updatedBedLines = bedLines.map(line => {
      const parts = line.split('|');
      if (parseInt(parts[3]) === patientId) {
        parts[2] = '0';
        parts[3] = '-1';
        return parts.join('|');
      }
      return line;
    });
    writeLines(BEDS_FILE, updatedBedLines);

    res.json({ success: true, message: `Patient #${patientId} removed.` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Doctors API ---
// Format: id|name|specialization|available
app.get('/api/doctors', (req, res) => {
  try {
    res.json(getDoctorsList());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/doctors', (req, res) => {
  try {
    const { name, specialization } = req.body;
    const lines = readFileLines(DOCTORS_FILE);

    let maxId = 200;
    lines.forEach(line => {
      const id = parseInt(line.split('|')[0]);
      if (id > maxId) maxId = id;
    });
    const newId = maxId + 1;

    const newLine = `${newId}|${name}|${specialization}|1`;
    lines.push(newLine);
    writeLines(DOCTORS_FILE, lines);

    res.json({ id: newId, name, specialization, available: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/doctors/:id/toggle', (req, res) => {
  try {
    const docId = parseInt(req.params.id);
    const lines = readFileLines(DOCTORS_FILE);
    const updated = lines.map(line => {
      const parts = line.split('|');
      if (parseInt(parts[0]) === docId) {
        const isAvail = parts[3] === '1' || parts[3] === 'true';
        parts[3] = isAvail ? '0' : '1';
      }
      return parts.join('|');
    });
    writeLines(DOCTORS_FILE, updated);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Appointments API ---
// Format: id|patientId|doctorId|date|time|status
app.get('/api/appointments', (req, res) => {
  try {
    const patients = getPatientsList();
    const doctors = getDoctorsList();
    const patientMap = new Map(patients.map(p => [p.id, p.name]));
    const doctorMap = new Map(doctors.map(d => [d.id, d.name]));

    const lines = readFileLines(APPOINTMENTS_FILE);
    const appts = lines.map(line => {
      const parts = line.split('|');
      const pId = parseInt(parts[1]) || 0;
      const dId = parseInt(parts[2]) || 0;
      return {
        id: parseInt(parts[0]) || 0,
        patientId: pId,
        doctorId: dId,
        patientName: patientMap.get(pId) || `Patient #${pId}`,
        doctorName: doctorMap.get(dId) || `Doctor #${dId}`,
        date: parts[3] || '',
        time: parts[4] || '',
        status: parts[5] || 'BOOKED'
      };
    }).filter(a => a.id > 0);
    res.json(appts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/appointments', (req, res) => {
  try {
    let { patientId, doctorId, patientName, doctorName, date, time } = req.body;
    const patients = getPatientsList();
    const doctors = getDoctorsList();

    // If patientId not given, try finding by name or create a new patient
    if (!patientId && patientName) {
      const existingP = patients.find(p => p.name.toLowerCase() === patientName.toLowerCase());
      if (existingP) {
        patientId = existingP.id;
      } else {
        let maxPId = 100;
        patients.forEach(p => { if (p.id > maxPId) maxPId = p.id; });
        patientId = maxPId + 1;
        const pLines = readFileLines(PATIENTS_FILE);
        pLines.push(`${patientId}|${patientName}|30|Unspecified|0000000000|APPOINTMENT_CONFIRMED|-1`);
        writeLines(PATIENTS_FILE, pLines);
      }
    } else if (!patientId) {
      patientId = patients.length > 0 ? patients[0].id : 101;
    }

    // If doctorId not given, try finding by name or pick first / create
    if (!doctorId && doctorName) {
      const existingD = doctors.find(d => d.name.toLowerCase() === doctorName.toLowerCase());
      if (existingD) {
        doctorId = existingD.id;
      } else {
        let maxDId = 200;
        doctors.forEach(d => { if (d.id > maxDId) maxDId = d.id; });
        doctorId = maxDId + 1;
        const dLines = readFileLines(DOCTORS_FILE);
        dLines.push(`${doctorId}|${doctorName}|General Physician|1`);
        writeLines(DOCTORS_FILE, dLines);
      }
    } else if (!doctorId) {
      doctorId = doctors.length > 0 ? doctors[0].id : 201;
    }

    const lines = readFileLines(APPOINTMENTS_FILE);
    let maxId = 300;
    lines.forEach(line => {
      const id = parseInt(line.split('|')[0]);
      if (id > maxId) maxId = id;
    });
    const newId = maxId + 1;

    const newLine = `${newId}|${patientId}|${doctorId}|${date}|${time}|BOOKED`;
    lines.push(newLine);
    writeLines(APPOINTMENTS_FILE, lines);

    // Also update patient status to APPOINTMENT_CONFIRMED if PRE_REGISTERED / PENDING_REVIEW
    const pLines = readFileLines(PATIENTS_FILE);
    let pUpdated = false;
    const updatedPLines = pLines.map(l => {
      const parts = l.split('|');
      if (parseInt(parts[0]) === patientId) {
        if (parts[5] === 'PRE_REGISTERED' || parts[5] === 'PENDING_REVIEW') {
          parts[5] = 'APPOINTMENT_CONFIRMED';
          pUpdated = true;
        }
        return parts.join('|');
      }
      return l;
    });
    if (pUpdated) writeLines(PATIENTS_FILE, updatedPLines);

    const matchedP = getPatientsList().find(p => p.id === patientId);
    const matchedD = getDoctorsList().find(d => d.id === doctorId);

    res.json({
      id: newId,
      patientId,
      doctorId,
      patientName: matchedP ? matchedP.name : (patientName || `Patient #${patientId}`),
      doctorName: matchedD ? matchedD.name : (doctorName || `Doctor #${doctorId}`),
      date,
      time,
      status: 'BOOKED'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/appointments/:id/cancel', (req, res) => {
  try {
    const apptId = parseInt(req.params.id);
    const lines = readFileLines(APPOINTMENTS_FILE);
    const updated = lines.map(line => {
      const parts = line.split('|');
      if (parseInt(parts[0]) === apptId) {
        parts[5] = 'CANCELLED';
      }
      return parts.join('|');
    });
    writeLines(APPOINTMENTS_FILE, updated);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Beds API ---
// Format: bedId|type|occupied|patientId
app.get('/api/beds', (req, res) => {
  try {
    const lines = readFileLines(BEDS_FILE);
    const beds = lines.map(line => {
      const parts = line.split('|');
      return {
        id: parseInt(parts[0]) || 0,
        type: parts[1] || 'General',
        occupied: parts[2] === '1' || parts[2] === 'true',
        patientId: parts[3] === '-1' || !parts[3] ? null : parseInt(parts[3])
      };
    }).filter(b => b.id > 0);
    res.json(beds);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/beds/toggle', (req, res) => {
  try {
    const { bedId, patientId = null } = req.body;
    const bedsLines = readFileLines(BEDS_FILE);
    let targetPatientId = patientId;
    let isNowOccupied = false;

    const updatedBeds = bedsLines.map(line => {
      const parts = line.split('|');
      const id = parseInt(parts[0]);
      if (id === bedId) {
        const isOcc = parts[2] === '1' || parts[2] === 'true';
        isNowOccupied = !isOcc;
        const nextOcc = isNowOccupied ? '1' : '0';
        if (!isNowOccupied) {
          targetPatientId = parts[3] === '-1' ? null : parseInt(parts[3]);
        }
        const nextPat = isNowOccupied ? (targetPatientId ? targetPatientId : 101) : -1;
        return `${parts[0]}|${parts[1]}|${nextOcc}|${nextPat}`;
      }
      return line;
    });
    writeLines(BEDS_FILE, updatedBeds);

    // Sync with patients.txt
    const patientLines = readFileLines(PATIENTS_FILE);
    const updatedPatients = patientLines.map(line => {
      const parts = line.split('|');
      const pId = parseInt(parts[0]);
      if (isNowOccupied && targetPatientId && pId === targetPatientId) {
        parts[5] = 'ADMITTED';
        parts[6] = String(bedId);
        return parts.join('|');
      } else if (!isNowOccupied && parts[6] === String(bedId)) {
        parts[6] = '-1';
        return parts.join('|');
      }
      return line;
    });
    writeLines(PATIENTS_FILE, updatedPatients);

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Billing API ---
// Format: billId|patientId|bedCharges|treatmentCharges|totalAmount|isPaid
app.get('/api/billing', (req, res) => {
  try {
    const patients = getPatientsList();
    const patientMap = new Map(patients.map(p => [p.id, p.name]));
    const lines = readFileLines(BILLING_FILE);
    
    const bills = lines.map(line => {
      const parts = line.split('|');
      const pId = parseInt(parts[1]) || 0;
      const bedC = parseFloat(parts[2]) || 0;
      const treatC = parseFloat(parts[3]) || 0;
      const totalC = parseFloat(parts[4]) || (bedC + treatC);
      const paid = parts[5] === '1' || parts[5] === 'true';

      return {
        id: parseInt(parts[0]) || 0,
        patientId: pId,
        patientName: patientMap.get(pId) || `Patient #${pId}`,
        bedCharges: bedC,
        treatmentCharges: treatC,
        amount: totalC,
        status: paid ? 'PAID' : 'PENDING'
      };
    }).filter(b => b.id > 0);

    res.json(bills);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/billing', (req, res) => {
  try {
    const { patientId, bedCharges = 250, treatmentCharges = 150, isPaid = true } = req.body;
    const lines = readFileLines(BILLING_FILE);
    
    let maxId = 700;
    lines.forEach(line => {
      const id = parseInt(line.split('|')[0]);
      if (id > maxId) maxId = id;
    });
    const newBillId = maxId + 1;
    const total = parseFloat(bedCharges) + parseFloat(treatmentCharges);
    const paidVal = isPaid ? '1' : '0';

    const newLine = `${newBillId}|${patientId}|${bedCharges.toFixed(2)}|${treatmentCharges.toFixed(2)}|${total.toFixed(2)}|${paidVal}`;
    lines.push(newLine);
    writeLines(BILLING_FILE, lines);

    const patient = getPatientsList().find(p => p.id === parseInt(patientId));
    res.json({
      id: newBillId,
      patientId: parseInt(patientId),
      patientName: patient ? patient.name : `Patient #${patientId}`,
      bedCharges,
      treatmentCharges,
      amount: total,
      status: isPaid ? 'PAID' : 'PENDING'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/billing/:id/pay', (req, res) => {
  try {
    const billId = parseInt(req.params.id);
    const lines = readFileLines(BILLING_FILE);
    const updated = lines.map(line => {
      const parts = line.split('|');
      if (parseInt(parts[0]) === billId) {
        parts[5] = '1';
      }
      return parts.join('|');
    });
    writeLines(BILLING_FILE, updated);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Hospital Bridge API running on http://localhost:${PORT}`);
});
