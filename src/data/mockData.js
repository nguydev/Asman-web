// Mock domain data for the fleet dashboard.

export const fleets = [{
  id: 'f1',
  name: 'Dhaka Metro Fleet',
  owner: 'Karim Owner',
  vehicles: 24,
  drivers: 20,
  city: 'Dhaka',
  status: 'active'
}, {
  id: 'f2',
  name: 'Chittagong Cargo',
  owner: 'Rahim Trans',
  vehicles: 15,
  drivers: 13,
  city: 'Chittagong',
  status: 'active'
}, {
  id: 'f3',
  name: 'Sylhet Express',
  owner: 'Nadia Logistics',
  vehicles: 9,
  drivers: 8,
  city: 'Sylhet',
  status: 'inactive'
}];
export const vehicles = [{
  id: 'v1',
  fleetId: 'f1',
  plate: 'DHK-1023',
  model: 'Tata LPT',
  status: 'on_trip',
  driver: 'Jamal Uddin'
}, {
  id: 'v2',
  fleetId: 'f1',
  plate: 'DHK-2288',
  model: 'Ashok Leyland',
  status: 'idle',
  driver: 'Sohel Rana'
}, {
  id: 'v3',
  fleetId: 'f1',
  plate: 'DHK-4510',
  model: 'Isuzu NPR',
  status: 'maintenance',
  driver: '—'
}, {
  id: 'v4',
  fleetId: 'f2',
  plate: 'CTG-7781',
  model: 'Hino 300',
  status: 'on_trip',
  driver: 'Babul Mia'
}];
export const drivers = [{
  id: 'd1',
  fleetId: 'f1',
  name: 'Jamal Uddin',
  license: 'DL-99213',
  phone: '01711-000001',
  status: 'on_trip'
}, {
  id: 'd2',
  fleetId: 'f1',
  name: 'Sohel Rana',
  license: 'DL-88120',
  phone: '01711-000002',
  status: 'available'
}, {
  id: 'd3',
  fleetId: 'f1',
  name: 'Rasel Khan',
  license: 'DL-77341',
  phone: '01711-000003',
  status: 'off_duty'
}, {
  id: 'd4',
  fleetId: 'f2',
  name: 'Babul Mia',
  license: 'DL-66512',
  phone: '01711-000004',
  status: 'on_trip'
}];

// Richer driver records for the Driver Directory page (fleet owner view).
export const driverDirectory = [{
  id: 'dd1',
  name: 'Marcus Chen',
  employeeId: 'ASM-8821',
  photo: '/driver-marcus.jpg',
  licenseStatus: 'valid',
  riskLevel: 'low',
  dispatches: 1422,
  joinedDate: 'Mar 3, 2020',
  email: 'm.chen@asman.org',
  licenseNumber: 'TX-1188-KL',
  licenseExpiration: 'May 2, 2027'
}, {
  id: 'dd2',
  name: 'Elena Rodriguez',
  employeeId: 'ASM-9042',
  photo: '/driver-elena.jpg',
  licenseStatus: 'expiring',
  riskLevel: 'high',
  dispatches: 894,
  joinedDate: 'Jan 12, 2021',
  email: 'e.rodriguez@asman.org',
  licenseNumber: 'TX-8821-ZM',
  licenseExpiration: 'Oct 14, 2026'
}, {
  id: 'dd3',
  name: 'James Wilson',
  employeeId: 'ASM-7712',
  photo: '/driver-james.jpg',
  licenseStatus: 'pending',
  riskLevel: 'med',
  dispatches: 312,
  joinedDate: 'Jul 21, 2023',
  email: 'j.wilson@asman.org',
  licenseNumber: 'TX-7712-QN',
  licenseExpiration: 'Feb 9, 2028'
}, {
  id: 'dd4',
  name: 'Sarah Jenkins',
  employeeId: 'ASM-4451',
  photo: '/driver-sarah.jpg',
  licenseStatus: 'valid',
  riskLevel: 'low',
  dispatches: 2104,
  joinedDate: 'Sep 18, 2018',
  email: 's.jenkins@asman.org',
  licenseNumber: 'TX-4451-BR',
  licenseExpiration: 'Dec 30, 2026'
}, {
  id: 'dd5',
  name: 'Robert Kim',
  employeeId: 'ASM-5530',
  photo: '/driver-robert.jpg',
  licenseStatus: 'valid',
  riskLevel: 'low',
  dispatches: 3187,
  joinedDate: 'Apr 8, 2016',
  email: 'r.kim@asman.org',
  licenseNumber: 'TX-5530-HD',
  licenseExpiration: 'Aug 21, 2027'
}];

