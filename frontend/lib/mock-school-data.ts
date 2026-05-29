/**
 * Holy Child School ERP — Comprehensive Mock Data
 * School: Holy Child School, Lucknow — CBSE Affiliated (Est. 1985)
 * Academic Year: 2025-26
 */

import type {
  Student, StaffMember, FeeStructure, FeePayment, AttendanceRecord,
  ExamSchedule, ExamResult, LibraryBook, BookIssue, BusRoute,
  Circular, HelpDeskTicket, Homework, InventoryItem, SchoolNotification,
  Period, StudentCategory, Gender, BloodGroup, UserRole, PaymentStatus
} from '@/types/school'

// ────────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────────

const daysAgo = (n: number) => {
  const d = new Date(); d.setDate(d.getDate() - n)
  return d.toISOString().split('T')[0]
}

const randomBetween = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min

// ────────────────────────────────────────────────────────────────
// School Meta
// ────────────────────────────────────────────────────────────────

export const SCHOOL_INFO = {
  name: 'Holy Child School',
  tagline: 'Nurturing Excellence Since 1985',
  affiliation: 'CBSE Affiliated (Affiliation No: 2130547)',
  address: '14, Civil Lines, Lucknow, Uttar Pradesh — 226001',
  phone: '+91-522-2234567',
  email: 'info@holychildschool.edu.in',
  website: 'www.holychildschool.edu.in',
  principal: 'Dr. Sunita Sharma',
  founded: 1985,
  academicYear: '2025-26',
  currentTerm: 'Term 1 (Apr–Sep 2025)',
}

export const CLASSES = ['1','2','3','4','5','6','7','8','9','10','11','12']
export const SECTIONS = ['A','B','C']
export const SUBJECTS = ['Mathematics','English','Hindi','Science','Social Science','Computer Science','Physics','Chemistry','Biology','History','Geography','Economics']
export const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']

// ────────────────────────────────────────────────────────────────
// Students (50 students)
// ────────────────────────────────────────────────────────────────

const maleNames = [
  'Arjun Sharma','Rohan Verma','Vikram Singh','Aditya Kumar','Rahul Gupta',
  'Karan Patel','Siddharth Rao','Manish Tiwari','Deepak Mishra','Akash Dubey',
  'Nikhil Pandey','Prateek Joshi','Gaurav Trivedi','Ankit Srivastava','Rajesh Yadav',
  'Suresh Chandra','Rajan Shukla','Abhishek Nair','Amit Bajpai','Vishal Awasthi',
  'Priyanshu Bose','Mohit Kapoor','Sachin Tyagi','Vinay Luthra','Sandeep Malhotra',
]

const femaleNames = [
  'Priya Sharma','Anjali Verma','Pooja Singh','Sneha Kumar','Kavya Gupta',
  'Divya Patel','Ananya Rao','Riya Tiwari','Nisha Mishra','Meera Dubey',
  'Shreya Pandey','Sonal Joshi','Neha Trivedi','Aarti Srivastava','Swati Yadav',
  'Komal Chandra','Jyoti Shukla','Simran Nair','Tanvi Bajpai','Aishwarya Awasthi',
  'Pallavi Bose','Rekha Kapoor','Sunita Tyagi','Geeta Luthra','Radha Malhotra',
]

const bloodGroups: BloodGroup[] = ['A+','A-','B+','B-','AB+','AB-','O+','O-']
const categories: StudentCategory[] = ['General','OBC','SC','ST']
const religions = ['Hindu','Muslim','Christian','Sikh','Jain']

const gradeFromMarks = (obtained: number, max: number): string => {
  const pct = (obtained / max) * 100
  if (pct >= 91) return 'A1'
  if (pct >= 81) return 'A2'
  if (pct >= 71) return 'B1'
  if (pct >= 61) return 'B2'
  if (pct >= 51) return 'C1'
  if (pct >= 41) return 'C2'
  if (pct >= 33) return 'D'
  return 'E'
}

export const STUDENTS: Student[] = Array.from({ length: 50 }, (_, i) => {
  const isMale = i < 25
  const name = isMale ? maleNames[i] : femaleNames[i - 25]
  const cls = CLASSES[i % 12]
  const section = SECTIONS[Math.floor(i / 4) % 3]
  const rollNo = (i % 12) + 1
  const presentDays = randomBetween(50, 60)
  const totalDays = 62
  const paidFraction = [1, 0.5, 0.75, 0, 1][i % 5]
  const feeTotal = [45000, 52000, 60000, 68000][Math.floor(Number(cls) / 4)] || 45000
  const paid = Math.round(feeTotal * paidFraction)
  const due = feeTotal - paid
  const status: PaymentStatus = due === 0 ? 'Paid' : paid > 0 ? 'Partial' : 'Due'

  return {
    id: `STU${String(i + 1).padStart(3, '0')}`,
    admissionNo: `HCS/2024/${String(2001 + i).padStart(4, '0')}`,
    rollNo,
    name,
    class: cls,
    section,
    gender: isMale ? 'Male' : 'Female',
    dob: `${2010 - Number(cls)}-${String((i % 12) + 1).padStart(2,'0')}-${String((i % 28) + 1).padStart(2,'0')}`,
    age: Number(cls) + 6,
    bloodGroup: bloodGroups[i % 8],
    category: categories[i % 4],
    religion: religions[i % 5],
    motherTongue: 'Hindi',
    aadhar: `XXXX XXXX ${String(4000 + i).padStart(4,'0')}`,
    address: `${10 + i}, ${['Rajaji Puram','Aliganj','Gomti Nagar','Indira Nagar','Vikas Nagar'][i % 5]}`,
    city: 'Lucknow',
    pincode: `2260${String(10 + (i % 90)).padStart(2,'0')}`,
    phone: `98${String(10000000 + i).padStart(8,'0')}`,
    email: i % 3 === 0 ? `${name.split(' ')[0].toLowerCase()}${2010 - Number(cls)}@gmail.com` : undefined,
    status: i < 48 ? 'Active' : 'Inactive',
    admissionDate: `${2020 + (i % 5)}-04-01`,
    fatherName: `Mr. ${name.split(' ')[1]} Sr.`,
    fatherOccupation: ['Engineer','Doctor','Teacher','Businessman','Government Employee'][i % 5],
    fatherPhone: `97${String(10000000 + i + 100).padStart(8,'0')}`,
    fatherEmail: i % 4 === 0 ? `father${i}@gmail.com` : undefined,
    motherName: `Mrs. Anita ${name.split(' ')[1]}`,
    motherOccupation: ['Homemaker','Teacher','Doctor','Business','NGO Worker'][i % 5],
    motherPhone: `96${String(10000000 + i + 200).padStart(8,'0')}`,
    motherEmail: i % 5 === 0 ? `mother${i}@gmail.com` : undefined,
    busRoute: i % 3 === 0 ? `Route ${(i % 5) + 1}` : undefined,
    busStop: i % 3 === 0 ? ['Hazratganj','Charbagh','Alambagh','Aminabad','Gomti Nagar'][i % 5] : undefined,
    attendance: {
      present: presentDays,
      absent: totalDays - presentDays,
      total: totalDays,
      percentage: Math.round((presentDays / totalDays) * 100),
    },
    fees: { totalFee: feeTotal, paidAmount: paid, dueAmount: due, status },
  }
})

