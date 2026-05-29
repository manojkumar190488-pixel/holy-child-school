// ============================================================
// School ERP — Domain Types
// ============================================================

export type UserRole =
  | 'super_admin'
  | 'school_admin'
  | 'principal'
  | 'vice_principal'
  | 'teacher'
  | 'student'
  | 'parent'
  | 'accountant'
  | 'librarian'
  | 'transport_manager'
  | 'hr_manager'
  | 'receptionist'

export type Gender = 'Male' | 'Female' | 'Other'
export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-'
export type StudentCategory = 'General' | 'OBC' | 'SC' | 'ST'
export type StudentStatus = 'Active' | 'Inactive' | 'Alumni' | 'Transfer'
export type AttendanceStatus = 'Present' | 'Absent' | 'Late' | 'Leave'
export type TicketStatus = 'Open' | 'In Progress' | 'Resolved' | 'Closed'
export type TicketPriority = 'Low' | 'Medium' | 'High' | 'Critical'
export type LeaveStatus = 'Pending' | 'Approved' | 'Rejected'
export type PaymentStatus = 'Paid' | 'Partial' | 'Due' | 'Overdue'
export type BookStatus = 'Available' | 'Issued' | 'Reserved' | 'Lost'
export type ExamTerm = 'Term 1' | 'Term 2' | 'Annual'

// ============================================================
// Auth / Session
// ============================================================

export interface SchoolUser {
  id: string
  name: string
  email: string
  role: UserRole
  avatar?: string
  phone?: string
  employeeId?: string
  studentId?: string
  classSection?: string
}

// ============================================================
// Students
// ============================================================

export interface Student {
  id: string
  admissionNo: string
  rollNo: number
  name: string
  class: string
  section: string
  gender: Gender
  dob: string
  age: number
  bloodGroup: BloodGroup
  category: StudentCategory
  religion: string
  motherTongue: string
  aadhar: string
  address: string
  city: string
  pincode: string
  phone: string
  email?: string
  photo?: string
  status: StudentStatus
  admissionDate: string
  fatherName: string
  fatherOccupation: string
  fatherPhone: string
  fatherEmail?: string
  motherName: string
  motherOccupation: string
  motherPhone: string
  motherEmail?: string
  busRoute?: string
  busStop?: string
  previousSchool?: string
  tcNumber?: string
  attendance: {
    present: number
    absent: number
    total: number
    percentage: number
  }
  fees: {
    totalFee: number
    paidAmount: number
    dueAmount: number
    status: PaymentStatus
  }
}

// ============================================================
// Staff
// ============================================================

export interface StaffMember {
  id: string
  empId: string
  name: string
  designation: string
  department: string
  subjects: string[]
  qualification: string
  experience: number
  phone: string
  email: string
  address: string
  dob: string
  gender: Gender
  joinDate: string
  salary: number
  bankAccount?: string
  pan?: string
  aadhar?: string
  status: 'Active' | 'Inactive' | 'On Leave'
  photo?: string
  classes?: string[]
  attendance?: {
    present: number
    total: number
    percentage: number
  }
}

// ============================================================
// Fees
// ============================================================

export interface FeeStructure {
  id: string
  tier: string
  classes: string[]
  tuition: number
  transport: number
  library: number
  lab: number
  sports: number
  misc: number
  total: number
  frequency: 'Monthly' | 'Quarterly' | 'Annual'
}

export interface FeePayment {
  id: string
  receiptNo: string
  studentId: string
  studentName: string
  class: string
  section: string
  amount: number
  heads: { name: string; amount: number }[]
  paymentMode: 'Cash' | 'Online' | 'Cheque' | 'DD' | 'UPI'
  transactionId?: string
  paymentDate: string
  collectedBy: string
  remarks?: string
  status: PaymentStatus
}

export interface FeeHead {
  id: string
  name: string
  description: string
  amount: number
  isOptional: boolean
  applicableClasses: string[]
}

// ============================================================
// Attendance
// ============================================================