// Live-tracked vehicle units for the Live Map page.
export const activeUnits = [{
  id: 'u402',
  unitNumber: '402',
  driverName: 'Marcus Chen',
  photo: '/driver-marcus.jpg',
  status: 'moving',
  metricLabel: 'Efficiency',
  sparkline: [4, 7, 5, 8, 6, 9],
  rightLabel: 'Arrival',
  rightValue: '14:20 PM',
  licenseClass: 'Class A CDL',
  licenseId: '#TX-94210',
  rating: 4.92,
  trips: '1.2k',
  routeProgress: 64,
  origin: 'Dallas, TX',
  destination: 'Phoenix, AZ',
  coords: {
    lat: 32.4487,
    lng: -99.7331
  },
  hos: {
    driveTime: '03:42',
    dutyLeft: '07:18'
  },
  vehicle: {
    model: 'Freightliner Cascadia · 2024 Model',
    role: 'Senior Fleet Associate',
    idNumber: '#ID-99210',
    totalMilesMTD: '12,482 mi',
    onTimeRate: '99.4%',
    currentLocation: 'Interstate 20, Abilene, TX',
    originDep: 'Dep: Aug 24, 08:30 AM',
    destinationEta: 'ETA: Aug 25, 09:15 PM'
  }
}, {
  id: 'u119',
  unitNumber: '119',
  driverName: 'Sarah Jenkins',
  photo: '/driver-sarah.jpg',
  status: 'idle',
  metricLabel: 'Fuel Level',
  fuelLevel: 18,
  rightLabel: 'Status',
  rightValue: 'Refuel Req',
  licenseClass: 'Class B CDL',
  licenseId: '#TX-55871',
  rating: 4.78,
  trips: '860',
  routeProgress: 12,
  origin: 'Austin, TX',
  destination: 'Houston, TX',
  coords: {
    lat: 30.2672,
    lng: -97.7431
  },
  hos: {
    driveTime: '01:05',
    dutyLeft: '09:40'
  },
  vehicle: {
    model: 'Kenworth T680 · 2023 Model',
    role: 'Fleet Associate',
    idNumber: '#ID-55871',
    totalMilesMTD: '6,204 mi',
    onTimeRate: '96.1%',
    currentLocation: 'Depot Yard, Austin, TX',
    originDep: 'Dep: —',
    destinationEta: 'ETA: —'
  }
}, {
  id: 'u284',
  unitNumber: '284',
  driverName: 'Robert Doe',
  photo: '/driver-robert.jpg',
  status: 'delayed',
  metricLabel: 'Latency',
  sparkline: [7, 3, 8, 2, 9, 4],
  rightLabel: 'ETA Offset',
  rightValue: '+45m',
  licenseClass: 'Class A CDL',
  licenseId: '#TX-77213',
  rating: 4.55,
  trips: '2.3k',
  routeProgress: 38,
  origin: 'El Paso, TX',
  destination: 'Tucson, AZ',
  coords: {
    lat: 32.3199,
    lng: -106.7637
  },
  hos: {
    driveTime: '05:12',
    dutyLeft: '02:50'
  },
  vehicle: {
    model: 'Peterbilt 579 · 2022 Model',
    role: 'Senior Fleet Associate',
    idNumber: '#ID-77213',
    totalMilesMTD: '15,930 mi',
    onTimeRate: '91.8%',
    currentLocation: 'Interstate 10, Las Cruces, NM',
    originDep: 'Dep: Aug 23, 06:15 AM',
    destinationEta: 'ETA: Aug 24, 11:00 PM (Delayed)'
  }
}];

// Institutional fleet partners for the Company Directory page (Super Admin).
// `parentOrgId` links a sub-fleet to the parent organization whose
// subscription it shares — sub-fleets don't carry their own `subscription`
// value, they inherit the parent's plan/billing (one subscription per org).
export const fleetPartners = [{
  id: 'fp1',
  name: 'Atlas Transcontinental',
  iconTone: 'blue',
  icon: 'send',
  activeDrivers: '842 Units',
  subscription: 'Enterprise',
  parentOrgId: null,
  safetyStatus: 'compliant',
  monthlyRev: '$142,500',
  fleetIdCode: '#ATC-992-G',
  fleetSize: '1,250 Vehicles',
  activeRoutes: '342 Global',
  managers: '12 Active'
}, {
  id: 'fp1-sw',
  name: 'Atlas Transcontinental — Southwest Division',
  iconTone: 'blue',
  icon: 'send',
  activeDrivers: '210 Units',
  subscription: null,
  parentOrgId: 'fp1',
  safetyStatus: 'compliant',
  monthlyRev: '—',
  fleetIdCode: '#ATC-992-G-SW',
  fleetSize: '318 Vehicles',
  activeRoutes: '64 Regional',
  managers: '3 Active'
}, {
  id: 'fp2',
  name: 'Nexus Global Fleet',
  iconTone: 'dark',
  icon: 'sync',
  activeDrivers: '1,120 Units',
  subscription: 'Enterprise',
  parentOrgId: null,
  safetyStatus: 'compliant',
  monthlyRev: '$210,800',
  fleetIdCode: '#NGF-441-K',
  fleetSize: '1,680 Vehicles',
  activeRoutes: '410 Global',
  managers: '18 Active'
}, {
  id: 'fp2-eu',
  name: 'Nexus Global Fleet — European Division',
  iconTone: 'dark',
  icon: 'sync',
  activeDrivers: '265 Units',
  subscription: null,
  parentOrgId: 'fp2',
  safetyStatus: 'compliant',
  monthlyRev: '—',
  fleetIdCode: '#NGF-441-K-EU',
  fleetSize: '390 Vehicles',
  activeRoutes: '58 Regional',
  managers: '4 Active'
}, {
  id: 'fp3',
  name: 'SwiftLogistics Co.',
  iconTone: 'red',
  icon: 'send',
  activeDrivers: '45 Units',
  subscription: 'Basic',
  parentOrgId: null,
  safetyStatus: 'non_compliant',
  safetyNote: 'Frequent High-Risk Zone Entry',
  monthlyRev: '$12,400',
  fleetIdCode: '#SLC-118-B',
  fleetSize: '52 Vehicles',
  activeRoutes: '9 Regional',
  managers: '2 Active'
}];