// ────────────────────────────────────────────────────────────────
// Staff (25 members)
// ────────────────────────────────────────────────────────────────

const staffData = [
  { name: 'Dr. Sunita Sharma', designation: 'Principal', dept: 'Administration', subjects: [] as string[], classes: [] as string[] },
  { name: 'Mr. Ramesh Gupta', designation: 'Vice Principal', dept: 'Administration', subjects: [] as string[], classes: [] as string[] },
  { name: 'Mrs. Kavita Singh', designation: 'Senior Teacher', dept: 'Science', subjects: ['Physics','Chemistry'], classes: ['11','12'] },
  { name: 'Mr. Anil Kumar', designation: 'Teacher', dept: 'Mathematics', subjects: ['Mathematics'], classes: ['9','10','11','12'] },
  { name: 'Mrs. Priya Rani', designation: 'Teacher', dept: 'English', subjects: ['English'], classes: ['6','7','8'] },
  { name: 'Mr. Sunil Sharma', designation: 'Teacher', dept: 'Hindi', subjects: ['Hindi'], classes: ['1','2','3','4','5'] },
  { name: 'Mrs. Meena Tiwari', designation: 'Teacher', dept: 'Science', subjects: ['Science','Biology'], classes: ['6','7','8','9','10'] },
  { name: 'Mr. Dinesh Verma', designation: 'Teacher', dept: 'Social Science', subjects: ['Social Science','History'], classes: ['6','7','8'] },
  { name: 'Mrs. Rekha Mishra', designation: 'Teacher', dept: 'Computer Science', subjects: ['Computer Science'], classes: ['9','10','11','12'] },
  { name: 'Mr. Pramod Pandey', designation: 'Teacher', dept: 'Mathematics', subjects: ['Mathematics'], classes: ['1','2','3','4','5'] },
  { name: 'Mrs. Savita Dubey', designation: 'Teacher', dept: 'English', subjects: ['English'], classes: ['9','10','11','12'] },
  { name: 'Mr. Rajendra Yadav', designation: 'Teacher', dept: 'Geography', subjects: ['Geography','Social Science'], classes: ['9','10'] },
  { name: 'Mrs. Anita Bajpai', designation: 'Teacher', dept: 'Economics', subjects: ['Economics'], classes: ['11','12'] },
  { name: 'Mr. Vinod Chandra', designation: 'Physical Education', dept: 'Sports', subjects: ['Physical Education'], classes: ['1','2','3','4','5','6','7','8','9','10','11','12'] },
  { name: 'Mrs. Geeta Shukla', designation: 'Primary Teacher', dept: 'Primary', subjects: ['English','Hindi','Mathematics'], classes: ['1','2','3'] },
  { name: 'Mr. Ashok Nair', designation: 'Primary Teacher', dept: 'Primary', subjects: ['Science','Social Science'], classes: ['4','5'] },
  { name: 'Mrs. Usha Kapoor', designation: 'Librarian', dept: 'Library', subjects: [] as string[], classes: [] as string[] },
  { name: 'Mr. Ravi Trivedi', designation: 'Accountant', dept: 'Finance', subjects: [] as string[], classes: [] as string[] },
  { name: 'Mrs. Nisha Awasthi', designation: 'HR Manager', dept: 'HR', subjects: [] as string[], classes: [] as string[] },
  { name: 'Mr. Sanjay Tyagi', designation: 'Transport Manager', dept: 'Transport', subjects: [] as string[], classes: [] as string[] },
  { name: 'Mrs. Seema Malhotra', designation: 'Receptionist', dept: 'Administration', subjects: [] as string[], classes: [] as string[] },
  { name: 'Mr. Vijay Kumar', designation: 'Lab Assistant', dept: 'Science', subjects: [] as string[], classes: [] as string[] },
  { name: 'Mrs. Pooja Tripathi', designation: 'Teacher', dept: 'Arts', subjects: ['Drawing','Arts'], classes: ['1','2','3','4','5','6'] },
  { name: 'Mr. Naresh Srivastava', designation: 'IT Support', dept: 'IT', subjects: [] as string[], classes: [] as string[] },
  { name: 'Mrs. Lata Joshi', designation: 'Nurse', dept: 'Medical', subjects: [] as string[], classes: [] as string[] },
]

const qualifications = [
  'M.Phil + B.Ed', 'M.Sc + B.Ed', 'M.A + B.Ed', 'B.Tech + B.Ed',
  'MBA', 'M.Com', 'B.Lib.Sc', 'B.Ed', 'M.Ed', 'Ph.D',
]