export interface AttendanceRecord {
  studentId: string
  date: string
  status: AttendanceStatus
  remarks?: string
}

export interface DailyAttendance {
  date: string
  classId: string
  section: string
  records: AttendanceRecord[]
  markedBy: string
  markedAt: string
}

// ============================================================
// Examinations
// ============================================================

export interface ExamSchedule {
  id: string
  term: ExamTerm
  subject: string
  class: string
  date: string
  startTime: string
  endTime: string
  maxMarks: number
  roomNo: string
  invigilator: string
}

export interface ExamResult {
  id: string
  studentId: string
  studentName: string
  class: string
  section: string
  term: ExamTerm
  subject: string
  maxMarks: number
  obtainedMarks: number
  grade: string
  remarks?: string
}

// ============================================================
// Timetable
// ============================================================

export interface Period {
  day: string
  periodNo: number
  startTime: string
  endTime: string
  subject: string
  teacher: string
  class: string
  section: string
  room: string
}

// ============================================================
// Library
// ============================================================

export interface LibraryBook {
  id: string
  accessionNo: string
  title: string
  author: string
  isbn?: string
  publisher: string
  publishYear: number
  category: string
  copies: number
  available: number
  status: BookStatus
  issuedTo?: string
  issuedStudentId?: string
  issueDate?: string
  dueDate?: string
  finePerDay: number
}

export interface BookIssue {
  id: string
  bookId: string
  bookTitle: string
  studentId: string
  studentName: string
  issueDate: string
  dueDate: string
  returnDate?: string
  fine: number
  status: 'Issued' | 'Returned' | 'Overdue'
}

// ============================================================
// Transport
// ============================================================

export interface BusRoute {
  id: string
  routeNo: string
  name: string
  driver: string
  driverPhone: string
  busNo: string
  busCapacity: number
  stops: BusStop[]
  studentsCount: number
  status: 'Active' | 'Inactive'
}

export interface BusStop {
  name: string
  time: string
  studentsCount: number
}

// ============================================================
// Circulars
// ============================================================

export interface Circular {
  id: string
  title: string
  content: string
  date: string
  publishedBy: string
  targetRoles: UserRole[]
  targetClasses?: string[]
  isImportant: boolean
  attachments?: string[]
}

// ============================================================
// Help Desk
// ============================================================

export interface HelpDeskTicket {
  id: string
  ticketNo: string
  title: string
  description: string
  category: string
  raisedBy: string
  raisedByRole: UserRole
  assignedTo?: string
  status: TicketStatus
  priority: TicketPriority
  createdAt: string
  updatedAt: string
  resolvedAt?: string
}

// ============================================================
// Homework / Assignments
// ============================================================

export interface Homework {
  id: string
  title: string
  description: string
  subject: string
  class: string
  section: string
  teacher: string
  assignedDate: string
  dueDate: string
  submissions: number
  total: number
}

// ============================================================
// Inventory
// ============================================================

export interface InventoryItem {
  id: string
  itemCode: string
  name: string
  category: string
  quantity: number
  minStock: number
  unit: string
  purchaseDate?: string
  supplier?: string
  cost: number
  location: string
  condition: 'Good' | 'Fair' | 'Poor' | 'Damaged'
}

// ============================================================
// Notifications
// ============================================================

export type SchoolNotificationType =
  | 'fee_due'
  | 'attendance_alert'
  | 'exam_result'
  | 'circular'
  | 'birthday'
  | 'leave_update'
  | 'homework'
  | 'system'

export interface SchoolNotification {
  id: string
  type: SchoolNotificationType
  title: string
  message: string
  time: string
  unread: boolean
  targetRole?: UserRole
  link?: string
}

// ============================================================
// Dashboard / Analytics
// ============================================================

export interface DashboardStats {
  totalStudents: number
  totalStaff: number
  attendanceToday: number
  feeCollectedMonth: number
  newAdmissions: number
  pendingFees: number
  booksIssued: number
  openTickets: number
}