// Platform-wide driver oversight for Super Admin (distinct from a fleet
// owner's own driverDirectory, which is scoped to their fleet).
export const adminDrivers = [{
  id: 'ad1',
  name: 'Carlos Rodriguez',
  photo: '/driver-marcus.jpg',
  fleetIdCode: '2901-A',
  cdlNumber: 'TX-5512993',
  cdlClass: 'Class A',
  location: 'San Antonio, TX',
  status: 'active',
  route: 'I-10 Westbound',
  routeFull: 'I-10 Westbound (San Antonio → El Paso)',
  experience: '12 Years',
  licenseExpiration: 'Mar 2026',
  emergencyContact: {
    name: 'Maria Rodriguez',
    relation: 'Spouse',
    phone: '+1 (512) 555-0199'
  },
  documents: [{
    id: 'd1',
    label: 'CDL Front',
    verified: true
  }, {
    id: 'd2',
    label: 'Passport/LPR',
    verified: true
  }, {
    id: 'd3',
    label: 'Medical Card',
    verified: true
  }]
}, {
  id: 'ad2',
  name: 'Elena Vlasov',
  photo: '/driver-elena.jpg',
  fleetIdCode: '4410-U',
  cdlNumber: 'NY-9912042',
  cdlClass: 'Class A',
  location: 'Syracuse, NY',
  status: 'active',
  route: 'I-81 Northbound',
  routeFull: 'I-81 Northbound (Syracuse → Watertown)',
  experience: '7 Years',
  licenseExpiration: 'Nov 2025',
  emergencyContact: {
    name: 'Ivan Vlasov',
    relation: 'Brother',
    phone: '+1 (315) 555-0142'
  },
  documents: [{
    id: 'd1',
    label: 'CDL Front',
    verified: true
  }, {
    id: 'd2',
    label: 'Passport/LPR',
    verified: true
  }, {
    id: 'd3',
    label: 'Medical Card',
    verified: false
  }]
}, {
  id: 'ad3',
  name: 'Marcus Thorne',
  photo: '/driver-james.jpg',
  fleetIdCode: '1002-Z',
  cdlNumber: 'FL-8821034',
  cdlClass: 'Class B',
  location: 'Jacksonville, FL',
  status: 'alert',
  alertNote: 'Alert: Proximity',
  route: 'I-95 Southbound',
  routeFull: 'I-95 Southbound (Jacksonville → Miami)',
  experience: '4 Years',
  licenseExpiration: 'Jul 2026',
  emergencyContact: {
    name: 'Diane Thorne',
    relation: 'Spouse',
    phone: '+1 (904) 555-0177'
  },
  documents: [{
    id: 'd1',
    label: 'CDL Front',
    verified: true
  }, {
    id: 'd2',
    label: 'Passport/LPR',
    verified: false
  }, {
    id: 'd3',
    label: 'Medical Card',
    verified: true
  }]
}];