export const STAFF: StaffMember[] = staffData.map((s, i) => ({
  id: `STF${String(i + 1).padStart(3, '0')}`,
  empId: `HCS/EMP/${String(2001 + i).padStart(4,'0')}`,
  name: s.name,
  designation: s.designation,
  department: s.dept,
  subjects: s.subjects,
  qualification: qualifications[i % qualifications.length],
  experience: randomBetween(2, 25),
  phone: `98${String(20000000 + i).padStart(8,'0')}`,
  email: `${s.name.split(' ').pop()?.toLowerCase()}${i}@holychildschool.edu.in`,
  address: `${20 + i}, Civil Lines, Lucknow`,
  dob: `${1970 + (i % 20)}-${String((i % 12) + 1).padStart(2,'0')}-15`,
  gender: i % 3 === 0 ? 'Male' : 'Female',
  joinDate: `${2000 + (i % 15)}-07-01`,
  salary: [45000, 52000, 60000, 75000, 85000, 95000][i % 6],
  status: i < 24 ? 'Active' : 'On Leave',
  classes: s.classes,
  attendance: {
    present: randomBetween(55, 62),
    total: 62,
    percentage: randomBetween(88, 100),
  },
}))

// ────────────────────────────────────────────────────────────────
// Fee Structures
// ────────────────────────────────────────────────────────────────

export const FEE_STRUCTURES: FeeStructure[] = [
  {
    id: 'FS001',
    tier: 'Primary',
    classes: ['1','2','3','4','5'],
    tuition: 3000,
    transport: 800,
    library: 200,
    lab: 0,
    sports: 300,
    misc: 200,
    total: 4500,
    frequency: 'Monthly',
  },
  {
    id: 'FS002',
    tier: 'Middle School',
    classes: ['6','7','8'],
    tuition: 3800,
    transport: 800,
    library: 250,
    lab: 300,
    sports: 350,
    misc: 300,
    total: 5800,
    frequency: 'Monthly',
  },
  {
    id: 'FS003',
    tier: 'Secondary',
    classes: ['9','10'],
    tuition: 4800,
    transport: 800,
    library: 300,
    lab: 500,
    sports: 400,
    misc: 400,
    total: 7200,
    frequency: 'Monthly',
  },
  {
    id: 'FS004',
    tier: 'Senior Secondary',
    classes: ['11','12'],
    tuition: 6000,
    transport: 800,
    library: 400,
    lab: 800,
    sports: 400,
    misc: 600,
    total: 9000,
    frequency: 'Monthly',
  },
]

// ────────────────────────────────────────────────────────────────
// Fee Payments (recent 3 months)
// ────────────────────────────────────────────────────────────────

const paymentModes = ['Cash','Online','UPI','Cheque'] as const
const collectorNames = ['Mr. Ravi Trivedi','Mrs. Seema Malhotra']

export const FEE_PAYMENTS: FeePayment[] = Array.from({ length: 60 }, (_, i) => {
  const student = STUDENTS[i % 50]
  const feeStructure = FEE_STRUCTURES.find(f => f.classes.includes(student.class)) || FEE_STRUCTURES[0]
  const daysBack = i * 2
  return {
    id: `PAY${String(i + 1).padStart(4,'0')}`,
    receiptNo: `HCS/REC/2025/${String(1001 + i).padStart(4,'0')}`,
    studentId: student.id,
    studentName: student.name,
    class: student.class,
    section: student.section,
    amount: feeStructure.total,
    heads: [
      { name: 'Tuition Fee', amount: feeStructure.tuition },
      { name: 'Transport Fee', amount: feeStructure.transport },
      { name: 'Library Fee', amount: feeStructure.library },
      { name: 'Sports Fee', amount: feeStructure.sports },
    ],
    paymentMode: paymentModes[i % 4],
    transactionId: i % 2 === 0 ? `TXN${String(100000 + i).padStart(6,'0')}` : undefined,
    paymentDate: daysAgo(daysBack),
    collectedBy: collectorNames[i % 2],
    status: 'Paid',
  }
})

// ────────────────────────────────────────────────────────────────
// Attendance Records (60 days for all 50 students)
// ────────────────────────────────────────────────────────────────

export const ATTENDANCE_RECORDS: AttendanceRecord[] = []

for (let day = 0; day < 60; day++) {
  const date = daysAgo(day)
  const dow = new Date(date).getDay()
  if (dow === 0) continue // skip Sundays

  STUDENTS.forEach((student) => {
    const rand = Math.random()
    let status: AttendanceRecord['status'] = 'Present'
    if (rand < 0.08) status = 'Absent'
    else if (rand < 0.11) status = 'Late'
    else if (rand < 0.13) status = 'Leave'

    ATTENDANCE_RECORDS.push({ studentId: student.id, date, status })
  })
}

// ────────────────────────────────────────────────────────────────
// Exam Schedules
// ────────────────────────────────────────────────────────────────

const subjectsByClass: Record<string, string[]> = {
  '1': ['English','Hindi','Mathematics'],
  '2': ['English','Hindi','Mathematics'],
  '3': ['English','Hindi','Mathematics','Environmental Studies'],
  '4': ['English','Hindi','Mathematics','Environmental Studies'],
  '5': ['English','Hindi','Mathematics','Science','Social Science'],
  '6': ['English','Hindi','Mathematics','Science','Social Science','Computer Science'],
  '7': ['English','Hindi','Mathematics','Science','Social Science','Computer Science'],
  '8': ['English','Hindi','Mathematics','Science','Social Science','Computer Science'],
  '9': ['English','Hindi','Mathematics','Science','Social Science'],
  '10': ['English','Hindi','Mathematics','Science','Social Science'],
  '11': ['English','Mathematics','Physics','Chemistry','Computer Science'],
  '12': ['English','Mathematics','Physics','Chemistry','Computer Science'],
}

export const EXAM_SCHEDULES: ExamSchedule[] = []
const examDates = [daysAgo(-10), daysAgo(-9), daysAgo(-8), daysAgo(-7), daysAgo(-6)]

CLASSES.forEach((cls) => {
  const subjects = subjectsByClass[cls] || ['English','Mathematics']
  subjects.forEach((subj, si) => {
    EXAM_SCHEDULES.push({
      id: `EX${cls}${si}`,
      term: 'Term 1',
      subject: subj,
      class: cls,
      date: examDates[si % 5],
      startTime: '09:00',
      endTime: '12:00',
      maxMarks: 100,
      roomNo: `Room ${10 + si}`,
      invigilator: STAFF[si % 10].name,
    })
  })
})