// Attorney Network Administration roster — demo/fallback when API has no import data.
export const attorneyAdmin = [
  {
    id: 'ca1',
    name: 'Elena Rodriguez',
    photo: '/attorney-eleanor.jpg',
    avatarUrl: '/attorney-eleanor.jpg',
    firm: 'Halloway & Associates',
    specialties: ['Immigration Law', 'Civil Rights', 'Habeas Corpus'],
    federalCircuit: '2nd',
    states: ['NY', 'CA', 'TX', 'FL'],
    courts: ['SDNY', 'EDNY', '2nd Cir.'],
    winRate: 94.2,
    cases: 2140,
    remoteTotalCases: 2140,
    remoteWonCases: 2016,
    remoteLostCases: 78,
    remotePendingCases: 46,
    remoteWinRate: 0.942,
    languages: ['English', 'Spanish'],
    languageProficiencies: ['English', 'Spanish'],
    contactBadge: 'Habeas Corpus Point of Contact',
    email: 'elena.hc@aetheric.com',
    phone: '+1 (555) 012-9844',
    barLicenseNumber: 'NY-882910',
    yearsOfExperience: 14,
    licenseStatus: 'valid',
    licensedIn: ['NY', 'CA', 'TX', 'FL'],
    multiStateCertified: true,
    caseVolume: { total: 2140, general: 1480, internal: 660 },
    habeasWinRate: 94.2,
    officeLocation: ['500 Fifth Avenue, Suite 4500', 'New York, NY 10110'],
    address: { city: 'New York', latitude: 40.7549, longitude: -73.984 },
    detailSpecialties: [
      { icon: 'shield', label: 'Immigration Law' },
      { icon: 'briefcase', label: 'Civil Rights' },
      { icon: 'building', label: 'Corporate Compliance' },
    ],
    about:
      'Elena Rodriguez is a distinguished legal strategist specializing in high-stakes immigration safety and habeas corpus litigation across federal courts.',
    bio: [
      'Elena Rodriguez is a distinguished legal strategist specializing in high-stakes immigration safety and international corporate compliance.',
      'As lead counsel on the ASMAN platform, she manages cross-border regulatory logistics for Fortune 500 companies.',
    ],
    verified: true,
  },
  {
    id: 'ca2',
    name: 'Marcus Thorne',
    photo: '/attorney-david.jpg',
    avatarUrl: '/attorney-david.jpg',
    firm: 'Thorne Legal Group',
    specialties: ['Federal Litigation', 'Enforcement Defense', 'Appeals'],
    federalCircuit: '11th',
    states: ['FL', 'GA'],
    courts: ['SDFL', 'MDFL', '11th Cir.'],
    winRate: 91.0,
    cases: 1684,
    remoteTotalCases: 1684,
    remoteWonCases: 1532,
    remoteLostCases: 96,
    remotePendingCases: 56,
    remoteWinRate: 0.91,
    languages: ['English', 'French'],
    languageProficiencies: ['English', 'French'],
    contactBadge: 'Federal Litigation Contact',
    email: 'm.thorne@aetheric.com',
    phone: '+1 (555) 033-7712',
    barLicenseNumber: 'FL-771209',
    yearsOfExperience: 18,
    licenseStatus: 'valid',
    licensedIn: ['FL', 'GA'],
    multiStateCertified: true,
    caseVolume: { total: 1684, general: 1210, internal: 474 },
    habeasWinRate: 91.0,
    officeLocation: ['200 S Biscayne Blvd, Suite 1400', 'Miami, FL 33131'],
    address: { city: 'Miami', latitude: 25.7617, longitude: -80.1918 },
    detailSpecialties: [
      { icon: 'briefcase', label: 'Federal Litigation' },
      { icon: 'shield', label: 'Enforcement Defense' },
      { icon: 'file', label: 'Appeals' },
    ],
    about:
      'Marcus Thorne leads federal litigation strategy for enforcement-related cases across the Southeast region.',
    bio: [
      'Marcus Thorne leads federal litigation strategy for enforcement-related cases across the Southeast region.',
      'He has represented institutional clients before federal appellate courts.',
    ],
    verified: true,
  },
  {
    id: 'ca3',
    name: 'Sarah Jenkins',
    photo: '/driver-amara.jpg',
    avatarUrl: '/driver-amara.jpg',
    firm: 'Jenkins & Wu LLP',
    specialties: ['International Fleet', 'Cross-Border Policy', 'Safety Audit'],
    federalCircuit: '—',
    states: ['UK', 'EU'],
    courts: ['High Court', 'Court of Appeal'],
    winRate: 78.4,
    cases: 612,
    remoteTotalCases: 612,
    remoteWonCases: 480,
    remoteLostCases: 88,
    remotePendingCases: 44,
    remoteWinRate: 0.784,
    languages: ['English', 'Mandarin'],
    languageProficiencies: ['English', 'Mandarin'],
    contactBadge: 'International Fleet Point of Contact',
    email: 's.jenkins@aetheric.com',
    phone: '+44 20 7946 0958',
    barLicenseNumber: 'UK-119284',
    yearsOfExperience: 9,
    licenseStatus: 'valid',
    licensedIn: ['UK', 'EU'],
    multiStateCertified: false,
    caseVolume: { total: 612, general: 430, internal: 182 },
    habeasWinRate: 78.4,
    officeLocation: ['1 Canada Square', 'London E14 5AB, UK'],
    address: { city: 'London', latitude: 51.5048, longitude: -0.0195 },
    detailSpecialties: [
      { icon: 'truck', label: 'International Fleet' },
      { icon: 'shield', label: 'Safety Audit' },
      { icon: 'file', label: 'Cross-Border Policy' },
    ],
    about:
      'Sarah Jenkins leads international fleet compliance across UK and EU jurisdictions.',
    bio: [
      'Sarah Jenkins leads international fleet compliance across UK and EU jurisdictions.',
      'Her caseload skews toward growing international partnerships.',
    ],
    verified: true,
  },
  {
    id: 'ca4',
    name: 'David Chen',
    photo: '/attorney-julian.jpg',
    avatarUrl: '/attorney-julian.jpg',
    firm: 'Pacific Rim Counsel',
    specialties: ['Federal Regulations', 'Corporate Compliance', 'Policy Review'],
    federalCircuit: '9th',
    states: ['CA', 'WA'],
    courts: ['NDCA', 'CDCA', '9th Cir.'],
    winRate: 89.6,
    cases: 1328,
    remoteTotalCases: 1328,
    remoteWonCases: 1190,
    remoteLostCases: 86,
    remotePendingCases: 52,
    remoteWinRate: 0.896,
    languages: ['English', 'Mandarin', 'Cantonese'],
    languageProficiencies: ['English', 'Mandarin', 'Cantonese'],
    contactBadge: 'Regulatory Affairs Lead',
    email: 'd.chen@aetheric.com',
    phone: '+1 (555) 044-7712',
    barLicenseNumber: 'CA-220981',
    yearsOfExperience: 16,
    licenseStatus: 'valid',
    licensedIn: ['CA', 'WA'],
    multiStateCertified: true,
    caseVolume: { total: 1328, general: 920, internal: 408 },
    habeasWinRate: 89.6,
    officeLocation: ['1 Market Street, Suite 3600', 'San Francisco, CA 94105'],
    address: { city: 'San Francisco', latitude: 37.7936, longitude: -122.395 },
    detailSpecialties: [
      { icon: 'briefcase', label: 'Federal Regulations' },
      { icon: 'building', label: 'Corporate Compliance' },
      { icon: 'file', label: 'Policy Review' },
    ],
    about:
      'David Chen focuses on federal regulatory compliance for Pacific Rim trade and logistics operations.',
    bio: [
      'David Chen focuses on federal regulatory compliance for Pacific Rim trade and logistics operations.',
      'He regularly advises on cross-border policy for West Coast ports.',
    ],
    verified: true,
  },
  {
    id: 'ca5',
    name: 'Aisha Rahman',
    photo: null,
    avatarUrl: null,
    firm: 'Rahman & Ortega',
    specialties: ['Detention Defense', 'Bond Hearings', 'Habeas Corpus'],
    federalCircuit: '5th',
    states: ['TX', 'LA'],
    courts: ['SDTX', 'WDTX', '5th Cir.'],
    winRate: 87.3,
    cases: 1890,
    remoteTotalCases: 1890,
    remoteWonCases: 1650,
    remoteLostCases: 140,
    remotePendingCases: 100,
    remoteWinRate: 0.873,
    languages: ['English', 'Spanish', 'Arabic'],
    languageProficiencies: ['English', 'Spanish', 'Arabic'],
    email: 'a.rahman@aetheric.com',
    phone: '+1 (555) 201-4488',
    barLicenseNumber: 'TX-441902',
    yearsOfExperience: 12,
    caseVolume: { total: 1890, general: 1300, internal: 590 },
    habeasWinRate: 87.3,
    officeLocation: ['1001 Fannin St, Suite 2200', 'Houston, TX 77002'],
    address: { city: 'Houston', latitude: 29.7604, longitude: -95.3698 },
    about: 'Aisha Rahman specializes in detention defense and bond hearings across the Fifth Circuit.',
    verified: true,
  },
  {
    id: 'ca6',
    name: 'James Okonkwo',
    photo: null,
    avatarUrl: null,
    firm: 'Okonkwo Immigration Counsel',
    specialties: ['Asylum', 'Withholding', 'CAT Relief'],
    federalCircuit: '7th',
    states: ['IL', 'IN', 'WI'],
    courts: ['NDIL', '7th Cir.'],
    winRate: 82.5,
    cases: 974,
    remoteTotalCases: 974,
    remoteWonCases: 804,
    remoteLostCases: 112,
    remotePendingCases: 58,
    remoteWinRate: 0.825,
    languages: ['English', 'Yoruba', 'French'],
    languageProficiencies: ['English', 'Yoruba', 'French'],
    email: 'j.okonkwo@aetheric.com',
    phone: '+1 (555) 312-9901',
    barLicenseNumber: 'IL-558201',
    yearsOfExperience: 11,
    caseVolume: { total: 974, general: 680, internal: 294 },
    habeasWinRate: 82.5,
    officeLocation: ['233 S Wacker Dr, Suite 5800', 'Chicago, IL 60606'],
    address: { city: 'Chicago', latitude: 41.8789, longitude: -87.6359 },
    about: 'James Okonkwo focuses on asylum and protection claims before the Seventh Circuit.',
    verified: true,
  },
  {
    id: 'ca7',
    name: 'Priya Mehta',
    photo: null,
    avatarUrl: null,
    firm: 'Mehta Federal Practice',
    specialties: ['Habeas Corpus', 'Post-Conviction', 'Appeals'],
    federalCircuit: '3rd',
    states: ['PA', 'NJ', 'DE'],
    courts: ['EDPA', 'DNJ', '3rd Cir.'],
    winRate: 90.1,
    cases: 1456,
    remoteTotalCases: 1456,
    remoteWonCases: 1312,
    remoteLostCases: 84,
    remotePendingCases: 60,
    remoteWinRate: 0.901,
    languages: ['English', 'Hindi', 'Gujarati'],
    languageProficiencies: ['English', 'Hindi', 'Gujarati'],
    email: 'p.mehta@aetheric.com',
    phone: '+1 (555) 215-6670',
    barLicenseNumber: 'PA-902114',
    yearsOfExperience: 15,
    caseVolume: { total: 1456, general: 1010, internal: 446 },
    habeasWinRate: 90.1,
    officeLocation: ['1735 Market St, Suite 3100', 'Philadelphia, PA 19103'],
    address: { city: 'Philadelphia', latitude: 39.9526, longitude: -75.1652 },
    about: 'Priya Mehta leads habeas and post-conviction strategy across the Third Circuit.',
    verified: true,
  },
  {
    id: 'ca8',
    name: 'Robert Hale',
    photo: null,
    avatarUrl: null,
    firm: 'Hale & Partners',
    specialties: ['ICE Enforcement', 'Stay Motions', 'Circuit Appeals'],
    federalCircuit: '4th',
    states: ['VA', 'MD', 'NC'],
    courts: ['EDVA', 'DMD', '4th Cir.'],
    winRate: 85.7,
    cases: 1102,
    remoteTotalCases: 1102,
    remoteWonCases: 944,
    remoteLostCases: 98,
    remotePendingCases: 60,
    remoteWinRate: 0.857,
    languages: ['English'],
    languageProficiencies: ['English'],
    email: 'r.hale@aetheric.com',
    phone: '+1 (555) 703-4412',
    barLicenseNumber: 'VA-330781',
    yearsOfExperience: 20,
    caseVolume: { total: 1102, general: 760, internal: 342 },
    habeasWinRate: 85.7,
    officeLocation: ['1750 Tysons Blvd, Suite 1500', 'McLean, VA 22102'],
    address: { city: 'McLean', latitude: 38.9339, longitude: -77.2111 },
    about: 'Robert Hale specializes in rapid stay motions and enforcement defense in the Fourth Circuit.',
    verified: true,
  },
  {
    id: 'ca9',
    name: 'Sofia Alvarez',
    photo: null,
    avatarUrl: null,
    firm: 'Alvarez Defense Group',
    specialties: ['Family Unity', 'Cancellation', 'Habeas Corpus'],
    federalCircuit: '9th',
    states: ['CA', 'AZ', 'NV'],
    courts: ['CDCA', 'D. Ariz.', '9th Cir.'],
    winRate: 88.9,
    cases: 1765,
    remoteTotalCases: 1765,
    remoteWonCases: 1569,
    remoteLostCases: 118,
    remotePendingCases: 78,
    remoteWinRate: 0.889,
    languages: ['English', 'Spanish'],
    languageProficiencies: ['English', 'Spanish'],
    email: 's.alvarez@aetheric.com',
    phone: '+1 (555) 213-8099',
    barLicenseNumber: 'CA-771045',
    yearsOfExperience: 13,
    caseVolume: { total: 1765, general: 1220, internal: 545 },
    habeasWinRate: 88.9,
    officeLocation: ['633 W 5th St, Suite 2600', 'Los Angeles, CA 90071'],
    address: { city: 'Los Angeles', latitude: 34.0522, longitude: -118.2437 },
    about: 'Sofia Alvarez focuses on family-unity and cancellation matters with a strong habeas practice.',
    verified: true,
  },
  {
    id: 'ca10',
    name: 'Nathan Brooks',
    photo: null,
    avatarUrl: null,
    firm: 'Brooks Circuit Counsel',
    specialties: ['Appellate Strategy', 'Habeas Corpus', 'Constitutional Claims'],
    federalCircuit: '6th',
    states: ['OH', 'MI', 'KY', 'TN'],
    courts: ['NDOH', 'EDMI', '6th Cir.'],
    winRate: 83.2,
    cases: 886,
    remoteTotalCases: 886,
    remoteWonCases: 737,
    remoteLostCases: 95,
    remotePendingCases: 54,
    remoteWinRate: 0.832,
    languages: ['English'],
    languageProficiencies: ['English'],
    email: 'n.brooks@aetheric.com',
    phone: '+1 (555) 614-2203',
    barLicenseNumber: 'OH-661290',
    yearsOfExperience: 10,
    caseVolume: { total: 886, general: 610, internal: 276 },
    habeasWinRate: 83.2,
    officeLocation: ['41 S High St, Suite 2300', 'Columbus, OH 43215'],
    address: { city: 'Columbus', latitude: 39.9612, longitude: -82.9988 },
    about: 'Nathan Brooks handles appellate and constitutional habeas claims across the Sixth Circuit.',
    verified: true,
  },
  {
    id: 'ca11',
    name: 'Camila Duarte',
    photo: null,
    avatarUrl: null,
    firm: 'Duarte & Singh',
    specialties: ['Bond Strategy', 'Detention Review', 'Habeas Corpus'],
    federalCircuit: '1st',
    states: ['MA', 'RI'],
    courts: ['D. Mass.', '1st Cir.'],
    winRate: 92.4,
    cases: 1218,
    remoteTotalCases: 1218,
    remoteWonCases: 1125,
    remoteLostCases: 55,
    remotePendingCases: 38,
    remoteWinRate: 0.924,
    languages: ['English', 'Portuguese', 'Spanish'],
    languageProficiencies: ['English', 'Portuguese', 'Spanish'],
    email: 'c.duarte@aetheric.com',
    phone: '+1 (555) 617-3344',
    barLicenseNumber: 'MA-448812',
    yearsOfExperience: 11,
    caseVolume: { total: 1218, general: 840, internal: 378 },
    habeasWinRate: 92.4,
    officeLocation: ['100 Federal St, Suite 1900', 'Boston, MA 02110'],
    address: { city: 'Boston', latitude: 42.3551, longitude: -71.056 },
    about: 'Camila Duarte specializes in bond strategy and detention review with high habeas win rates.',
    verified: true,
  },
  {
    id: 'ca12',
    name: 'Kevin Park',
    photo: null,
    avatarUrl: null,
    firm: 'Park National Litigation',
    specialties: ['Nationwide Litigation', 'Habeas Corpus', 'Enforcement Defense'],
    federalCircuit: 'D.C.',
    states: ['DC', 'MD', 'VA'],
    courts: ['D.D.C.', 'D.C. Cir.'],
    winRate: 86.0,
    cases: 1540,
    remoteTotalCases: 1540,
    remoteWonCases: 1324,
    remoteLostCases: 136,
    remotePendingCases: 80,
    remoteWinRate: 0.86,
    languages: ['English', 'Korean'],
    languageProficiencies: ['English', 'Korean'],
    email: 'k.park@aetheric.com',
    phone: '+1 (555) 202-7781',
    barLicenseNumber: 'DC-229001',
    yearsOfExperience: 17,
    caseVolume: { total: 1540, general: 1060, internal: 480 },
    habeasWinRate: 86.0,
    officeLocation: ['601 Massachusetts Ave NW', 'Washington, DC 20001'],
    address: { city: 'Washington', latitude: 38.9072, longitude: -77.0369 },
    about: 'Kevin Park runs nationwide enforcement-defense and habeas litigation from D.C.',
    verified: true,
  },
]
export const users = [{
  id: 'u1',
  name: 'Asman Admin',
  email: 'admin@asman.com',
  role: 'super_admin',
  fleet: '—'
}, {
  id: 'u2',
  name: 'Karim Owner',
  email: 'owner@asman.com',
  role: 'fleet_owner',
  fleet: 'Dhaka Metro Fleet'
}, {
  id: 'u3',
  name: 'Rahim Trans',
  email: 'rahim@asman.com',
  role: 'fleet_owner',
  fleet: 'Chittagong Cargo'
}];