// ────────────────────────────────────────────────────────────────
// Exam Results
// ────────────────────────────────────────────────────────────────

export const EXAM_RESULTS: ExamResult[] = []

STUDENTS.forEach((student, si) => {
  const subjects = subjectsByClass[student.class] || ['English','Mathematics']
  subjects.forEach((subj, sj) => {
    ;(['Term 1'] as const).forEach((term) => {
      const maxMarks = 100
      const base = randomBetween(45, 98)
      const obtainedMarks = Math.min(base + (si % 10), 100)
      EXAM_RESULTS.push({
        id: `RES${student.id}${sj}`,
        studentId: student.id,
        studentName: student.name,
        class: student.class,
        section: student.section,
        term,
        subject: subj,
        maxMarks,
        obtainedMarks,
        grade: gradeFromMarks(obtainedMarks, maxMarks),
      })
    })
  })
})

// ────────────────────────────────────────────────────────────────
// Library Books (100 books)
// ────────────────────────────────────────────────────────────────

const bookTitles = [
  'Mathematics NCERT Class 10','English Literature Anthology','Physics Part I',
  'Chemistry Part II','Biology NCERT','History of India','Geography World',
  'Computer Science Python','Economics Principles','Social Science Civil',
  'The Alchemist','To Kill a Mockingbird','Animal Farm','Lord of the Flies',
  'The Diary of a Young Girl','Harry Potter and the Sorcerers Stone',
  'Wings of Fire - APJ Abdul Kalam','My Experiments with Truth - Mahatma Gandhi',
  'Ignited Minds','The Discovery of India','India After Gandhi',
  'A Brief History of Time','Cosmos - Carl Sagan','The Selfish Gene',
  'Sapiens: A Brief History of Humankind','Thinking Fast and Slow',
  'Rich Dad Poor Dad','The 7 Habits of Highly Effective People',
  'How to Win Friends and Influence People','Zero to One',
  'The Lean Startup','Deep Work','Atomic Habits','Grit',
  'Mindset','Drive','Flow','Emotional Intelligence',
  'The Power of Now','Man Search for Meaning',
  'Sanskrit Primer','Yoga Sutras','Bhagavad Gita Commentary',
  'Indian Art and Culture','Environmental Science Today',
  'Fundamentals of Accounting','Business Studies Class 12',
  'Legal Studies Class 12','Psychology Class 12','Sociology Class 12',
  'Political Science Democratic Politics','Introduction to AI',
  'Data Structures and Algorithms','Web Development Basics',
  'Competitive Mathematics','Olympiad Science Problems',
  'English Grammar and Composition','Hindi Vyakaran','Sanskrit Reader',
  'Atlas of India','World Atlas','Encyclopedia Britannica Vol.1',
  'Encyclopedia Britannica Vol.2','Illustrated Science','Junior Encyclopedia',
  'Story of Science','Adventures in Mathematics','Puzzles and Brainteasers',
  'Classic Tales for Children','Panchatantra Stories','Jataka Tales',
  'Akbar Birbal Stories','Tenali Rama Stories','Sudama Charitra',
  'Ramcharitmanas','Mahabharata (Children Edition)','Ramayana (Children Edition)',
  'Short Stories - RK Narayan','Malgudi Days','The Guide',
  'Godan - Munshi Premchand','Nirmala','Gaban',
  'Train to Pakistan - Khushwant Singh','Midnight Children',
  'The Namesake','Interpreter of Maladies','A Suitable Boy',
  'The White Tiger','Five Point Someone','Revolution 2020',
  'Ikigai','The Monk Who Sold His Ferrari','Who Moved My Cheese',
  'Art of War','Chanakya Neeti','Arthashastra',
  'India Vision 2035','Digital India','Future of Education',
  'Sports Legends of India','Olympic Champions','Cricket My Style - Kapil Dev',
  'Drawing for Beginners','Music Theory','Dance Forms of India',
]

const bookCategories = [
  'Textbook','Literature','Science','History','Computer Science',
  'Self-Help','Philosophy','Fiction','Reference','Arts',
]
const publishers = ['NCERT','Oxford','Pearson','S. Chand','Arihant','Disha','Penguin','HarperCollins']

export const LIBRARY_BOOKS: LibraryBook[] = bookTitles.map((title, i) => ({
  id: `BK${String(i + 1).padStart(4,'0')}`,
  accessionNo: `HCS/LIB/${String(2001 + i).padStart(4,'0')}`,
  title,
  author: ['NCERT','RD Sharma','Lakhmir Singh','HC Verma','RS Aggarwal','Various Authors'][i % 6],
  isbn: `978-${String(81 + (i % 20))}-${String(i).padStart(4,'0')}-${i % 10}`,
  publisher: publishers[i % publishers.length],
  publishYear: 2015 + (i % 10),
  category: bookCategories[i % bookCategories.length],
  copies: randomBetween(2, 6),
  available: i % 5 === 0 ? 0 : randomBetween(1, 4),
  status: i % 5 === 0 ? 'Issued' : 'Available',
  issuedTo: i % 5 === 0 ? STUDENTS[i % 50].name : undefined,
  issuedStudentId: i % 5 === 0 ? STUDENTS[i % 50].id : undefined,
  issueDate: i % 5 === 0 ? daysAgo(12) : undefined,
  dueDate: i % 5 === 0 ? daysAgo(-2) : undefined,
  finePerDay: 2,
}))

export const BOOK_ISSUES: BookIssue[] = LIBRARY_BOOKS.filter(b => b.status === 'Issued').map((book, i) => ({
  id: `BI${String(i + 1).padStart(3,'0')}`,
  bookId: book.id,
  bookTitle: book.title,
  studentId: book.issuedStudentId!,
  studentName: book.issuedTo!,
  issueDate: book.issueDate!,
  dueDate: book.dueDate!,
  fine: i % 3 === 0 ? randomBetween(4, 20) : 0,
  status: 'Issued' as const,
}))

// ────────────────────────────────────────────────────────────────
// Bus Routes (5 routes)
// ────────────────────────────────────────────────────────────────