// Richer institutional personnel records for the User Management page.
export const userDirectory = [{
  id: 'ud1',
  name: 'Elena Rodriguez',
  photo: '/driver-elena.jpg',
  email: 'e.rodriguez@asman-safety.com',
  joinedDate: 'Mar 2024',
  status: 'pending',
  role: 'Compliance Officer',
  plan: 'Enterprise',
  title: 'Compliance Officer',
  tier: 'Enterprise Level',
  phone: '+1 (555) 018-7723',
  nationality: 'American / US Citizen',
  address: '812 Elm Street, Dallas, TX',
  coords: {
    lat: 32.7767,
    lng: -96.797
  },
  vin: 'Elena18V7cde',
  licensePlate: 'TX-7723',
  emergencyContact: {
    name: 'Diego Rodriguez',
    relation: 'Spouse',
    phone: '+1 (555) 018-7724'
  },
  document: {
    name: 'Compliance Certification',
    type: 'PDF',
    size: '1.8 MB'
  }
}, {
  id: 'ud2',
  name: 'Marcus Chen',
  photo: '/driver-marcus.jpg',
  email: 'm.chen@logistics-corp.com',
  joinedDate: 'Mar 2024',
  status: 'suspended',
  role: 'Field Agent',
  plan: 'Pro',
  title: 'Field Agent',
  tier: 'Pro Level',
  phone: '+1 (555) 044-2201',
  nationality: 'American / US Citizen',
  address: '245 Bayou Road, Houston, TX',
  coords: {
    lat: 29.7604,
    lng: -95.3698
  },
  vin: 'Marcus44V2201',
  licensePlate: 'TX-4201',
  emergencyContact: {
    name: 'Amy Chen',
    relation: 'Sister',
    phone: '+1 (555) 044-2202'
  },
  document: {
    name: 'Field License',
    type: 'PDF',
    size: '2.1 MB'
  }
}, {
  id: 'ud3',
  name: 'Marco Valerius',
  photo: '/user-marco.jpg',
  email: 'marco.valerius@asman-field.eu',
  joinedDate: 'Feb 2024',
  status: 'active',
  role: 'Field Agent',
  plan: 'Enterprise',
  title: 'Field Agent',
  tier: 'Enterprise Level',
  phone: '+1 (555) 012-9482',
  nationality: 'Italian / EU Citizen',
  address: '123 Maple Street, Springfield',
  coords: {
    lat: 31.7619,
    lng: -106.485
  },
  vin: 'Julian12V2nce',
  licensePlate: 'S7777',
  emergencyContact: {
    name: 'Lucia Valerius',
    relation: 'Spouse',
    phone: '+1 (555) 012-9483'
  },
  document: {
    name: 'Field License',
    type: 'PDF',
    size: '2.4 MB'
  }
}, {
  id: 'ud4',
  name: 'Sarah Kim',
  photo: '/driver-sarah.jpg',
  email: 's.kim@asman-analytics.com',
  joinedDate: 'Jan 2024',
  status: 'active',
  role: 'Analyst',
  plan: 'Standard',
  title: 'Data Analyst',
  tier: 'Standard Level',
  phone: '+1 (555) 077-3390',
  nationality: 'American / US Citizen',
  address: '58 Congress Avenue, Austin, TX',
  coords: {
    lat: 30.2672,
    lng: -97.7431
  },
  vin: 'Sarah07V3390',
  licensePlate: 'TX-3390',
  emergencyContact: {
    name: 'James Kim',
    relation: 'Brother',
    phone: '+1 (555) 077-3391'
  },
  document: {
    name: 'Background Check',
    type: 'PDF',
    size: '900 KB'
  }
}, {
  id: 'ud5',
  name: 'David Osei',
  photo: '/driver-diego.jpg',
  email: 'd.osei@asman-field.com',
  joinedDate: 'Dec 2023',
  status: 'pending',
  role: 'Field Agent',
  plan: 'Pro',
  title: 'Field Agent',
  tier: 'Pro Level',
  phone: '+1 (555) 099-4471',
  nationality: 'Ghanaian / US Resident',
  address: '19 Alamo Plaza, San Antonio, TX',
  coords: {
    lat: 29.4241,
    lng: -98.4936
  },
  vin: 'David09V4471',
  licensePlate: 'TX-4471',
  emergencyContact: {
    name: 'Ama Osei',
    relation: 'Spouse',
    phone: '+1 (555) 099-4472'
  },
  document: {
    name: 'Field License',
    type: 'PDF',
    size: '2.0 MB'
  }
}];

// Helpers scoped to a fleet (used by the Fleet Owner views).
export const vehiclesByFleet = fleetId => vehicles.filter(v => v.fleetId === fleetId);
export const driversByFleet = fleetId => drivers.filter(d => d.fleetId === fleetId);
export const fleetById = fleetId => fleets.find(f => f.id === fleetId);

// Legal case oversight roster for the Super Admin Case Tracker page.
// Each case links to a real driverDirectory record via `driverId` — this is
// the single source of truth for driver identity, so a case's status is
// always in sync with what shows on that driver's profile (no duplicated,
// driftable copy of the driver's name/photo).
export const legalCases = [{
  id: 'ASM-88219',
  driverId: 'dd7',
  stage: 'filed',
  lifecycleStatus: 'active',
  court: 'Federal District 9',
  hearingDate: 'Oct 12, 2023',
  jurisdiction: 'US-TX South Border Sector',
  overview: 'High-stakes detention appeal involving a logistics safety bond of $250,000. The case involves an expedited judicial review for a critical fleet logistics personnel held at the Laredo North Port Terminal. Compliance verification requires real-time coordination between legal counsel, logistics dispatchers, and judicial oversight.',
  documents: [{
    id: 'doc1',
    name: 'Detention_Report_v2.pdf',
    type: 'pdf',
    date: 'Oct 12',
    size: '2.4 MB'
  }, {
    id: 'doc2',
    name: 'Evidence_Photo_Log.zip',
    type: 'zip',
    date: 'Oct 10',
    size: '48.1 MB'
  }, {
    id: 'doc3',
    name: 'Safety_Bond_Certification.docx',
    type: 'doc',
    date: 'Oct 05',
    size: '1.1 MB'
  }, {
    id: 'doc4',
    name: 'Driver_Statement.pdf',
    type: 'pdf',
    date: 'Oct 03',
    size: '640 KB'
  }, {
    id: 'doc5',
    name: 'Court_Filing_Receipt.pdf',
    type: 'pdf',
    date: 'Oct 01',
    size: '210 KB'
  }],
  timeline: [{
    id: 't1',
    date: 'Oct 01, 2023',
    status: 'active',
    summary: 'High-stakes detention appeal involving a logistics safety bond of $250,000. The case involves an expedited judicial review for a critical fleet logistics personnel held at the Laredo North Port Terminal. Compliance verification requires real-time coordination between legal counsel, logistics dispatchers, and judicial oversight.'
  }],
  // Attorney info is internal to the Super Admin (client team) view only —
  // fleet managers never see this per the offline-attorney-handling model.
  attorney: {
    name: 'Elena Vance, Esq.',
    photo: '/attorney-eleanor.jpg',
    firm: 'Vance & Partners Legal',
    barLicenseNumber: 'TX-9011-B',
    phone: '+1 (555) 901-4432'
  }
}, {
  id: 'ASM-90114',
  driverId: 'dd4',
  stage: 'pending',
  lifecycleStatus: 'completed',
  court: 'Laredo North Port',
  hearingDate: 'Oct 24, 2023',
  jurisdiction: 'US-TX Laredo Port of Entry',
  overview: 'Routine safety-compliance review escalated after a checkpoint inspection flagged an expired cargo manifest. Counsel is petitioning for an expedited administrative hearing to avoid extended cargo detention and downstream delivery penalties.',
  documents: [{
    id: 'doc1',
    name: 'Manifest_Discrepancy.pdf',
    type: 'pdf',
    date: 'Oct 20',
    size: '1.3 MB'
  }, {
    id: 'doc2',
    name: 'Checkpoint_Log.pdf',
    type: 'pdf',
    date: 'Oct 18',
    size: '780 KB'
  }, {
    id: 'doc3',
    name: 'Cargo_Inspection_Photos.zip',
    type: 'zip',
    date: 'Oct 18',
    size: '22.6 MB'
  }],
  timeline: [{
    id: 't1',
    date: 'Oct 18, 2023',
    status: 'completed',
    summary: 'Routine safety-compliance review escalated after a checkpoint inspection flagged an expired cargo manifest. Counsel is petitioning for an expedited administrative hearing to avoid extended cargo detention and downstream delivery penalties.'
  }],
  attorney: {
    name: 'Julius Wright',
    photo: '/attorney-david.jpg',
    firm: 'Wright Border Counsel',
    barLicenseNumber: 'TX-4471-C',
    phone: '+1 (555) 224-7790'
  }
}, {
  id: 'ASM-77301',
  driverId: 'dd3',
  stage: 'decision',
  lifecycleStatus: 'failed',
  court: 'El Paso Central',
  hearingDate: 'Oct 15, 2023',
  jurisdiction: 'US-TX El Paso Sector',
  overview: 'Final ruling pending on a contested enforcement stop that resulted in a multi-day vehicle impoundment. Counsel has submitted closing arguments and is awaiting the presiding judge’s written decision.',
  documents: [{
    id: 'doc1',
    name: 'Closing_Argument_Brief.pdf',
    type: 'pdf',
    date: 'Oct 14',
    size: '3.0 MB'
  }, {
    id: 'doc2',
    name: 'Impoundment_Record.pdf',
    type: 'pdf',
    date: 'Oct 08',
    size: '900 KB'
  }],
  timeline: [{
    id: 't1',
    date: 'Oct 08, 2023',
    status: 'failed',
    summary: 'Final ruling pending on a contested enforcement stop that resulted in a multi-day vehicle impoundment. Counsel has submitted closing arguments and is awaiting the presiding judge’s written decision.'
  }],
  attorney: {
    name: 'Elena Vance, Esq.',
    photo: '/attorney-eleanor.jpg',
    firm: 'Vance & Partners Legal',
    barLicenseNumber: 'TX-9011-B',
    phone: '+1 (555) 901-4432'
  }
}];