export const BUS_ROUTES: BusRoute[] = [
  {
    id: 'RT001', routeNo: 'R-01', name: 'Hazratganj – Civil Lines',
    driver: 'Ramesh Yadav', driverPhone: '9876543210', busNo: 'UP32AB1234',
    busCapacity: 50,
    stops: [
      { name: 'Hazratganj Chowk', time: '7:00 AM', studentsCount: 8 },
      { name: 'GPO Crossing', time: '7:10 AM', studentsCount: 6 },
      { name: 'High Court', time: '7:20 AM', studentsCount: 4 },
      { name: 'Civil Lines Market', time: '7:30 AM', studentsCount: 10 },
    ],
    studentsCount: 28, status: 'Active',
  },
  {
    id: 'RT002', routeNo: 'R-02', name: 'Aliganj – Gomti Nagar',
    driver: 'Suresh Verma', driverPhone: '9876543211', busNo: 'UP32CD5678',
    busCapacity: 45,
    stops: [
      { name: 'Aliganj Sector D', time: '7:00 AM', studentsCount: 7 },
      { name: 'Gomti Nagar Phase 1', time: '7:15 AM', studentsCount: 9 },
      { name: 'Gomti Nagar Phase 2', time: '7:25 AM', studentsCount: 5 },
    ],
    studentsCount: 21, status: 'Active',
  },
  {
    id: 'RT003', routeNo: 'R-03', name: 'Indira Nagar – Vikas Nagar',
    driver: 'Ajay Prasad', driverPhone: '9876543212', busNo: 'UP32EF9012',
    busCapacity: 50,
    stops: [
      { name: 'Indira Nagar Sec 7', time: '7:05 AM', studentsCount: 8 },
      { name: 'Indira Nagar Sec 12', time: '7:15 AM', studentsCount: 6 },
      { name: 'Vikas Nagar', time: '7:30 AM', studentsCount: 10 },
    ],
    studentsCount: 24, status: 'Active',
  },
  {
    id: 'RT004', routeNo: 'R-04', name: 'Alambagh – Charbagh',
    driver: 'Mohan Singh', driverPhone: '9876543213', busNo: 'UP32GH3456',
    busCapacity: 40,
    stops: [
      { name: 'Alambagh', time: '6:55 AM', studentsCount: 6 },
      { name: 'Nishatganj', time: '7:10 AM', studentsCount: 7 },
      { name: 'Charbagh', time: '7:25 AM', studentsCount: 5 },
    ],
    studentsCount: 18, status: 'Active',
  },
  {
    id: 'RT005', routeNo: 'R-05', name: 'Rajaji Puram – Aminabad',
    driver: 'Dinesh Kumar', driverPhone: '9876543214', busNo: 'UP32IJ7890',
    busCapacity: 45,
    stops: [
      { name: 'Rajaji Puram', time: '7:00 AM', studentsCount: 9 },
      { name: 'Aminabad', time: '7:20 AM', studentsCount: 8 },
    ],
    studentsCount: 17, status: 'Active',
  },
]

// ────────────────────────────────────────────────────────────────
// Circulars (30 circulars)
// ────────────────────────────────────────────────────────────────

const circularData = [
  { title: 'Annual Day Celebration – 15 August 2025', important: true, roles: ['all'] },
  { title: 'Parent-Teacher Meeting – 20 June 2025', important: true, roles: ['parent','teacher'] },
  { title: 'Summer Vacation Schedule 2025', important: true, roles: ['all'] },
  { title: 'Revised Examination Timetable – Term 1', important: true, roles: ['student','parent','teacher'] },
  { title: 'School Sports Day Registration Open', important: false, roles: ['student','parent'] },
  { title: 'Mid-Term Fee Reminder – Due 30 June', important: true, roles: ['parent'] },
  { title: 'Science Exhibition – Entry Form Due 5 July', important: false, roles: ['student','teacher'] },
  { title: 'Staff Training Workshop – 25 June', important: false, roles: ['teacher','principal'] },
  { title: 'Library Membership Drive 2025-26', important: false, roles: ['student','parent'] },
  { title: 'Computer Lab Upgrade – New Software Installed', important: false, roles: ['teacher','student'] },
  { title: 'Holiday List 2025-26 Academic Year', important: true, roles: ['all'] },
  { title: 'School Bus Route Revision – Effective July 2025', important: true, roles: ['parent','student'] },
  { title: 'Uniform Policy – Strict Enforcement from June 15', important: false, roles: ['student','parent'] },
  { title: 'Digital Library Resources Now Available', important: false, roles: ['student','teacher'] },
  { title: 'Yoga Day Celebration – 21 June', important: false, roles: ['all'] },
  { title: 'No Bag Day – Every Last Saturday', important: false, roles: ['student','parent'] },
  { title: 'COVID Safety Protocols Reminder', important: false, roles: ['all'] },
  { title: 'Scholarship Examination – Applications Open', important: true, roles: ['student','parent'] },
  { title: 'Teacher Recruitment – Applications Invited', important: false, roles: ['all'] },
  { title: 'School Magazine – Content Submission Deadline 30 June', important: false, roles: ['student','teacher'] },
  { title: 'Safe Internet Day Awareness Program', important: false, roles: ['student','parent'] },
  { title: 'Blood Donation Camp – July 10', important: false, roles: ['staff'] },
  { title: 'Environmental Day – Plantation Drive', important: false, roles: ['student','teacher'] },
  { title: 'New Canteen Menu from July 2025', important: false, roles: ['student','parent'] },
  { title: 'Emergency Contact List Update Required', important: true, roles: ['parent'] },
  { title: 'Examination Leave Policy Clarification', important: false, roles: ['teacher','student'] },
  { title: 'CBSE Board Registration Guidelines 2025', important: true, roles: ['student','parent','teacher'] },
  { title: 'Fee Structure Revision 2025-26', important: true, roles: ['parent'] },
  { title: 'Anti-Bullying Policy Awareness Session', important: false, roles: ['student','parent','teacher'] },
  { title: "Principal's Message – New Academic Year", important: false, roles: ['all'] },
]

export const CIRCULARS: Circular[] = circularData.map((c, i) => ({
  id: `CIR${String(i + 1).padStart(3,'0')}`,
  title: c.title,
  content: `This is to inform all concerned that ${c.title.toLowerCase()}. Please take note and act accordingly. For any queries, contact the school administration.`,
  date: daysAgo(i * 3),
  publishedBy: i % 3 === 0 ? 'Dr. Sunita Sharma (Principal)' : 'School Administration',
  targetRoles: (c.roles[0] === 'all'
    ? ['super_admin','school_admin','principal','teacher','student','parent']
    : c.roles) as UserRole[],
  targetClasses: i % 4 === 0 ? ['9','10','11','12'] : undefined,
  isImportant: c.important,
}))

// ────────────────────────────────────────────────────────────────
// Help Desk Tickets (25 tickets)
// ────────────────────────────────────────────────────────────────

const ticketData = [
  { title: 'Projector not working in Room 12', cat: 'IT', priority: 'High' as const, status: 'Open' as const, role: 'teacher' as const },
  { title: 'Fee receipt not generated after payment', cat: 'Finance', priority: 'Critical' as const, status: 'In Progress' as const, role: 'parent' as const },
  { title: 'Attendance marked incorrectly for student STU005', cat: 'Academic', priority: 'Medium' as const, status: 'Resolved' as const, role: 'parent' as const },
  { title: 'Bus Route 3 delayed by 20 minutes regularly', cat: 'Transport', priority: 'High' as const, status: 'In Progress' as const, role: 'parent' as const },
  { title: 'Internet not working in Computer Lab', cat: 'IT', priority: 'High' as const, status: 'Open' as const, role: 'teacher' as const },
  { title: 'Library book not found in catalog', cat: 'Library', priority: 'Low' as const, status: 'Open' as const, role: 'student' as const },
  { title: 'Report card PDF not downloading', cat: 'IT', priority: 'Medium' as const, status: 'Resolved' as const, role: 'parent' as const },
  { title: 'Request for TC (Transfer Certificate)', cat: 'Admin', priority: 'Medium' as const, status: 'In Progress' as const, role: 'parent' as const },
  { title: 'Water cooler not working on 2nd floor', cat: 'Maintenance', priority: 'Medium' as const, status: 'Open' as const, role: 'teacher' as const },
  { title: 'Salary slip not received for May 2025', cat: 'Finance', priority: 'High' as const, status: 'Resolved' as const, role: 'teacher' as const },
  { title: 'Student lost school ID card', cat: 'Admin', priority: 'Low' as const, status: 'Closed' as const, role: 'student' as const },
  { title: 'Request to change section from 10A to 10B', cat: 'Academic', priority: 'Medium' as const, status: 'Open' as const, role: 'parent' as const },
  { title: 'CCTV camera in corridor not working', cat: 'Security', priority: 'High' as const, status: 'In Progress' as const, role: 'teacher' as const },
  { title: 'Fire extinguisher expired – Lab area', cat: 'Safety', priority: 'Critical' as const, status: 'Resolved' as const, role: 'teacher' as const },
  { title: 'Request for bonafide certificate', cat: 'Admin', priority: 'Low' as const, status: 'Resolved' as const, role: 'student' as const },
  { title: 'Printer not working in Staff Room', cat: 'IT', priority: 'Medium' as const, status: 'Open' as const, role: 'teacher' as const },
  { title: 'Overdue fine not cleared in system', cat: 'Library', priority: 'Low' as const, status: 'Open' as const, role: 'student' as const },
  { title: 'Request for marks rectification – Class 10', cat: 'Academic', priority: 'High' as const, status: 'In Progress' as const, role: 'parent' as const },
  { title: 'Canteen food quality complaint', cat: 'Admin', priority: 'Medium' as const, status: 'Closed' as const, role: 'parent' as const },
  { title: 'Air conditioner not working – Room 8', cat: 'Maintenance', priority: 'Medium' as const, status: 'Resolved' as const, role: 'teacher' as const },
  { title: 'Online fee payment failed – amount debited', cat: 'Finance', priority: 'Critical' as const, status: 'Resolved' as const, role: 'parent' as const },
  { title: 'Request for scholarship form', cat: 'Academic', priority: 'Low' as const, status: 'Closed' as const, role: 'student' as const },
  { title: 'Broken bench in Class 7B', cat: 'Maintenance', priority: 'Low' as const, status: 'Open' as const, role: 'teacher' as const },
  { title: 'Leave application not approved in system', cat: 'HR', priority: 'Medium' as const, status: 'In Progress' as const, role: 'teacher' as const },
  { title: 'Bulk SMS not delivered to parents', cat: 'Communication', priority: 'High' as const, status: 'In Progress' as const, role: 'school_admin' as const },
]

export const HELPDESK_TICKETS: HelpDeskTicket[] = ticketData.map((t, i) => ({
  id: `TKT${String(i + 1).padStart(4,'0')}`,
  ticketNo: `HCS/TKT/2025/${String(1001 + i).padStart(4,'0')}`,
  title: t.title,
  description: `Detailed description: ${t.title}. Please look into this matter at the earliest.`,
  category: t.cat,
  raisedBy: i % 3 === 0 ? 'Arjun Sharma (Parent)' : STUDENTS[i % 50].fatherName,
  raisedByRole: t.role,
  assignedTo: ['Mr. Naresh Srivastava','Mrs. Nisha Awasthi','Mr. Ravi Trivedi'][i % 3],
  status: t.status,
  priority: t.priority,
  createdAt: daysAgo(i * 2),
  updatedAt: daysAgo(i),
  resolvedAt: t.status === 'Resolved' || t.status === 'Closed' ? daysAgo(i - 1) : undefined,
}))

// ────────────────────────────────────────────────────────────────
// Homework
// ────────────────────────────────────────────────────────────────

const homeworkSubjects = ['Mathematics','English','Science','Hindi','Social Science','Computer Science']
const homeworkClasses = ['5','6','7','8','9','10']