// Case status for a given driver, derived live from legalCases — this is
// what "auto-sync to driver profile" means: no separate copy to fall out of
// sync, just a lookup against the same records the Case Tracker reads.
export const caseStatusForDriver = driverId => legalCases.filter(c => c.driverId === driverId);

// Generate procedural dummy cases to match overview stats
const generateCases = (count, status, startId) => {
  const newCases = [];
  const drivers = ['dd7', 'dd4', 'dd3', 'dd1', 'dd2'];
  const attorneys = [{
    name: 'Elena Vance, Esq.',
    photo: '/attorney-david.jpg',
    firm: 'Vance & Partners Legal'
  }, {
    name: 'Julius Wright',
    photo: '/attorney-julian.jpg',
    firm: 'Wright Border Counsel'
  }];
  const courts = ['Federal District 9', 'Laredo North Port', 'El Paso Central', 'Houston Immigration Court', 'San Antonio Sector'];
  const jurisdictions = ['US-TX South Border Sector', 'US-TX Laredo Port of Entry', 'US-TX El Paso Sector', 'National ICE Division', 'US-TX Central Sector'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May'];
  for (let i = 0; i < count; i++) {
    const dId = drivers[i % drivers.length];
    const atty = attorneys[i % attorneys.length];
    const court = courts[Math.floor(Math.random() * courts.length)];
    const jurisdiction = jurisdictions[Math.floor(Math.random() * jurisdictions.length)];

    // Generate a random date between Jan 1, 2023 and Dec 31, 2024
    const month = months[Math.floor(Math.random() * months.length)];
    const day = Math.floor(Math.random() * 28) + 1;
    const year = Math.random() > 0.5 ? 2023 : 2024;
    const hearingDate = `${month} ${day < 10 ? '0' + day : day}, ${year}`;
    newCases.push({
      id: `ASM-${startId + i}`,
      driverId: dId,
      stage: status === 'completed' ? 'decision' : 'pending',
      lifecycleStatus: status,
      court: court,
      hearingDate: hearingDate,
      jurisdiction: jurisdiction,
      overview: 'Generated dummy case overview for statistical display.',
      documents: [],
      timeline: [{
        id: 't1',
        date: hearingDate,
        status: status,
        summary: 'Generated dummy case overview for statistical display.'
      }],
      attorney: atty
    });
  }
  return newCases;
};

// Push 149 active and 2044 completed to reach exactly 150 active and 2045 completed.
legalCases.push(...generateCases(149, 'active', 100000));
legalCases.push(...generateCases(2044, 'completed', 200000));
legalCases.push(...generateCases(49, 'failed', 300000));