export const HOMEWORK: Homework[] = homeworkClasses.flatMap((cls, ci) =>
  homeworkSubjects.slice(0, 4).map((subj, si) => ({
    id: `HW${cls}${si}`,
    title: `${subj} Assignment ${si + 1} – Chapter ${ci + si + 1}`,
    description: `Complete exercises from Chapter ${ci + si + 1}. Refer to NCERT textbook pages ${(ci + si) * 10 + 50}–${(ci + si) * 10 + 60}.`,
    subject: subj,
    class: cls,
    section: 'A',
    teacher: STAFF.find(s => s.subjects.includes(subj))?.name || STAFF[3].name,
    assignedDate: daysAgo(3),
    dueDate: daysAgo(-2),
    submissions: randomBetween(18, 35),
    total: 40,
  }))
)

// ────────────────────────────────────────────────────────────────
// Inventory
// ────────────────────────────────────────────────────────────────

const inventoryData = [
  { name: 'Desktop Computer', cat: 'IT Equipment', qty: 45, min: 40, unit: 'Units', cost: 35000, loc: 'Computer Lab' },
  { name: 'Laptop (Staff)', cat: 'IT Equipment', qty: 12, min: 10, unit: 'Units', cost: 55000, loc: 'Staff Room' },
  { name: 'Projector', cat: 'IT Equipment', qty: 8, min: 8, unit: 'Units', cost: 40000, loc: 'Various Rooms' },
  { name: 'Smart Board', cat: 'IT Equipment', qty: 5, min: 4, unit: 'Units', cost: 120000, loc: 'Rooms 1,3,5,7,9' },
  { name: 'Printer (Laser)', cat: 'IT Equipment', qty: 4, min: 3, unit: 'Units', cost: 25000, loc: 'Admin, Staff Room' },
  { name: 'School Desk (Student)', cat: 'Furniture', qty: 420, min: 400, unit: 'Units', cost: 3500, loc: 'Classrooms' },
  { name: 'Chair (Student)', cat: 'Furniture', qty: 420, min: 400, unit: 'Units', cost: 2000, loc: 'Classrooms' },
  { name: 'Teacher Table', cat: 'Furniture', qty: 30, min: 25, unit: 'Units', cost: 12000, loc: 'Classrooms' },
  { name: 'Whiteboard', cat: 'Furniture', qty: 28, min: 25, unit: 'Units', cost: 8000, loc: 'Classrooms' },
  { name: 'Almirah (Steel)', cat: 'Furniture', qty: 20, min: 15, unit: 'Units', cost: 15000, loc: 'Various' },
  { name: 'Physics Lab Equipment Set', cat: 'Lab Equipment', qty: 3, min: 2, unit: 'Sets', cost: 85000, loc: 'Physics Lab' },
  { name: 'Chemistry Lab Equipment Set', cat: 'Lab Equipment', qty: 3, min: 2, unit: 'Sets', cost: 75000, loc: 'Chemistry Lab' },
  { name: 'Biology Microscope', cat: 'Lab Equipment', qty: 20, min: 15, unit: 'Units', cost: 12000, loc: 'Biology Lab' },
  { name: 'Science Model Kit', cat: 'Lab Equipment', qty: 15, min: 10, unit: 'Sets', cost: 5000, loc: 'Science Store' },
  { name: 'A4 Paper Ream', cat: 'Stationery', qty: 45, min: 20, unit: 'Reams', cost: 350, loc: 'Store Room' },
  { name: 'Blue Pen (Box)', cat: 'Stationery', qty: 8, min: 5, unit: 'Box', cost: 250, loc: 'Store Room' },
  { name: 'Chalk Box (White)', cat: 'Stationery', qty: 12, min: 8, unit: 'Box', cost: 120, loc: 'Store Room' },
  { name: 'Marker Pen Set', cat: 'Stationery', qty: 3, min: 5, unit: 'Box', cost: 450, loc: 'Store Room' },
  { name: 'School Uniform Cloth (Meters)', cat: 'Miscellaneous', qty: 200, min: 50, unit: 'Meters', cost: 180, loc: 'Store Room' },
  { name: 'First Aid Kit', cat: 'Medical', qty: 6, min: 5, unit: 'Units', cost: 2500, loc: 'Medical Room, Floors' },
]

export const INVENTORY: InventoryItem[] = inventoryData.map((item, i) => ({
  id: `INV${String(i + 1).padStart(3,'0')}`,
  itemCode: `HCS/INV/${String(1001 + i).padStart(4,'0')}`,
  name: item.name,
  category: item.cat,
  quantity: item.qty,
  minStock: item.min,
  unit: item.unit,
  purchaseDate: `2024-${String((i % 12) + 1).padStart(2,'0')}-15`,
  supplier: ['Digital India Supplies','Furniture World','Lab Equip Co.','Rajendra Stores'][i % 4],
  cost: item.cost,
  location: item.loc,
  condition: (['Good','Good','Good','Fair','Good'] as const)[i % 5],
}))

// ────────────────────────────────────────────────────────────────
// Timetable (Class 10A)
// ────────────────────────────────────────────────────────────────

const periods = ['08:00–08:45','08:45–09:30','09:30–10:15','10:30–11:15','11:15–12:00','12:00–12:45']
const timetableData: Record<string, string[]> = {
  Monday:    ['Mathematics','English','Hindi','Science','Social Science','Computer Science'],
  Tuesday:   ['English','Mathematics','Science','Hindi','Computer Science','Social Science'],
  Wednesday: ['Hindi','Science','Mathematics','English','Social Science','Computer Science'],
  Thursday:  ['Science','Hindi','English','Mathematics','Computer Science','Social Science'],
  Friday:    ['Social Science','Computer Science','Mathematics','Science','English','Hindi'],
  Saturday:  ['Computer Science','Social Science','Hindi','English','Mathematics','Science'],
}

export const TIMETABLE: Period[] = DAYS.flatMap((day) =>
  periods.map((timeSlot, pi) => {
    const [start, end] = timeSlot.split('–')
    const subject = (timetableData[day] || [])[pi] || 'Free Period'
    const teacher = STAFF.find(s => s.subjects.includes(subject))?.name || STAFF[3].name
    return {
      day,
      periodNo: pi + 1,
      startTime: start,
      endTime: end,
      subject,
      teacher,
      class: '10',
      section: 'A',
      room: `Room ${pi + 10}`,
    }
  })
)

// ────────────────────────────────────────────────────────────────
// School Notifications
// ────────────────────────────────────────────────────────────────

export const SCHOOL_NOTIFICATIONS: SchoolNotification[] = [
  {
    id: 'N001', type: 'attendance_alert',
    title: 'Attendance Alert — 3 Students Below 75%',
    message: 'Arjun Sharma (Cl.5A), Priya Patel (Cl.8B), and Rahul Gupta (Cl.10A) have attendance below 75%.',
    time: '10 min ago', unread: true,
  },
  {
    id: 'N002', type: 'fee_due',
    title: 'Fee Due Reminder — 12 Students',
    message: '12 students have pending fee dues for June. Please follow up with respective parents.',
    time: '1 hour ago', unread: true,
  },
  {
    id: 'N003', type: 'circular',
    title: 'New Circular Published',
    message: 'Annual Day Celebration circular has been published. Please share with parents.',
    time: '2 hours ago', unread: true,
  },
  {
    id: 'N004', type: 'exam_result',
    title: 'Term 1 Results Published',
    message: 'Term 1 examination results have been uploaded for all classes.',
    time: '1 day ago', unread: false,
  },
  {
    id: 'N005', type: 'birthday',
    title: 'Student Birthday — Kavya Gupta',
    message: 'Today is Kavya Gupta\'s (Class 8B) birthday. Wish them well!',
    time: '2 days ago', unread: false,
  },
  {
    id: 'N006', type: 'leave_update',
    title: 'Leave Request Approved',
    message: 'Mrs. Kavita Singh\'s leave request for 20–22 June has been approved.',
    time: '3 days ago', unread: false,
  },
  {
    id: 'N007', type: 'system',
    title: 'System Maintenance Scheduled',
    message: 'System maintenance is scheduled for Sunday 6:00–8:00 AM. Service may be unavailable.',
    time: '4 days ago', unread: false,
  },
]

// ────────────────────────────────────────────────────────────────
// Demo Accounts for Login
// ────────────────────────────────────────────────────────────────

export const DEMO_ACCOUNTS: { role: UserRole; name: string; email: string; description: string }[] = [
  { role: 'super_admin',       name: 'Admin User',         email: 'admin@holychildschool.edu.in',        description: 'Full system access' },
  { role: 'school_admin',      name: 'School Admin',       email: 'schooladmin@holychildschool.edu.in',   description: 'School management' },
  { role: 'principal',         name: 'Dr. Sunita Sharma',  email: 'principal@holychildschool.edu.in',     description: 'Academic leadership' },
  { role: 'vice_principal',    name: 'Mr. Ramesh Gupta',   email: 'viceprincipal@holychildschool.edu.in', description: 'Deputy leadership' },
  { role: 'teacher',           name: 'Mrs. Kavita Singh',  email: 'teacher@holychildschool.edu.in',       description: 'Class teacher' },
  { role: 'student',           name: 'Arjun Sharma',       email: 'student@holychildschool.edu.in',       description: 'Class 10A' },
  { role: 'parent',            name: 'Mr. Sharma (Parent)',email: 'parent@holychildschool.edu.in',        description: "Arjun's parent" },
  { role: 'accountant',        name: 'Mr. Ravi Trivedi',   email: 'accounts@holychildschool.edu.in',      description: 'Finance department' },
  { role: 'librarian',         name: 'Mrs. Usha Kapoor',   email: 'library@holychildschool.edu.in',       description: 'Library management' },
  { role: 'transport_manager', name: 'Mr. Sanjay Tyagi',   email: 'transport@holychildschool.edu.in',     description: 'Bus & transport' },
  { role: 'hr_manager',        name: 'Mrs. Nisha Awasthi', email: 'hr@holychildschool.edu.in',            description: 'Staff management' },
  { role: 'receptionist',      name: 'Mrs. Seema Malhotra',email: 'reception@holychildschool.edu.in',     description: 'Front desk' },
]

// ────────────────────────────────────────────────────────────────
// Dashboard KPIs
// ────────────────────────────────────────────────────────────────

export const DASHBOARD_STATS = {
  totalStudents: 1247,
  totalStaff: 89,
  attendanceToday: 94.2,
  feeCollectedMonth: 1840000,
  feeTarget: 2350000,
  newAdmissions: 23,
  pendingFees: 420000,
  booksIssued: 127,
  openTickets: 8,
  classesRunning: 48,
}

export const MONTHLY_ENROLLMENT = [
  { month: 'Apr', students: 1180 },
  { month: 'May', students: 1215 },
  { month: 'Jun', students: 1230 },
  { month: 'Jul', students: 1247 },
  { month: 'Aug', students: 1247 },
  { month: 'Sep', students: 1247 },
  { month: 'Oct', students: 1250 },
  { month: 'Nov', students: 1252 },
  { month: 'Dec', students: 1252 },
]

export const CLASS_DISTRIBUTION = [
  { class: 'Class 1–2', students: 186 },
  { class: 'Class 3–5', students: 248 },
  { class: 'Class 6–8', students: 310 },
  { class: 'Class 9–10', students: 296 },
  { class: 'Class 11–12', students: 207 },
]

export const SUBJECT_PERFORMANCE = [
  { subject: 'Mathematics', avgScore: 72 },
  { subject: 'English', avgScore: 78 },
  { subject: 'Science', avgScore: 69 },
  { subject: 'Hindi', avgScore: 82 },
  { subject: 'Social Science', avgScore: 75 },
  { subject: 'Computer', avgScore: 85 },
]

export const MONTHLY_FEE_COLLECTION = [
  { month: 'Jan', collected: 2100000, target: 2300000 },
  { month: 'Feb', collected: 1950000, target: 2300000 },
  { month: 'Mar', collected: 2250000, target: 2300000 },
  { month: 'Apr', collected: 2300000, target: 2350000 },
  { month: 'May', collected: 2180000, target: 2350000 },
  { month: 'Jun', collected: 1840000, target: 2350000 },
]

export const ATTENDANCE_TREND = DAYS.slice(0, 5).map((day, i) => ({
  day,
  present: randomBetween(88, 97),
  absent: randomBetween(3, 12),
}))
